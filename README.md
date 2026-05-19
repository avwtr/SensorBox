# Sensor Box OS

<p align="center">
  <img
    src="public/hero.png"
    alt="Sensor Box OS — desktop app for the EE Sensor Box"
    width="520"
  />
</p>

Open-source desktop app for the [**HDX Sensor Box**](https://shop.experimentengine.ai/products/sensor-box) — a compact USB environmental monitor from [Experiment Engine](https://www.experimentengine.ai/). **Sensor Box OS** lets you visualize, monitor, and record sensor data on your computer without the full Experiment Engine platform.

---

## The hardware

The **HDX Sensor Box** is a bench-top environmental sensor built on **ESP32-S3** with a modular enclosure. It streams real-time **temperature**, **humidity**, **VOC (air quality)**, and **atmospheric pressure** over USB so you can tie conditions to experiments, reproducibility, and variability.

In the full **Experiment Engine** workflow, telemetry can sync with procedural logs, video, and experiment context. **Sensor Box OS** (this repo) is the standalone path: plug in, record sessions, export CSV/JSON.

<p align="center">
  <img
    src="docs/images/sensor-box-assembled.png"
    alt="Assembled HDX Sensor Box with crest lid"
    width="340"
  />
  &nbsp;
  <img
    src="docs/images/sensor-box-innards.png"
    alt="HDX Sensor Box enclosure parts and internal electronics"
    width="340"
  />
</p>

<p align="center"><sub>Assembled unit (left) and enclosure / electronics layout (right).</sub></p>

### Features

- Native **Experiment Engine** integration (ecosystem)
- **USB-powered** — included Micro USB → USB-A cable; plug-and-play on macOS, Windows, or Linux
- Real-time environmental telemetry at **115200 baud**
- **ESP32-S3** architecture with room for modular expansion
- Compact bench-top design

### Get a Sensor Box

Purchase a complete assembled unit (electronics + enclosure) for **[$99](https://shop.experimentengine.ai/products/sensor-box)** — recommended if you want a tested device ready to connect.

### 3D-print the enclosure (STL)

We publish **V1 enclosure STLs** under [`hardware/stl/`](hardware/stl/) for makers who want to print their own shell. See [`hardware/README.md`](hardware/README.md) for the parts list (bottom, middle with vents, lid with crest, dowel pins).

| Part | Download |
|------|----------|
| Bottom | [`sensor-box-v1-bottom.stl`](hardware/stl/sensor-box-v1-bottom.stl) |
| Middle (vents) | [`sensor-box-v1-middle.stl`](hardware/stl/sensor-box-v1-middle.stl) |
| Lid (crest) | [`sensor-box-v1-lid-crest.stl`](hardware/stl/sensor-box-v1-lid-crest.stl) |
| Dowel pins | [`sensor-box-v1-dowel-pins.stl`](hardware/stl/sensor-box-v1-dowel-pins.stl) |

> **Note:** STL files are large (~32 MB total). Clone with patience, or use [GitHub’s download ZIP](https://github.com/avwtr/SensorBox/archive/refs/heads/main.zip) if you only need the CAD. Electronics and firmware are not included in the STLs.

---

## How to run the app (today)

**Right now, the supported way to use Sensor Box OS is to run it locally from this GitHub repo.** There is not yet a signed, one-click Mac installer we can recommend for everyone.

You will need:

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://www.rust-lang.org/tools/install) 1.77+
- macOS, Windows, or Linux
- An EE Sensor Box on USB (data cable, not charge-only)

### Steps

```bash
git clone https://github.com/avwtr/SensorBox.git
cd SensorBox
npm install
npm run tauri dev
```

The desktop window opens. Use it like a normal app while that command is running.

To build a local `.app` / `.dmg` on your own machine (still unsigned):

```bash
npm ci
npm run tauri build
```

Output is under `src-tauri/target/release/bundle/`.

### Pre-built downloads (coming soon)

We are working on an [**Apple Developer**](https://developer.apple.com/programs/) membership so we can **code-sign and notarize** macOS builds. After that, you’ll be able to download a `.dmg` from [GitHub Releases](https://github.com/avwtr/SensorBox/releases) or our site and open it without macOS blocking it.

Until then:

- **Do not rely on the release DMGs for friends or customers** — unsigned builds often show **“damaged”** or **“can’t be opened”** on other Macs (Gatekeeper), even when they work on yours.
- Experiment Engine’s “Download for Mac” button may stay disabled or point here until signed installers are ready.

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

Built with [Tauri 2](https://v2.tauri.app/), React, and TypeScript. Serial I/O runs in Rust; parsing matches Experiment Engine firmware.

---

## For maintainers

### Publish a GitHub Release (unsigned CI builds)

CI builds macOS DMGs on tag push for testing and for the future signed pipeline. Asset names must stay `SensorBox-{version}-macos-aarch64.dmg` and `SensorBox-{version}-macos-x64.dmg` for the Experiment Engine site.

1. Bump `version` in `src-tauri/tauri.conf.json`.
2. Tag and push:

   ```bash
   git tag v0.2.0
   git push origin v0.2.0
   ```

See `.github/workflows/release.yml`.

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
| `hardware/stl/` | 3D-printable enclosure (V1) |
| `docs/images/` | Product photos for docs |

---

## Links

- [Get a Sensor Box · $99](https://shop.experimentengine.ai/products/sensor-box)
- [Experiment Engine](https://www.experimentengine.ai/)
- [Enclosure STLs](hardware/stl/)
- [Source on GitHub](https://github.com/avwtr/SensorBox)

## Contributing

Issues and pull requests are welcome. Keep parser behavior compatible with EE Sensor Box firmware unless you document a breaking change.

## License

MIT — see [LICENSE](LICENSE).
