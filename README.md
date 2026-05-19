# Sensor Box OS

Open-source desktop companion for the **EE Sensor Box** — a USB environmental monitor that reports temperature, humidity, pressure, and volatile organic compounds (VOC index).

Built with [Tauri 2](https://v2.tauri.app/) + React + TypeScript. Serial I/O runs in Rust; parsing matches the [Experiment Engine](https://github.com) `SensorService` format so existing firmware works unchanged.

## Features

- **Welcome** hero landing with Heterodox Labs branding
- **Connect** over USB serial (115200 baud) with auto-detect
- **Live readings** — temperature (°C), humidity (% RH), pressure (hPa), VOC index
- **Timed sessions** — start/stop recording (~1 sample/sec)
- **Export** — CSV or JSON + optional **Supabase cloud save**
- Links to [get a Sensor Box](https://shop.experimentengine.ai/products/sensor-box) and [Experiment Engine](https://www.experimentengine.ai/)

## Cloud session storage (Supabase)

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL in `supabase/migrations/001_sensor_sessions.sql` in the SQL Editor
3. Copy `.env.example` → `.env` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

Sessions auto-save to the cloud when a recording ends (if configured).

## Requirements

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://www.rust-lang.org/tools/install) 1.70+
- macOS, Windows, or Linux

## Development

```bash
npm install
npm run tauri dev
```

## Build installers

```bash
npm run tauri build
```

Artifacts appear under `src-tauri/target/release/bundle/`.

## Device protocol

Firmware sends tab-separated lines, for example:

```text
tempF:72.5	humidity:45.2	pressure:0.998	lux:1234	voc:125
```

JSON lines are also supported. See `src/lib/sensorParser.ts` for full parsing rules (°F→°C, atm→hPa).

## Project layout

| Path | Purpose |
|------|---------|
| `src/lib/sensorParser.ts` | Firmware line parser (port from BIGSIS) |
| `src/hooks/useSensorBox.ts` | Tauri serial commands + live events |
| `src-tauri/src/serial.rs` | Port list, connect, read loop |

## Contributing

Contributions welcome. Keep parser compatibility with EE Sensor Box firmware unless documenting a breaking change.

## License

MIT
