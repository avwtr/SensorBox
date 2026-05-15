use serde::Serialize;
use serialport::SerialPortType;
use std::io::{BufRead, BufReader};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use tauri::{AppHandle, Emitter, State};

const BAUD_RATE: u32 = 115200;

/// USB vendor IDs used by common Sensor Box serial bridges.
const SENSOR_BOX_VIDS: &[u16] = &[0x10c4, 0x303a, 0x1a86, 0x0403];

#[derive(Clone, Serialize)]
pub struct PortInfo {
    pub name: String,
    pub description: String,
    pub likely_sensor_box: bool,
    pub is_callout: bool,
    pub vid: Option<u16>,
    pub pid: Option<u16>,
}

pub struct SerialState {
    stop_flag: Arc<AtomicBool>,
    thread_handle: Mutex<Option<thread::JoinHandle<()>>>,
}

impl Default for SerialState {
    fn default() -> Self {
        Self {
            stop_flag: Arc::new(AtomicBool::new(false)),
            thread_handle: Mutex::new(None),
        }
    }
}

impl SerialState {
    pub fn disconnect(&self) {
        self.stop_reader();
    }

    fn stop_reader(&self) {
        self.stop_flag.store(true, Ordering::SeqCst);
        if let Ok(mut guard) = self.thread_handle.lock() {
            if let Some(handle) = guard.take() {
                let _ = handle.join();
            }
        }
        self.stop_flag.store(false, Ordering::SeqCst);
    }
}

#[tauri::command]
pub fn list_serial_ports() -> Result<Vec<PortInfo>, String> {
    serialport::available_ports()
        .map_err(|e| e.to_string())
        .map(|ports| ports.into_iter().map(port_info).collect())
}

fn port_info(p: serialport::SerialPortInfo) -> PortInfo {
    let (description, vid, pid, likely_usb) = match &p.port_type {
        SerialPortType::UsbPort(info) => {
            let vid = info.vid;
            let pid = info.pid;
            let product = info
                .product
                .as_deref()
                .or(info.serial_number.as_deref())
                .unwrap_or("USB serial");
            (
                format!("{product} (VID:{vid:04x} PID:{pid:04x})"),
                Some(vid),
                Some(pid),
                SENSOR_BOX_VIDS.contains(&vid),
            )
        }
        SerialPortType::BluetoothPort => ("Bluetooth".to_string(), None, None, false),
        SerialPortType::PciPort => ("PCI / system".to_string(), None, None, false),
        SerialPortType::Unknown => ("Serial".to_string(), None, None, false),
    };

    let is_callout = p.port_name.contains("/dev/cu.")
        || p.port_name.starts_with("COM")
        || !p.port_name.contains("/dev/tty.");

    let name_lower = p.port_name.to_lowercase();
    let desc_lower = description.to_lowercase();
    let ignore = name_lower.contains("bluetooth")
        || name_lower.contains("debug-console")
        || desc_lower.contains("bluetooth")
        || desc_lower.contains("pci");

    let chip_hint = desc_lower.contains("cp210")
        || desc_lower.contains("ch340")
        || desc_lower.contains("ftdi")
        || desc_lower.contains("esp32")
        || desc_lower.contains("uart bridge")
        || name_lower.contains("usbserial")
        || name_lower.contains("usbmodem");

    PortInfo {
        name: p.port_name,
        description,
        likely_sensor_box: !ignore && (likely_usb || chip_hint),
        is_callout,
        vid,
        pid,
    }
}

#[tauri::command]
pub fn connect_serial(
    app: AppHandle,
    state: State<'_, SerialState>,
    port_name: String,
) -> Result<(), String> {
    state.stop_reader();

    let port = serialport::new(&port_name, BAUD_RATE)
        .timeout(Duration::from_millis(100))
        .open()
        .map_err(|e| format!("Failed to open {port_name}: {e}"))?;

    let stop = state.stop_flag.clone();
    stop.store(false, Ordering::SeqCst);

    let handle = thread::spawn(move || read_loop(app, port, stop));
    *state.thread_handle.lock().map_err(|e| e.to_string())? = Some(handle);

    Ok(())
}

#[tauri::command]
pub fn disconnect_serial(state: State<'_, SerialState>) -> Result<(), String> {
    state.disconnect();
    Ok(())
}

fn read_loop(app: AppHandle, port: Box<dyn serialport::SerialPort>, stop: Arc<AtomicBool>) {
    let mut reader = BufReader::new(port);
    let mut line_buf = String::new();

    while !stop.load(Ordering::SeqCst) {
        line_buf.clear();
        match reader.read_line(&mut line_buf) {
            Ok(0) => continue,
            Ok(_) => {
                let line = line_buf.trim();
                if line.is_empty() {
                    continue;
                }
                let _ = app.emit("sensor-line", line);
            }
            Err(ref e)
                if e.kind() == std::io::ErrorKind::TimedOut
                    || e.kind() == std::io::ErrorKind::WouldBlock =>
            {
                continue;
            }
            Err(e) => {
                let _ = app.emit("sensor-error", e.to_string());
                let _ = app.emit("sensor-disconnected", ());
                break;
            }
        }
    }

    let _ = app.emit("sensor-disconnected", ());
}
