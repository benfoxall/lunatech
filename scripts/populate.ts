import { TractiveClient } from "../lib/TractiveClient.ts";
import { addDays } from "./util.ts";

const client = new TractiveClient();

await client.login(process.env.TRACTIVE_EMAIL, process.env.TRACTIVE_PASSWORD);

const trakers = await client.getTrackers();

const now = new Date();
const before = addDays(now, -1);

for (const { _id: tracker } of trakers) {
  const postisions = await client.getPositions(tracker, before, now);

  console.log("---", postisions);
}

console.log(trakers);
