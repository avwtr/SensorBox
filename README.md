# Sensor Box OS

Open-source desktop app for the [**EE Sensor Box**](https://shop.experimentengine.ai/products/sensor-box) — a USB environmental monitor that reports temperature, humidity, pressure, and VOC index.

## Download the app (macOS)

**You do not need Node, Rust, or the command line** — grab a pre-built installer:

**[→ Latest release on GitHub](https://github.com/avwtr/SensorBox/releases/latest)**

| Your Mac | Download |
|----------|----------|
| Apple Silicon (M1/M2/M3/M4) | [SensorBox-0.1.0-macos-aarch64.dmg](https://github.com/avwtr/SensorBox/releases/download/v0.1.0/SensorBox-0.1.0-macos-aarch64.dmg) |
| Intel | [SensorBox-0.1.0-macos-x64.dmg](https://github.com/avwtr/SensorBox/releases/download/v0.1.0/SensorBox-0.1.0-macos-x64.dmg) |

Not sure which chip you have? **Apple menu → About This Mac** — “Chip” means Apple Silicon; “Processor” with Intel in the name means Intel.

### Install

1. Open the `.dmg` you downloaded.
2. Drag **Sensor Box** into **Applications**.
3. Open it from Applications (or Spotlight).

On first launch, macOS may block the app because it is not signed with an Apple Developer ID. If you see that warning, open **System Settings → Privacy & Security** and click **Open Anyway**, then launch the app again.

**You need:** macOS and an EE Sensor Box connected via USB (data cable, not charge-only).

---

## Using the app

| Step | What to do |
|------|------------|
| **Begin** | From the welcome screen, start setup. |
| **What to record** | Toggle temperature, humidity, pressure, and/or VOC. At least one is required. |
| **Connect** | Plug in the Sensor Box via USB. The app scans for a likely serial port and connects automatically when it finds one. Use **Choose port manually** if needed. |
| **Record** | **Start recording** runs a session with a timer, live stats, and charts. **Stop** ends the session. |
| **Export** | **Download CSV** or **Download JSON** and save the file wherever you want. Use **Home** to start over. |

### Saving your data

- Sessions exist only on your computer while the app is running.
- After you stop recording, use **Download CSV** or **Download JSON** and pick a folder (e.g. `Documents/SensorBox/`).
- Closing the app or going **Home** without exporting discards that session. There is no cloud backup.

### Troubleshooting connection

- Use a data USB cable (not charge-only).
- On macOS, the port often appears as `cu.usbserial-*` (CP2102N bridge).
- If auto-detect fails, open **Choose port manually** and select your Sensor Box’s USB serial device.
- Baud rate is **115200**.

---

## What it does

1. **Connect** your Sensor Box over USB (auto-detected when possible).
2. **Choose** which metrics to record.
3. **Record** a timed session with live values and charts.
4. **Export** the session as **CSV** or **JSON** to a folder on your computer.

---

## For developers

Want to run from source or build installers yourself? You’ll need [Node.js](https://nodejs.org/) 18+, [Rust](https://www.rust-lang.org/tools/install) 1.77+, and macOS, Windows, or Linux.

### Run locally

```bash
git clone https://github.com/avwtr/SensorBox.git
cd SensorBox
npm install
npm run tauri dev
```

### Build an installer

```bash
npm ci
npm run tauri build
```

Output is under `src-tauri/target/release/bundle/dmg/`.

### Publish a new release

1. Bump `version` in `src-tauri/tauri.conf.json` (and update download URLs on the Experiment Engine site if the version changes).
2. Tag and push — GitHub Actions uploads both macOS DMGs:

   ```bash
   git tag v0.2.0
   git push origin v0.2.0
   ```

Release assets must be named `SensorBox-{version}-macos-aarch64.dmg` and `SensorBox-{version}-macos-x64.dmg` for the marketing site. See `.github/workflows/release.yml`.

Built with [Tauri 2](https://v2.tauri.app/), React, and TypeScript. Serial I/O runs in Rust; parsing matches Experiment Engine firmware.

### Device protocol

Firmware sends tab-separated lines, for example:

```text
tempF:72.5	humidity:45.2	pressure:0.998	lux:1234	voc:125
```

JSON lines are also supported. See `src/lib/sensorParser.ts` for parsing (°F→°C, atm→hPa).

### Project layout

| Path | Purpose |
|------|---------|
| `src/components/screens/` | UI flow (welcome → configure → connect → session → export) |
| `src/hooks/useSensorBox.ts` | Serial ports, connect, live readings |
| `src/lib/sensorParser.ts` | Firmware line parser |
| `src-tauri/src/serial.rs` | Rust serial read loop |

---

## Links

- [Get a Sensor Box](https://shop.experimentengine.ai/products/sensor-box)
- [Experiment Engine](https://www.experimentengine.ai/)
- [GitHub Releases](https://github.com/avwtr/SensorBox/releases)

## Contributing

Issues and pull requests are welcome. Keep parser behavior compatible with EE Sensor Box firmware unless you document a breaking change.

## License

MIT — see [LICENSE](LICENSE).
