#!/bin/bash

## Fetch the tracker history from Tractive

# Reading creds from 1password
TRACTIVE_EMAIL=`op read "op://Personal/Tractive/username"`
TRACTIVE_PASSWORD=`op read "op://Personal/Tractive/password"`
DURATION_DAYS=90

# Lifted from tractive npm module
CLIENT_ID=${TRACTIVE_CLIENT_ID:-"6536c228870a3c8857d452e8"}

RESPONSE=$(curl -s -X POST -G "https://graph.tractive.com/4/auth/token" \
  --data-urlencode "grant_type=tractive" \
  --data-urlencode "platform_email=$TRACTIVE_EMAIL" \
  --data-urlencode "platform_token=$TRACTIVE_PASSWORD" \
  -H "X-Tractive-Client: $CLIENT_ID" \
  -H "Content-Type: application/json")

echo "RESP $RESPONSE"

# Parse the access_token and export it
TRACTIVE_TOKEN=$(echo "$RESPONSE" | jq -r '.access_token')

echo "Token set: ${TRACTIVE_TOKEN:0:10}..."


# Get all trackers
echo "Fetching all trackers..."
TRACKERS_RESPONSE=$(curl -s -X GET "https://graph.tractive.com/4/user/68d6d41b2b4bfadf11eda9ce/trackers" \
  -H "X-Tractive-Client: $CLIENT_ID" \
  -H "Authorization: Bearer $TRACTIVE_TOKEN" \
  -H "Content-Type: application/json")

echo "Trackers: $TRACKERS_RESPONSE"

# Extract tracker IDs
TRACKER_IDS=$(echo "$TRACKERS_RESPONSE" | jq -r '.[]._id')

# Calculate time range in seconds
TO_TIMESTAMP=$(date +%s)
FROM_TIMESTAMP=$((TO_TIMESTAMP - (DURATION_DAYS * 24 * 60 * 60)))

echo "Duration: $DURATION_DAYS days"
echo "From timestamp: $FROM_TIMESTAMP"
echo "To timestamp: $TO_TIMESTAMP"
echo ""

for TRACKER_ID in $TRACKER_IDS; do
  echo "Fetching history for tracker: $TRACKER_ID"

  HISTORY_RESPONSE=$(curl -s -X GET "https://graph.tractive.com/4/tracker/$TRACKER_ID/positions?time_from=$FROM_TIMESTAMP&time_to=$TO_TIMESTAMP&format=json_segments" \
    -H "X-Tractive-Client: $CLIENT_ID" \
    -H "Authorization: Bearer $TRACTIVE_TOKEN" \
    -H "Content-Type: application/json")

  # Write response to file named after tracker
  OUTPUT_FILE="${TRACKER_ID}_${DURATION_DAYS}.json"
  echo "$HISTORY_RESPONSE" | jq '.' > "$OUTPUT_FILE"

  echo "Saved tracker history to $OUTPUT_FILE"
done

echo "Done!"
