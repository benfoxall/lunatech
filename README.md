# Getting Data

## Fetch from tractive API

Pull locations from the tractive API and write them to `trackers/TRACKER.json`

```bash
export TRACTIVE_EMAIL=`op read "op://Personal/Tractive/username"`
export TRACTIVE_PASSWORD=`op read "op://Personal/Tractive/password"`

node ./scripts/populate.ts

# Requesting: ABCDEFG
# Wrote: trackers/ABCDEFG.json
```

## Process API output

```bash
node ./scripts/convert.ts trackers/TRACKER.json locations.json
```
