import {leagueID} from '$lib/utils/leagueInfo';

export const tabs = [
    {
        icon: 'home',
        label: 'Home',
        dest: '/',
        key: 'home',
    },
    {
        icon: 'sports',
        label: 'Matchups',
        dest: '/matchups',
        key: 'matchups',
    },
    {
        icon: 'local_fire_department',
        label: 'Head to Head',
        dest: '/rivalry',
        key: 'rivalry',
    },
    {
        icon: 'leaderboard',
        label: 'Standings',
        dest: '/standings',
        key: 'standings',
    },
    {
        icon: 'view_comfy',
        label: 'League Info',
        nest: true,
        key: 'league_info',
        children: [
            {
                icon: 'swap_horiz',
                label: 'Trades & Waivers',
                dest: '/transactions',
            },
            {
                icon: 'article',
                label: 'Blog',
                dest: '/blog',
            },
            {
                icon: 'casino',
                label: 'Weekly Parlay History',
                dest: '/parlay-history',
            },
            {
                icon: 'storage',
                label: 'Rosters',
                dest: '/rosters',
            },
            {
                icon: 'groups',
                label: 'Managers',
                dest: '/managers',
            },
            {
                icon: 'view_comfy',
                label: 'Drafts',
                dest: '/drafts',
            },
            {
                icon: 'emoji_events',
                label: 'Trophy Room',
                dest: '/awards',
            },
            {
                icon: 'military_tech',
                label: 'Records',
                dest: '/records',
            },
            {
                icon: 'history_edu',
                label: 'Constitution',
                dest: '/constitution',
            },
            {
                icon: 'sports_football',
                label: 'Go to Sleeper',
                dest: `https://sleeper.app/leagues/${leagueID}`,
            },
        ]
    },
];