mod serial;

use serial::SerialState;
use tauri::Manager;
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .manage(SerialState::default())
        .invoke_handler(tauri::generate_handler![
            serial::list_serial_ports,
            serial::connect_serial,
            serial::disconnect_serial,
        ])
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                window.state::<SerialState>().disconnect();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
