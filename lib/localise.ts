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
  origin: T
): Omit<T, keyof In> & Out {
  const { latlong, alt, ...rest } = obj;

  const [x, y] = proj(
    // not sure why these are reversed…
    `+proj=aeqd +lat_0=${origin.latlong[1]} +lon_0=${origin.latlong[0]} +datum=WGS84 +units=m +no_defs`,
    latlong
  );

  return {
    ...rest,
    position: [x, y, alt],
  };
}
