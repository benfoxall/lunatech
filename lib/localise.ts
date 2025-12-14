import proj from "proj4";

interface In {
  latlong: [lat: number, lon: number];
  alt: number;
}

interface Out {
  position: [x: number, y: number, z: number];
}

/** Convert a path into a coordinate frame */
export function localise<T extends In>(
  obj: T,
  [lat, lon]: [lat: number, lon: number]
): Omit<T, keyof In> & Out {
  const { latlong, alt, ...rest } = obj;

  const [x, y] = proj(
    `+proj=aeqd +lat_0=${lat} +lon_0=${lon} +datum=WGS84 +units=m +no_defs`,
    latlong
  );

  return {
    ...rest,
    position: [x, y, alt],
  };
}
