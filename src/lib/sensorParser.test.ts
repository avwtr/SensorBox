import { parseSensorData } from "./sensorParser";

const kvLine = "tempF:72.5\thumidity:45.2\tpressure:0.998\tlux:1234\tvoc:125";

const parsed = parseSensorData(kvLine);
if (!parsed?.temperature || !parsed.humidity || !parsed.pressure || !parsed.volatileGas) {
  throw new Error("KV parse failed");
}
// 72.5 F -> ~22.5 C
if (Math.abs(parsed.temperature - 22.5) > 0.2) {
  throw new Error(`Expected ~22.5C, got ${parsed.temperature}`);
}

const json = parseSensorData('{"temp": 25.5, "pressure": 1013.25, "humidity": 60, "gas": 120}');
if (json?.temperature !== 25.5) throw new Error("JSON parse failed");

console.log("sensorParser tests OK");
