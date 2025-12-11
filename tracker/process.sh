#!/usr/bin/env bash
set -euo pipefail

# process.sh
# Usage: ./process.sh <input.json> [output.json]
#
# Reads a tracker export JSON (array of segments -> arrays of position objects),
# finds the first position with `sensor_used == "KNOWN_WIFI"` and uses that
# lat/lon as the projection centre. Reprojects all `latlong` coords to metres
# using `proj` (azimuthal equidistant) and replaces the `latlong` field with
# `location`: [x, y]. Also adds `duration` (seconds) equal to the difference
# to the next point's `time` (last point gets 0).
#
# Dependencies: `jq`, `proj` (PROJ command-line)

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <input.json> [output.json]"
  exit 2
fi

INPUT_FILE="$1"
OUTPUT_FILE="${2:-processed_$(basename "$INPUT_FILE")}"

command -v jq >/dev/null 2>&1 || { echo "This script requires 'jq'" >&2; exit 3; }
command -v proj >/dev/null 2>&1 || { echo "This script requires 'proj' (PROJ CLI)" >&2; exit 3; }

# Find first KNOWN_WIFI latlong (format: lat,lon)
CENTER_LINE=$(jq -r '.[][] | select(.sensor_used=="KNOWN_WIFI") | .latlong | @csv' "$INPUT_FILE" | head -n1 || true)
if [ -z "$CENTER_LINE" ]; then
  echo "No KNOWN_WIFI point found in $INPUT_FILE" >&2
  exit 4
fi

# Remove possible quoting and split
CENTER_LINE=${CENTER_LINE//\"/}
CENTER_LAT=$(echo "$CENTER_LINE" | awk -F, '{print $1}')
CENTER_LON=$(echo "$CENTER_LINE" | awk -F, '{print $2}')

PROJ_OPTS="+proj=aeqd +lat_0=${CENTER_LAT} +lon_0=${CENTER_LON} +units=m +ellps=WGS84"

echo "Centre lat,lon: ${CENTER_LAT},${CENTER_LON}"
echo "Projection: ${PROJ_OPTS}"

SEGMENTS_OUT=()

# Iterate over each segment (top-level array elements)
while IFS= read -r SEG_JSON; do
  SEG_IDX=${SEG_IDX:-0}
  SEG_IDX=$((SEG_IDX+1))
  echo "Processing segment #${SEG_IDX}..."
  # Collect basic arrays (portable replacement for `mapfile` on macOS)
  TIMES=()
  while IFS= read -r t; do
    TIMES[${#TIMES[@]}]="$t"
  done < <(echo "$SEG_JSON" | jq -r '.[] | .time')

  LATS=()
  while IFS= read -r lat; do
    LATS[${#LATS[@]}]="$lat"
  done < <(echo "$SEG_JSON" | jq -r '.[] | .latlong[0]')

  LONS=()
  while IFS= read -r lon; do
    LONS[${#LONS[@]}]="$lon"
  done < <(echo "$SEG_JSON" | jq -r '.[] | .latlong[1]')

  N=${#TIMES[@]}
  if [ "$N" -eq 0 ]; then
    SEGMENTS_OUT+=("[]")
    continue
  fi

  # Compute XYs with proj — batch all lon/lat pairs into a single proj call (faster)
  XS=()
  YS=()
  PAIRS_TMP=$(mktemp)
  for i in "${!TIMES[@]}"; do
    lat=${LATS[i]}
    lon=${LONS[i]}
    printf "%s %s\n" "$lon" "$lat" >> "$PAIRS_TMP"
  done
  # Run proj once for the segment
  PROJ_OUT=$(proj -f "%.3f" $PROJ_OPTS < "$PAIRS_TMP") || {
    echo "proj failed on segment ${SEG_IDX}" >&2
    rm -f "$PAIRS_TMP"
    exit 5
  }
  rm -f "$PAIRS_TMP"
  # Read proj output lines into arrays
  while IFS= read -r line; do
    x=$(echo "$line" | awk '{print $1}')
    y=$(echo "$line" | awk '{print $2}')
    XS[${#XS[@]}]="$x"
    YS[${#YS[@]}]="$y"
  done <<< "$PROJ_OUT"
  if [ ${#XS[@]} -ne ${#TIMES[@]} ]; then
    echo "Warning: proj returned ${#XS[@]} points but expected ${#TIMES[@]}" >&2
  fi

  # Compute durations
  DUR=()
  for ((i=0;i<N;i++)); do
    if [ $i -lt $((N-1)) ]; then
      dur=$(( TIMES[i+1] - TIMES[i] ))
      if [ $dur -lt 0 ]; then dur=0; fi
    else
      dur=0
    fi
    DUR+=("$dur")
  done

  # Build modified objects for this segment
  MODIFIED_ITEMS=()
  for i in "${!TIMES[@]}"; do
    # original object
    OBJ=$(echo "$SEG_JSON" | jq -c ".[$i]")
    x=${XS[i]}
    y=${YS[i]}
    dur=${DUR[i]}
    MOD=$(echo "$OBJ" | jq --argjson loc "[$x,$y]" --argjson duration "$dur" 'del(.latlong) | .location = $loc | .duration = $duration')
    MODIFIED_ITEMS+=("$MOD")
  done

  # Join modified items into JSON array
  SEG_OUT="["
  for idx in "${!MODIFIED_ITEMS[@]}"; do
    if [ "$idx" -ne 0 ]; then
      SEG_OUT+=","${MODIFIED_ITEMS[idx]}
    else
      SEG_OUT+="${MODIFIED_ITEMS[idx]}"
    fi
  done
  SEG_OUT+="]"

  SEGMENTS_OUT+=("$SEG_OUT")
done < <(jq -c '.[]' "$INPUT_FILE")

# Combine segments into top-level array
BODY="["
for idx in "${!SEGMENTS_OUT[@]}"; do
  if [ "$idx" -ne 0 ]; then
    BODY+=","${SEGMENTS_OUT[idx]}
  else
    BODY+="${SEGMENTS_OUT[idx]}"
  fi
done
BODY+="]"

# Pretty-print and write
echo "$BODY" | jq '.' > "$OUTPUT_FILE"

echo "Wrote processed file to $OUTPUT_FILE"

exit 0
