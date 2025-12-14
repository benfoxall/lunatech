import { TractiveClient } from "../lib/TractiveClient.ts";
import { addDays } from "../lib/util.ts";

const client = new TractiveClient();

const { TRACTIVE_EMAIL, TRACTIVE_PASSWORD } = process.env;
if (!(TRACTIVE_EMAIL && TRACTIVE_PASSWORD))
  throw new Error("Missing TRACTIVE_EMAIL & TRACTIVE_PASSWORD env vars");

await client.login(TRACTIVE_EMAIL, TRACTIVE_PASSWORD);

const trakers = await client.getTrackers();

const now = new Date();
const before = addDays(now, -1);

for (const { _id: tracker } of trakers) {
  const postisions = await client.getPositions(tracker, before, now);

  console.log("---", postisions);
}

console.log(trakers);
