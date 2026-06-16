import { z } from "zod";
import { defineTool } from "../utils/func-tool.js";

const YOUBIKE_API =
  "https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json";

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(a));
}

async function getNearbyYoubike({
  lat,
  lon,
  radius = 500,
  available_amount = 0,
  limit = 3,
}) {
  const res = await fetch(YOUBIKE_API);
  const data = await res.json();

  return data
    .filter((s) => s.act === "1")
    .map((s) => ({
      name: s.sna.replace(/^YouBike2\.0_/, ""),
      area: s.sarea,
      address: s.ar,
      available_rent: s.available_rent_bikes,
      available_return: s.available_return_bikes,
      total: s.Quantity,
      distance: Math.round(haversine(lat, lon, s.latitude, s.longitude)),
    }))
    .filter(
      (s) => s.distance <= radius && s.available_rent >= available_amount,
    )
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}

export const youbikeTool = defineTool({
  name: "get_nearby_youbike",
  description: "取得指定經緯度座標附近可租借的 YouBike 站點",
  fn: getNearbyYoubike,
  parameters: z.object({
    lat: z.number().describe("緯度"),
    lon: z.number().describe("經度"),
    radius: z
      .number()
      .default(500)
      .describe("搜尋半徑（公尺），預設 500"),
    available_amount: z
      .number()
      .default(0)
      .describe("至少可租借車輛數，預設 0"),
    limit: z.number().default(3).describe("回傳筆數上限，預設 3"),
  }),
});
