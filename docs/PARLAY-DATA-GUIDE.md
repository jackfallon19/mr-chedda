# Parlay History Data Guide

Reference for updating `src/lib/data/parlayHistory.json` — the manager nickname
mapping and the schema/steps for adding a new week's parlay.

## Manager nickname → Sleeper ID mapping

Jack ("fallon") refers to managers by nicknames when copy-pasting picks.
These don't always match the Sleeper username, so use this table:

| Nickname(s) used in picks | Sleeper username | managerID |
|---|---|---|
| Fallon | jafallon | 992838327420121088 |
| Riley | ryebread00 | 990524585852354560 |
| Cam | CamMacIntosh | 992186573034688512 |
| Faoro | jfaoro | 887911442844925952 |
| Boos | tigbits711 | 990520804859232256 |
| Nolan, Dodan | Nolanwest | 990753572016943104 |
| Lead | ChuckLeady | 990522132113240064 |
| Johnny, Alpha | jwhill | 991882566162558976 |
| Enright | jenright19 | 990704123299336192 |
| Bill | billm8 | 991503715234271232 |

**Known quirks:**
- "Alpha" and "Dodan" have shown up as alternate nicknames for Johnny (jwhill)
  and Nolan (Nolanwest) respectively — not new people. There are only 10
  managers total.
- Watch for a nickname (e.g. "Bill") appearing twice in one week's picks —
  that's usually a mislabeled pick for a different manager, not the same
  person picking twice. Cross-check against who's *missing* from the list
  that week (every manager should appear at most once per parlay week,
  whether or not they threw it).
- If a nickname doesn't clearly resolve, ask before guessing — don't assume.

## Schema

`src/lib/data/parlayHistory.json` → `seasons[]` → each season has `year` and
`weeks[]`. Each week:

```json
{
  "week": 1,
  "seasonWeek": "Season 2026 Week 1",
  "date": "2026-09-11",
  "parlayResult": "loss",
  "payout": 0,
  "thrownBy": {
    "managerID": "990520804859232256",
    "managerName": "tigbits711"
  },
  "picks": [
    {
      "managerID": "990524585852354560",
      "managerName": "ryebread00",
      "pick": "Bears ML vs Carolina",
      "result": "win"
    }
  ]
}
```

Notes:
- `week` just needs to be unique and increasing within its season's array —
  it doesn't have to match the NFL week number in `seasonWeek` (existing 2025
  data has gaps/off-by-ones from skipped weeks).
- `parlayResult` is `"loss"` if **any** leg lost (it's a parlay — one loss
  sinks the whole thing), `"win"` only if every leg hit. `payout` is `0` on
  a loss.
- `thrownBy` is whoever placed/paid for that week's parlay — ask if not given.
- A manager who didn't have a pick that week is simply **omitted** from
  `picks` — there's no "no pick" placeholder entry.
- `result` per pick is `"win"` or `"loss"`.

## Steps to add a new week

Quick version: resolve nicknames, append one object to the right season's `weeks[]`, run the
validation script below, check `/parlay-history`, commit.

1. Get the raw picks list (manager nickname → pick → result) and the
   thrower + date from Jack.
2. Resolve every nickname to a `managerID`/`managerName` using the table
   above. If anything is ambiguous (new nickname, duplicate nickname,
   missing manager), ask before writing data.
3. Add a new object to the correct season's `weeks[]` array in
   `src/lib/data/parlayHistory.json`, following the schema above.
4. Run the validation script below. It must print `OK`.
5. Check it locally:
   ```
   cd /Users/jackfallon/Desktop/mr-chedda
   npm run dev
   ```
   Open the printed URL (usually `http://localhost:5173`) and visit
   `/parlay-history`.
   Confirm the new ticket shows the right leg count, and the season record and manager ledger moved
   as expected. All-Time totals at the bottom update by themselves; no code change is needed.
6. Commit and push:
   ```
   git add src/lib/data/parlayHistory.json
   git commit -m "Add parlay data for Season 2026 Week N"
   git push origin master
   ```

## Validation script

Save as `validate.py` in the scratch area (or paste into `python3 -`) and run from the repo root.
It checks JSON syntax, known manager IDs, `win`/`loss` values, one pick per manager per week, that
`parlayResult` agrees with the legs, and unique week numbers per season.

```python
import json, sys
IDS = {"887911442844925952","990520804859232256","990522132113240064","990524585852354560",
       "990704123299336192","990753572016943104","991503715234271232","991882566162558976",
       "992186573034688512","992838327420121088"}
d = json.load(open("src/lib/data/parlayHistory.json")); errs = []
for s in d["seasons"]:
    seen = set()
    for w in s["weeks"]:
        tag = f'{s["year"]} W{w["week"]}'
        if w["week"] in seen: errs.append(f"{tag}: duplicate week number")
        seen.add(w["week"])
        if w["thrownBy"]["managerID"] not in IDS: errs.append(f"{tag}: unknown thrower")
        ids = [p["managerID"] for p in w["picks"]]
        if len(ids) != len(set(ids)): errs.append(f"{tag}: a manager appears twice")
        for p in w["picks"]:
            if p["managerID"] not in IDS: errs.append(f'{tag}: unknown ID for {p["managerName"]}')
            if p["result"] not in ("win", "loss"): errs.append(f'{tag}: bad result {p["result"]!r}')
        want = "win" if all(p["result"] == "win" for p in w["picks"]) else "loss"
        if w["parlayResult"] != want: errs.append(f'{tag}: parlayResult should be {want}')
        if w["parlayResult"] == "loss" and w["payout"] != 0: errs.append(f"{tag}: payout on a loss")
print("\n".join(errs) or "OK"); sys.exit(bool(errs))
```

## Starting a new season

Add `{ "year": "2027", "weeks": [] }` to `seasons`. An empty season renders the "no tickets yet"
state. The page defaults to the newest season that has weeks, and All-Time picks the new one up
automatically.

## Schema reference

Field-by-field tables are in `src/lib/data/README.md`.
