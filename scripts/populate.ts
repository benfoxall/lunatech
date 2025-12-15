import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import z from "zod";
import { TractiveClient } from "../lib/TractiveClient.ts";
import { addDays } from "../lib/util.ts";

const client = new TractiveClient();

const envSchema = z.object({
  TRACTIVE_EMAIL: z.string(),
  TRACTIVE_PASSWORD: z.string(),
});
const env = envSchema.parse(process.env);

await client.login(env.TRACTIVE_EMAIL, env.TRACTIVE_PASSWORD);

const trakers = await client.getTrackers();

const to = new Date();
const from = addDays(to, -120);

await mkdir("trackers", { recursive: true });

for (const { _id: tracker } of trakers) {
  console.log(`Requesting: ${tracker}`);

  const positions = await client.getPositions(tracker, from, to);

  const path = join("trackers", tracker + ".json");

  await writeFile(path, JSON.stringify(positions, null, 2));

  console.log(`Wrote: ${path} (${positions[0].length} entries)`);
}
