# Weekly Parlay History Data

This directory contains the data for the Weekly Parlay History feature.

## Overview

The league does a weekly parlay where each manager contributes one leg to a parlay bet. Each manager pays $10 per week to participate. This data tracks:
- Who participated each week
- What pick each manager made
- Whether each individual pick won or lost
- Whether the overall parlay won or lost
- Who threw (placed) the parlay
- Cumulative spending and win/loss records

## File Structure

**`parlayHistory.json`** - Contains all parlay data across all seasons

## JSON Structure

```json
{
  "seasons": [
    {
      "year": "2025",
      "weeks": [
        {
          "week": 5,
          "seasonWeek": "Season 2025 Week 5",
          "date": "2025-10-07",
          "parlayResult": "loss",
          "payout": 0,
          "thrownBy": {
            "managerID": "887911442844925952",
            "managerName": "jfaoro"
          },
          "picks": [
            {
              "managerID": "887911442844925952",
              "managerName": "jfaoro",
              "pick": "Chiefs -3.5",
              "result": "loss"
            },
            {
              "managerID": "990520804859232256",
              "managerName": "tigbits711",
              "pick": "Bills ML",
              "result": "win"
            },
            {
              "managerID": "990522132113240064",
              "managerName": "ChuckLeady",
              "pick": "Cowboys +7",
              "result": "win"
            }
          ]
        }
      ]
    }
  ]
}
```

## Field Descriptions

### Season Object
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `year` | string | The NFL season year | `"2025"` |
| `weeks` | array | Array of weekly parlay objects | See below |

### Week Object
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `week` | number | Week number of the season | `5` |
| `seasonWeek` | string | Formatted display string | `"Season 2025 Week 5"` |
| `date` | string | Date the parlay was placed (YYYY-MM-DD) | `"2025-10-07"` |
| `parlayResult` | string | Overall parlay outcome: `"win"` or `"loss"` | `"loss"` |
| `payout` | number | Total payout if parlay won (0 if lost) | `0` or `850` |
| `thrownBy` | object | Manager who placed the parlay | See below |
| `picks` | array | All individual picks in the parlay | See below |

### ThrownBy Object
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `managerID` | string | Sleeper manager ID | `"887911442844925952"` |
| `managerName` | string | Manager's display name | `"jfaoro"` |

### Pick Object
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `managerID` | string | Sleeper manager ID | `"887911442844925952"` |
| `managerName` | string | Manager's display name | `"jfaoro"` |
| `pick` | string | Description of the bet | `"Chiefs -3.5"` |
| `result` | string | Individual pick outcome: `"win"` or `"loss"` | `"loss"` |

## Manager IDs Reference

| Manager Name | Manager ID |
|--------------|------------|
| jfaoro | 887911442844925952 |
| tigbits711 | 990520804859232256 |
| ChuckLeady | 990522132113240064 |
| ryebread00 | 990524585852354560 |
| jenright19 | 990704123299336192 |
| Nolanwest | 990753572016943104 |
| billm8 | 991503715234271232 |
| jwhill | 991882566162558976 |
| CamMacIntosh | 992186573034688512 |
| jafallon | 992838327420121088 |

## How to Update Weekly

### Step 1: Add New Week Entry
Copy the week template below and fill in the data:

```json
{
  "week": [WEEK_NUMBER],
  "seasonWeek": "Season [YEAR] Week [WEEK_NUMBER]",
  "date": "[YYYY-MM-DD]",
  "parlayResult": "[win/loss]",
  "payout": [AMOUNT_OR_0],
  "thrownBy": {
    "managerID": "[MANAGER_ID]",
    "managerName": "[MANAGER_NAME]"
  },
  "picks": [
    {
      "managerID": "[MANAGER_ID]",
      "managerName": "[MANAGER_NAME]",
      "pick": "[PICK_DESCRIPTION]",
      "result": "[win/loss]"
    }
  ]
}
```

### Step 2: Insert into JSON File
1. Open `parlayHistory.json`
2. Find the current season's `weeks` array
3. Add the new week object to the array
4. Ensure proper JSON formatting (commas between objects)
5. Save the file

### Step 3: Commit and Deploy
```bash
git add src/lib/data/parlayHistory.json
git commit -m "Add parlay data for Season [YEAR] Week [WEEK]"
git push origin master
```

## Important Notes

### JSON Formatting Rules
- ✅ Use double quotes for all strings
- ✅ Use commas between array items (but NOT after the last item)
- ✅ Manager IDs must exactly match the IDs in leagueInfo.js
- ✅ Result values must be exactly `"win"` or `"loss"` (lowercase)
- ✅ Week numbers should be integers (no quotes)
- ✅ Payout should be a number (no quotes, no dollar signs)

### Common Mistakes to Avoid
- ❌ Missing commas between objects
- ❌ Extra comma after last array item
- ❌ Using single quotes instead of double quotes
- ❌ Misspelling manager names (won't break, but looks bad)
- ❌ Wrong manager IDs (will cause manager linking to fail)

## Starting a New Season

When starting a new season, add a new season object to the `seasons` array:

```json
{
  "seasons": [
    {
      "year": "2025",
      "weeks": [...]
    },
    {
      "year": "2026",
      "weeks": []
    }
  ]
}
```

## Validation

Before committing, validate your JSON:
1. Use a JSON validator like [JSONLint](https://jsonlint.com/)
2. Copy/paste your JSON and click "Validate JSON"
3. Fix any syntax errors before committing

## Example: Complete Week Entry

```json
{
  "week": 5,
  "seasonWeek": "Season 2025 Week 5",
  "date": "2025-10-07",
  "parlayResult": "win",
  "payout": 850,
  "thrownBy": {
    "managerID": "990522132113240064",
    "managerName": "ChuckLeady"
  },
  "picks": [
    {
      "managerID": "887911442844925952",
      "managerName": "jfaoro",
      "pick": "Chiefs -3.5",
      "result": "win"
    },
    {
      "managerID": "990520804859232256",
      "managerName": "tigbits711",
      "pick": "Bills ML",
      "result": "win"
    },
    {
      "managerID": "990522132113240064",
      "managerName": "ChuckLeady",
      "pick": "Cowboys +7",
      "result": "win"
    },
    {
      "managerID": "990524585852354560",
      "managerName": "ryebread00",
      "pick": "Eagles Over 47.5",
      "result": "win"
    },
    {
      "managerID": "990704123299336192",
      "managerName": "jenright19",
      "pick": "49ers -10",
      "result": "win"
    },
    {
      "managerID": "990753572016943104",
      "managerName": "Nolanwest",
      "pick": "Packers ML",
      "result": "win"
    },
    {
      "managerID": "991503715234271232",
      "managerName": "billm8",
      "pick": "Ravens -6.5",
      "result": "win"
    },
    {
      "managerID": "991882566162558976",
      "managerName": "jwhill",
      "pick": "Bengals +3",
      "result": "win"
    },
    {
      "managerID": "992186573034688512",
      "managerName": "CamMacIntosh",
      "pick": "Lions ML",
      "result": "win"
    },
    {
      "managerID": "992838327420121088",
      "managerName": "jafallon",
      "pick": "Broncos Under 44",
      "result": "win"
    }
  ]
}
```

## Questions?

If you have questions about the data structure or need to make changes to the schema, check the main project documentation or contact the developer.
