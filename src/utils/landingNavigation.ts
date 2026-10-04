export const LANDING_PAGES = [
  {
    id: 'pitch',
    path: '/',
    label: 'Overview',
    title: 'Planning poker for scrum teams',
    description: 'Pick a card. Plan together. Free collaborative planning poker with live voting, flexible decks, and a database your team controls.',
  },
  {
    id: 'features',
    path: '/features',
    label: 'Features',
    title: 'Features',
    description: 'Explore Refinimo: private voting, simultaneous reveals, flexible decks, round history, timers, leader controls, and a separate voting dock.',
  },
  {
    id: 'database',
    path: '/your-database',
    label: 'Your database',
    title: 'Your database',
    description: 'Bring your own Firebase Realtime Database to Refinimo. Follow three illustrated steps to create your project, apply the rules, and connect your team.',
  },
  {
    id: 'about',
    path: '/about',
    label: 'About',
    title: 'About & credits',
    description: 'Meet the people and open-source projects behind Refinimo, including the original Poker0Matic foundation.',
  },
] as const

export const APP_ENTRY_ICON = 'mdi-login'
