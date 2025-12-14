import { z } from "zod";

export const auth = z.object({
  user_id: z.string(),
  client_id: z.string(),
  expires_at: z.number(),
  access_token: z.string(),
});

export const trackers = z.array(
  z.object({
    _id: z.string(),
    _type: z.string(),
    _version: z.string(),
  })
);

export const positions = z.tuple([
  z.array(
    z.object({
      time: z.number(),
      // latlong is strictly [number, number]
      latlong: z.tuple([z.number(), z.number()]),
      alt: z.number(),
      // nullable() handles "null | number"
      speed: z.number().nullable(),
      course: z.number().nullable(),
      pos_uncertainty: z.number(),
      sensor_used: z.string(),
    })
  ),
]);
