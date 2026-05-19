# Sensor Box OS

Open-source desktop app for the [**EE Sensor Box**](https://shop.experimentengine.ai/products/sensor-box) — a USB environmental monitor that reports temperature, humidity, pressure, and VOC index.

Built with [Tauri 2](https://v2.tauri.app/), React, and TypeScript. Serial I/O runs in Rust; line parsing matches Experiment Engine firmware so existing devices work without changes.

## What it does

1. **Connect** your Sensor Box over USB (auto-detected when possible).
2. **Choose** which metrics to record.
3. **Record** a timed session with live values and charts.
4. **Export** the session as **CSV** or **JSON** to a folder on your computer.

There is no cloud sync. When a session ends, download a file if you want to keep it — the app does not upload or store sessions online.

## Requirements

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://www.rust-lang.org/tools/install) 1.77+
- macOS, Windows, or Linux
- An EE Sensor Box on USB

## Quick start (development)

```bash
git clone https://github.com/avwtr/SensorBox.git
cd SensorBox
npm install
npm run tauri dev
```

The desktop window opens with hot reload for the UI.

## Download (macOS)

Pre-built installers: [GitHub Releases](https://github.com/avwtr/SensorBox/releases).

| Mac type | File |
|----------|------|
| Apple Silicon | `SensorBox-0.1.0-macos-aarch64.dmg` |
| Intel | `SensorBox-0.1.0-macos-x64.dmg` |

Direct links (v0.1.0):

- [Apple Silicon](https://github.com/avwtr/SensorBox/releases/download/v0.1.0/SensorBox-0.1.0-macos-aarch64.dmg)
- [Intel](https://github.com/avwtr/SensorBox/releases/download/v0.1.0/SensorBox-0.1.0-macos-x64.dmg)

Unsigned builds may require **System Settings → Privacy & Security → Open Anyway** on first launch.

### Cut a new release

1. Bump `version` in `src-tauri/tauri.conf.json` (and the Experiment Engine site if download URLs change).
2. Commit, tag, and push:

   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```

3. GitHub Actions (`.github/workflows/release.yml`) builds both macOS DMGs and attaches them to the release.

Asset names must stay `SensorBox-{version}-macos-aarch64.dmg` and `SensorBox-{version}-macos-x64.dmg` for the marketing site download links.

## Build an installer

```bash
npm ci
npm run tauri build
```

Installers and binaries are written under `src-tauri/target/release/bundle/dmg/`. Rename the DMG to match the release contract before uploading manually.

## Using the app

| Step | What to do |
|------|------------|
| **Begin** | From the welcome screen, start setup. |
| **What to record** | Toggle temperature, humidity, pressure, and/or VOC. At least one is required. |
| **Connect** | Plug in the Sensor Box via USB. The app scans for a likely serial port and connects automatically when it finds one. Use **Choose port manually** if needed. |
| **Record** | **Start recording** runs a session with a timer, live stats, and charts. **Stop** ends the session. |
| **Export** | **Download CSV** or **Download JSON** and save the file wherever you want. Use **Home** to start over. |

### Saving your data

- Sessions exist only in memory while the app is running.
- After you stop recording, use **Download CSV** or **Download JSON** and pick a location (e.g. `Documents/SensorBox/`).
- Closing the app or going **Home** without exporting discards that session.

### Troubleshooting connection

- Use a data USB cable (not charge-only).
- On macOS, the port often appears as `cu.usbserial-*` (CP2102N bridge).
- The app ignores system ports (Bluetooth, debug console, etc.). If auto-detect fails, open **Choose port manually** and select the USB serial device for your box.
- Baud rate is **115200**.

## Device protocol

Firmware sends tab-separated lines, for example:

```text
tempF:72.5	humidity:45.2	pressure:0.998	lux:1234	voc:125
```

JSON lines are also supported. See `src/lib/sensorParser.ts` for parsing (°F→°C, atm→hPa).

## Project layout

| Path | Purpose |
|------|---------|
| `src/components/screens/` | UI flow (welcome → configure → connect → session → export) |
| `src/hooks/useSensorBox.ts` | Serial ports, connect, live readings |
| `src/lib/sensorParser.ts` | Firmware line parser |
| `src-tauri/src/serial.rs` | Rust serial read loop |

## Links

- [Get a Sensor Box](https://shop.experimentengine.ai/products/sensor-box)
- [Experiment Engine](https://www.experimentengine.ai/)
- [Source on GitHub](https://github.com/avwtr/SensorBox)

## Contributing

Issues and pull requests are welcome. Keep parser behavior compatible with EE Sensor Box firmware unless you document a breaking change.

## License

MIT — see [LICENSE](LICENSE).
