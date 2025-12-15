import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { localise } from "../lib/localise.ts";
import { positions } from "../lib/TractiveSchemas.ts";

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error("Usage: node ./scripts/convert.ts <input.json> <output.json>");
  process.exit(1);
}

const [inputPath, outputPath] = args;

// Resolve paths to absolute
const inputFile = resolve(inputPath);
const outputFile = resolve(outputPath);

try {
  // Read and parse the input JSON
  const rawData = await readFile(inputFile, "utf-8");
  const data = JSON.parse(rawData);

  // Validate against the positions schema
  const validated = positions.parse(data);

  // Extract the positions array
  const [locationsList] = validated;

  if (locationsList.length === 0) {
    console.error("Error: No locations found in input file");
    process.exit(1);
  }

  // Use first location as origin
  const origin = locationsList[0];

  // Map all positions through localise with the origin
  const mapped = locationsList.map((position) => {
    return localise(position, origin);
  });

  // Write output to file
  await writeFile(outputFile, JSON.stringify(mapped, null, 2));

  console.log(`Successfully converted ${locationsList.length} locations`);
  console.log(`Output written to: ${outputFile}`);
} catch (error) {
  if (error instanceof SyntaxError) {
    console.error("Error: Invalid JSON in input file");
  } else if (error instanceof Error) {
    console.error("Error:", error.message);
  } else {
    console.error("Unknown error occurred");
  }
  process.exit(1);
}
