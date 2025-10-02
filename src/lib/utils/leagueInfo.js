/*   STEP 1   */
export const leagueID = "1250549223967948800"; // your league ID
export const leagueName = "Chedda Cheese"; // your league name
export const dues = 100; // (optional) used in template constitution page
export const dynasty = false; // true for dynasty leagues, false for redraft and keeper
export const enableBlog = true; // requires VITE_CONTENTFUL_ACCESS_TOKEN and VITE_CONTENTFUL_SPACE environment variables

/*   STEP 2   */
export const homepageText = `
  <p>Gentlemen,</p>
  <p>Welcome to the offical Chedda Cheese website. This is where we crawl out of Sleeper’s bland-ass reports and serve up something meater than the steak I hope eat with Mr. Chedda at dinna one day.<p>
  <p>Here you’ll get:<p>
  <p>Game insights (a.k.a. why your team is going to win - reverse jinx will live here as well)<p>
    <p>Injury reports (My name WILL pop up more than the photo of Faoro grabbing a handful of muff)
    <p>The Weekly Parlay (guaranteed to hit right once we stop bettting on Boos' players)<p>
    <p>Trade updates (watch your dumb ass get fleeced and then still defend the move like you’re a genius - shoutout Enright I cannot wait to have Rome for a decade)<p>
<p>This isn’t just fantasy football. This is the place where egos die, trash talk thrives, and one of you clowns wears a dress at Wrigley on a beuatiful day in June.</p>
`;

/*   STEP 3   */
/*
3 managers as an example. Uncomment (remove the //) before each line to make it live code
If you're having trouble, reference the Training Wheels' Manager Section
https://github.com/nmelhado/league-page/blob/master/TRAINING_WHEELS.md#ii-adding-managers-and-changing-the-homepage-text
*/

// To omit an optional field, set it's value to null

export const managers = [
    {
      "managerID": "887911442844925952",
      "name": "jfaoro",
      "tookOver": null,
      "location": null,
      "bio": "Consistently forgets to set his lineup with the reliability of a Swiss watch running backwards. At this point, his bench players have Stockholm syndrome from never seeing the field. The league's only manager who treats 'active roster' as more of a suggestion than a requirement.",
      "photo": "/managers/name.jpg",
      "fantasyStart": null,
      "favoriteTeam": null,
      "mode": "Win Now",
      "rival": {
        name: "Rival",
        link: null,
        image: "/managers/everyone.png",
      },
      "favoritePlayer": null,
      "valuePosition": null,
      "rookieOrVets": null,
      "philosophy": "Your fantasy team's philosophy",
      "tradingScale": 10,
      "preferredContact": "Sleeper",
    },
    {
      "managerID": "990520804859232256",
      "name": "tigbits711",
      "tookOver": null,
      "location": null,
      "bio": "Our fearless Commissioner, ruling like Stalin with an iron fist and zero democratic process. A perennial threat who's always close but never close enough—destined to wear the dress forever but never hoist the trophy. The league's been trying to boot him out of office, but good luck getting him to give up power. Dictator for life, runner-up for eternity.",
      "photo": "/managers/name.jpg",
      "fantasyStart": null,
      "favoriteTeam": null,
      "mode": "Win Now",
      "rival": {
        name: "Rival",
        link: null,
        image: "/managers/everyone.png",
      },
      "favoritePlayer": null,
      "valuePosition": null,
      "rookieOrVets": null,
      "philosophy": "Your fantasy team's philosophy",
      "tradingScale": 10,
      "preferredContact": "Sleeper",
    },
    {
      "managerID": "990522132113240064",
      "name": "ChuckLeady",
      "tookOver": null,
      "location": null,
      "bio": "The league's most notorious trade fleece artist and reigning champion. Has convinced more managers to make terrible trades than a used car salesman on commission. If Chuck texts you about a 'fair deal,' check your roster immediately—you're already down a first-rounder.",
      "photo": "/managers/name.jpg",
      "fantasyStart": null,
      "favoriteTeam": null,
      "mode": "Win Now",
      "rival": {
        name: "Rival",
        link: null,
        image: "/managers/everyone.png",
      },
      "favoritePlayer": null,
      "valuePosition": null,
      "rookieOrVets": null,
      "philosophy": "Your fantasy team's philosophy",
      "tradingScale": 10,
      "preferredContact": "Sleeper",
    },
    {
      "managerID": "990524585852354560",
      "name": "ryebread00",
      "tookOver": null,
      "location": null,
      "bio": "The king of the reverse jinx—came close in Year 1 and has been trying to speak losses into existence ever since. Narrator: it worked too well. Was knocking on the championship door once, but that door slammed shut harder than his playoff hopes. Won't be back any time soon, but he'll tell you he's definitely losing this week.",
      "photo": "/managers/name.jpg",
      "fantasyStart": null,
      "favoriteTeam": null,
      "mode": "Win Now",
      "rival": {
        name: "Rival",
        link: null,
        image: "/managers/everyone.png",
      },
      "favoritePlayer": null,
      "valuePosition": null,
      "rookieOrVets": null,
      "philosophy": "Your fantasy team's philosophy",
      "tradingScale": 10,
      "preferredContact": "Sleeper",
    },
    {
      "managerID": "990704123299336192",
      "name": "jenright19",
      "tookOver": null,
      "location": null,
      "bio": "Makes moves so questionable that the chat needs a dedicated 'WTF Enright' channel. His boy Clyborn may come out of retirement—which is either a brilliant 4D chess move or further proof that we need an intervention. Spoiler alert: it's never 4D chess.",
      "photo": "/managers/name.jpg",
      "fantasyStart": null,
      "favoriteTeam": null,
      "mode": "Win Now",
      "rival": {
        name: "Rival",
        link: null,
        image: "/managers/everyone.png",
      },
      "favoritePlayer": null,
      "valuePosition": null,
      "rookieOrVets": null,
      "philosophy": "Your fantasy team's philosophy",
      "tradingScale": 10,
      "preferredContact": "Sleeper",
    },
    {
      "managerID": "990753572016943104",
      "name": "Nolanwest",
      "tookOver": null,
      "location": null,
      "bio": "We need some Ryder Cup merch. That's it. That's the bio. Seriously though, we need merch.",
      "photo": "/managers/name.jpg",
      "fantasyStart": null,
      "favoriteTeam": null,
      "mode": "Win Now",
      "rival": {
        name: "Rival",
        link: null,
        image: "/managers/everyone.png",
      },
      "favoritePlayer": null,
      "valuePosition": null,
      "rookieOrVets": null,
      "philosophy": "Your fantasy team's philosophy",
      "tradingScale": 10,
      "preferredContact": "Sleeper",
    },
    {
      "managerID": "991503715234271232",
      "name": "billm8",
      "tookOver": null,
      "location": null,
      "bio": "The most bipolar team in the league. Either dropping 170 points and crushing dreams, or limping to 95 and making everyone wonder if he even has a roster. There is no middle ground. It's either feast or famine, championship-level dominance or tank-mode catastrophe. Consistency? Never heard of her.",
      "photo": "/managers/name.jpg",
      "fantasyStart": null,
      "favoriteTeam": null,
      "mode": "Win Now",
      "rival": {
        name: "Rival",
        link: null,
        image: "/managers/everyone.png",
      },
      "favoritePlayer": null,
      "valuePosition": null,
      "rookieOrVets": null,
      "philosophy": "Your fantasy team's philosophy",
      "tradingScale": 10,
      "preferredContact": "Sleeper",
    },
    {
      "managerID": "991882566162558976",
      "name": "jwhill",
      "tookOver": null,
      "location": null,
      "bio": "Wore the dress last year and is speedrunning toward fashion history. On pace to become our first back-to-back dress wearer—a dubious honor nobody wants but he's absolutely earning. Some people learn from their mistakes. Jhill? He's committed to the bit.",
      "photo": "/managers/name.jpg",
      "fantasyStart": null,
      "favoriteTeam": null,
      "mode": "Win Now",
      "rival": {
        name: "Rival",
        link: null,
        image: "/managers/everyone.png",
      },
      "favoritePlayer": null,
      "valuePosition": null,
      "rookieOrVets": null,
      "philosophy": "Your fantasy team's philosophy",
      "tradingScale": 10,
      "preferredContact": "Sleeper",
    },
    {
      "managerID": "992186573034688512",
      "name": "CamMacIntosh",
      "tookOver": null,
      "location": null,
      "bio": "Known for grabbing some muff in his spare time. That's it. That's the entire scouting report. Legend status achieved off one photo that will never die.",
      "photo": "/managers/name.jpg",
      "fantasyStart": null,
      "favoriteTeam": null,
      "mode": "Win Now",
      "rival": {
        name: "Rival",
        link: null,
        image: "/managers/everyone.png",
      },
      "favoritePlayer": null,
      "valuePosition": null,
      "rookieOrVets": null,
      "philosophy": "Your fantasy team's philosophy",
      "tradingScale": 10,
      "preferredContact": "Sleeper",
    },
    {
      "managerID": "992838327420121088",
      "name": "jafallon",
      "tookOver": null,
      "location": null,
      "bio": "His roster should be sponsored by a hospital. No one is safe from the injury bug—starters, bench players, the waterboy. If you're on Fallon's team, you're one snap away from IR. At this point his team doctors deserve their own roster spot.",
      "photo": "/managers/name.jpg",
      "fantasyStart": null,
      "favoriteTeam": null,
      "mode": "Win Now",
      "rival": {
        name: "Rival",
        link: null,
        image: "/managers/everyone.png",
      },
      "favoritePlayer": null,
      "valuePosition": null,
      "rookieOrVets": null,
      "philosophy": "Your fantasy team's philosophy",
      "tradingScale": 10,
      "preferredContact": "Sleeper",
    },
  ]
  
  
  /*   !!  !!  IMPORTANT  !!  !! */
  /*
  Below is the most up to-date version of a manager. Please leave this commented out
  and don't delete it. This will be updated if any fields are added, removed or changed
  and will allow updates without causing merge conflicts
  */
  
    // {
    //   "roster": 3,  // (DEPRECATED! Don't use this anymore) ID of the roster that the manager manages (look at the order of the power rankings graph)
    //   "managerID": "12345678",  // the user's manager ID, go to https://api.sleeper.app/v1/league/<your_league_id>/users to find user IDs (you can use older leagueIDs to find user IDs for managers that are no longer in the league)
    //   "name": "Your Name",
    //   "tookOver": 2020, // (DEPRECATED! You don't need to use this anymore) (optional) used if a manager took over a team, delete this line or change to null otherwise
    //   "location": "Brooklyn", // (optional)
    //   "bio": "Lorem ipsum...",
    //   "photo": "/managers/name.jpg", // square ratio recommended (no larger than 500x500)
    //   "fantasyStart": 2014, // (optional) when did the manager start playing fantasy football
    //   "favoriteTeam": "nyj", // (optional) favorite NFL team, (follows convention: nyj, sea, mia, etc.) MUST BE LOWERCASE
    //   "mode": "Win Now", // (optional) 'Win Now', 'Dynasty', or 'Rebuild' (anything else and you will need to add a new png to /static/ similar to the 'Rebuild.png' and 'Win Now.png' currently in there)
    //   "rival": {
    //     name: "Rival", // Can be anything (usually your rival's name)
    //     link: 6, // manager array number within this array, or null to link back to all managers page
    //     image: "/managers/rival.jpg", // either a specific manager photo or '/managers/everyone.png' or '/managers/question.png'
    //   },
    //   "favoritePlayer": 1426, // (optional) this corresponds to the Sleeper player ID (https://api.sleeper.app/v1/players/nfl)
    //   "valuePosition": "WR", // (optional) Favorite position (QB, WR, RB, TE, etc.)
    //   "rookieOrVets": "Rookies", // (optional) 'Rookies' or 'Vets' (anything else and you will need to add a new png to /static/ similar to the 'Rookies.png' and 'Vets.png' currently in there)
    //   "philosophy": "Your fantasy team's philosophy", // (optional)
    //   "tradingScale": 10, // 1 - 10 (optional)
    //   "preferredContact": "Text",  // (optional) 'Text', 'WhatsApp', 'Sleeper', 'Email', 'Phone', 'Discord', and 'Carrier Pigeon' are currently supplied in the template
    // },
    
