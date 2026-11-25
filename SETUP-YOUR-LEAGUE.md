# Set up this site for your own league

This guide is for someone who has never used GitHub, Vercel, or Claude Code. You'll make a couple of accounts, click a few buttons, and then swap Jack's league details for yours.

There are two ways to do that last part. Steps 1 and 2 are the same for both.

| | Route A: Claude does it | Route B: you do it by hand |
|---|---|---|
| **Cost** | Needs a paid Claude plan (Pro is enough) | Free |
| **Effort** | Answer questions in plain English | Edit about six files on GitHub, following exact instructions |
| **Time** | About an hour | About two hours |
| **Weekly parlay page** | Works, Claude keeps it updated | Realistically you switch it off |

You can start on Route B and move to Route A later. Nothing is lost.

## Before you start

- **Your league has to be on Sleeper.** The site pulls everything (standings, matchups, trades, drafts) from Sleeper. It will not work with ESPN, Yahoo, or NFL.com leagues.
- **GitHub and Vercel are free for this.** Claude Code is only needed for Route A, and the free Claude plan doesn't include it.
- **Use a computer, not a phone**, for the setup.
- **Find your Sleeper league ID.** Open your league at [sleeper.com](https://sleeper.com) in a browser. The long number in the address bar (about 18 digits) is the league ID. Copy it somewhere handy.

## What the three services do

| Service | What it is | What you do there |
|---|---|---|
| **GitHub** | Where the site's files live | Make an account, copy the site, approve changes |
| **Vercel** | Turns those files into a live website | Set it up once, then mostly ignore it |
| **Claude Code** (Route A only) | An AI that edits the files for you | Tell it what you want changed |

Whenever the files on GitHub change, Vercel rebuilds your website by itself within a minute or two.

## Step 1: Get your own copy of the site (GitHub)

1. Go to [github.com/signup](https://github.com/signup) and make a free account. Pick any username.
2. Go to [github.com/jackfallon19/mr-chedda](https://github.com/jackfallon19/mr-chedda).
3. Click **Fork** near the top right, then **Create fork**. Leave every setting alone.

You now have your own copy at `github.com/YOUR-USERNAME/mr-chedda`. Nothing you do to it affects Jack's site.

## Step 2: Put it on the internet (Vercel)

1. Go to [vercel.com/signup](https://vercel.com/signup) and choose **Continue with GitHub**. Pick the free **Hobby** plan if it asks.
2. Approve it when GitHub asks whether Vercel can see your repositories.
3. Click **Add New…** then **Project**, find `mr-chedda` in the list, and click **Import**.
4. Don't change any settings. Click **Deploy** and wait a minute or two.
5. Click **Visit** (or the preview picture) to open your site. Save that web address. That's what you'll send your league.

**It will show Jack's league right now.** That's expected. The next part fixes it.

Now pick a route. For Route A, carry on to Step 3. For Route B, skip down to [Route B: do it by hand](#route-b-do-it-by-hand-free).

---

# Route A: Claude does it (paid)

## Step 3: Connect Claude to your copy

1. Go to [claude.ai/code](https://claude.ai/code) and sign in with your paid Claude account.
2. Click **Sign in with GitHub** and approve it.
3. In the repository picker, choose `YOUR-USERNAME/mr-chedda`. Make sure it's the one with *your* username, not `jackfallon19`.
4. If Claude asks to install the "Claude GitHub App" on your repository at any point, say yes.

## Step 4: Have Claude convert the site to your league

Copy everything in the box below, paste it into Claude, and press Enter.

```text
I just forked this repo from a friend. It's a Sleeper fantasy football league
website (SvelteKit) that Vercel redeploys whenever the master branch of my
fork changes. It's still set up for my friend's league and I need it converted
to mine.

I'm not a programmer. Please make all the edits yourself, explain things in
plain English, and ask me questions one at a time rather than all at once.
Start by asking for my Sleeper league ID.

Here is everything that's specific to my friend's league and needs to change:

1. src/lib/utils/leagueInfo.js
   - leagueID, leagueName, dues, dynasty: ask me.
   - homepageText: ask me what I want the homepage to say.
   - managers: replace the whole list. Look up my league's managers at
     https://api.sleeper.app/v1/league/<my league ID>/users and build one
     entry per manager with their managerID and name. Ask me whether I want
     to give bios now or leave them blank for later.
   - enableBlog: set to false. The blog needs a separate Contentful account
     and I'm skipping it for now.

2. src/routes/+page.svelte
   - There's a hard-coded "Preseason Dress Odds" list of my friend's
     managers. Remove that section unless I say I want my own version.
   - The award titles "Winner of Dinna with Mr. Chedda" and "Dress Bitch"
     are my friend's names for champion and last place. Ask me what my
     league calls them.

3. src/lib/Matchups/BracketsColumn.svelte and
   src/lib/Matchups/MatchupsAndBrackets.svelte
   - "Dinna Bracket" and "Dress Yoffs" are my friend's names for the
     winners' and losers' playoff brackets. Ask me what to call them.

4. The weekly parlay page (src/routes/parlay-history,
   src/lib/ParlayHistory, src/lib/data/parlayHistory.json, and its entry
   in src/lib/utils/tabs.js)
   - Ask me whether my league does a weekly group parlay.
   - If no: remove the page and its menu entry.
   - If yes: empty parlayHistory.json down to a single empty season for
     the current year, replace the "Mr. Chedda" labels in
     src/lib/ParlayHistory/index.svelte with my league's name, and rewrite
     the manager table and ID list in docs/PARLAY-DATA-GUIDE.md and
     src/lib/data/README.md for my managers.

5. src/routes/constitution/+page.svelte
   - This is a generic template constitution. Ask whether I want to
     replace it with my league's rules or hide the page.

6. static/manifest.json and src/app.html
   - Change the app name "League Page" to my league name.

After that, search the whole repo for anything else that mentions
"Chedda", "Dinna", "Dress", or my friend's manager names and fix it.

Rules:
- Run "npm install" and "npm run build" before you finish, and fix
  anything that fails.
- All changes go to MY fork only. Any pull request must target the master
  branch of my own repository, never jackfallon19/mr-chedda or
  nmelhado/league-page.
- When you're done, tell me in one or two sentences exactly what to click
  to make the changes go live.
```

Then just answer its questions. If you don't know an answer, say "skip that for now".

## Step 5: Make the changes go live

Claude works on a draft copy of your files, so nothing changes on your website until you approve it.

1. When Claude says it's finished, click **Create PR**. ("PR" means "pull request", which is just "please add these changes to my site".)
2. Open the pull request on GitHub. **Check the top of the page says your username, not `jackfallon19`.** If it shows Jack's name, stop and text Jack.
3. Click the green **Merge pull request** button, then **Confirm merge**.
4. Wait two minutes and refresh your website.

You're done. Skip to [After setup](#after-setup).

---

# Route B: do it by hand (free)

You'll edit the files directly on the GitHub website. There is no pull request on this route: each time you save a file, your website rebuilds by itself.

## How to edit a file on GitHub

You'll repeat this for every file below.

1. Go to your copy at `github.com/YOUR-USERNAME/mr-chedda`.
2. Click through the folders to the file. For `src/lib/utils/leagueInfo.js` that means clicking `src`, then `lib`, then `utils`, then `leagueInfo.js`.
3. Click the **pencil icon** at the top right of the file.
4. Make your changes. Press Ctrl+F (Cmd+F on a Mac) to search inside the file.
5. Click the green **Commit changes…** button, then **Commit changes** again.
6. Wait two minutes and refresh your website to check it.

**The one rule:** only change the words. Leave every quote mark, comma, bracket and `<p>` exactly where it is. A single missing quote mark stops the site from rebuilding.

## Step B1: Your league's details

Edit `src/lib/utils/leagueInfo.js`.

**The top six lines:**

| Line | Change |
|---|---|
| 2 | Replace the long number with your Sleeper league ID. Keep the quote marks. |
| 3 | Replace `Chedda Cheese` with your league name. Keep the quote marks. |
| 4 | Replace `100` with your league dues. Just the number, no `$`. |
| 5 | `true` if yours is a dynasty league, otherwise leave `false`. |
| 6 | Change `true` to `false`. This switches off the blog, which needs another account. |

**The homepage text (lines 10 to 13):** each line is one paragraph, starting with `<p>` and ending with `</p>`. Replace the words in between with your own. Delete a whole line if you want fewer paragraphs.

**The managers (line 25 onward):** there are ten blocks, one per manager. Each block starts with a line that is just `{` and ends with a line that is just `},`.

1. In a new tab, open `https://api.sleeper.app/v1/league/YOUR-LEAGUE-ID/users` with your league ID in place of `YOUR-LEAGUE-ID`. It's a wall of text. For each person, find their `"display_name"` and the `"user_id"` number near it.
2. In each block, change three lines: `"managerID"` (the user_id number), `"name"`, and `"bio"`. Keep the quote marks around all three.
3. Fewer than ten managers: delete whole extra blocks, from the `{` line to the `},` line.
4. More than ten: copy a whole block and paste it right after another block's `},` line.

*Shortcut:* if you don't want manager pages at all, delete every block so that `export const managers = [` is followed directly by the `]` line. The Managers page then disappears from the menu.

Commit the file and check your site. It should now show your league's standings and matchups.

## Step B2: Rename Jack's league nicknames

Jack's league has its own names for things. In each file below, search for the text on the left and type your own in its place.

| File | Find | It is |
|---|---|---|
| `src/routes/+page.svelte` | `Winner of Dinna with Mr. Chedda` | Homepage heading for the list of champions |
| `src/routes/+page.svelte` | `Dress Bitch` | Homepage heading for the list of last-place finishers |
| `src/routes/+page.svelte` | `Preseason Dress Odds` | Homepage heading for a list of odds (see below) |
| `src/lib/Matchups/MatchupsAndBrackets.svelte` | `Dinna Bracket` | Button for the winners' playoff bracket |
| `src/lib/Matchups/MatchupsAndBrackets.svelte` | `Dress Yoffs` | Button for the losers' bracket |
| `src/lib/Matchups/BracketsColumn.svelte` | `Dinna Bracket Final` (appears twice) | Label on the championship game |
| `src/lib/Matchups/BracketsColumn.svelte` | `Dress Yoffs Final` (appears twice) | Label on the last-place game |

**The odds list.** Near the top of `src/routes/+page.svelte` (lines 11 to 20) is a list of Jack's managers with betting odds for finishing last, one per line, like `{ name: 'Enright', odds: '+450' },`. Change the names and odds to your own league's. Add or delete whole lines to match your number of managers. Removing the list entirely means deleting a chunk of code, which is the one job on this route that's easy to get wrong, so use the tip below for that.

## Step B3: Switch off the weekly parlay page

This page tracks a group bet Jack's league places every week. Keeping it up to date by hand means editing a data file every week, so on this route it's simplest to switch it off.

1. Edit `src/lib/utils/tabs.js`. Search for `Weekly Parlay History`. Delete the five lines of that block: the `{` line above it, the `icon`, `label` and `dest` lines, and the `},` line below. Commit.
2. Edit `src/lib/data/parlayHistory.json`. Select everything (Ctrl+A or Cmd+A), delete it, and paste this in its place so Jack's bets aren't sitting on your site. Commit.

```json
{
  "seasons": [
    { "year": "2026", "weeks": [] }
  ]
}
```

If your league does want this page, the instructions for adding a week by hand are in `src/lib/data/README.md`. It's much easier on Route A.

## Step B4: Optional extras

- **League rules page.** `src/routes/constitution/+page.svelte` is a generic sample rulebook. Replace the words between each `<p>` and `</p>` with your own rules. To hide the page instead, delete its block in `src/lib/utils/tabs.js` the same way you did for the parlay page (search for `Constitution`).
- **Manager photos.** In the `static/managers` folder click **Add file**, then **Upload files**. Then set that manager's `"photo"` line in `leagueInfo.js` to `"/managers/your-file-name.jpg"`. Capital letters must match exactly.

## Tip: a free AI chat can do the fiddly edits

For anything that feels risky, like removing the odds list or changing all the managers at once:

1. Open the file on GitHub, click the pencil, select everything, and copy it.
2. Paste it into a free AI chat such as [claude.ai](https://claude.ai) and say what you want. For example: "Remove the Preseason Dress Odds section from this file and give me back the whole file."
3. Select everything in the GitHub editor, paste the answer over it, and commit.

---

# After setup

**Route A: any change, any time.** Go back to [claude.ai/code](https://claude.ai/code), pick your repository, and say what you want. For example:

- "Add this week's parlay: (paste the picks, who placed it, and what hit)"
- "Change the homepage text to: ..."
- "Add a bio for Mike: ..."
- "Mike left the league and Dave took over his team"

Then repeat Step 5.

**Route B: any change, any time.** Edit the file on GitHub the same way. Homepage text, bios and manager changes are all in `src/lib/utils/leagueInfo.js`.

**Every new season.** Sleeper gives your league a new ID each year. Once the new season's league exists in Sleeper, put the new ID on line 2 of `src/lib/utils/leagueInfo.js`, or on Route A tell Claude: "Our new Sleeper league ID is ____, update the site for the new season."

# If something goes wrong

- **The site still shows Jack's league.** On Route A you probably haven't merged the pull request yet (Step 5). On either route Vercel may still be building. Wait two minutes and refresh.
- **Your change never shows up (Route B).** The rebuild probably failed, most often from a deleted quote mark or comma. Your site stays on the last working version in the meantime. Open the file again and compare the line you changed with the lines around it.
- **The site shows an error page, or Vercel says the build failed.** Go to your project on vercel.com, open the failed deployment, and copy the red error text. On Route A paste it to Claude and say "please fix this". On Route B paste it into a free AI chat together with the file you last edited.
- **You can't break anything permanently.** Every change is saved in GitHub's history and can be undone. On Route A tell Claude "undo the last change". On Route B, text Jack.
