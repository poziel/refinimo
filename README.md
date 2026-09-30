<img src="public/images/readme-banner-decorative.png" alt="Refinimo — Collaborative planning poker" width="100%">

![Refinimo](public/images/headings/refinimo.png)

Refinimo is a collaborative planning poker app for teams that want estimation sessions to feel simple, quick, and a little less ceremonial.

Create a room, invite your teammates, vote privately, reveal together, and use the discussion to land on a shared estimate. Refinimo runs as a static web app and uses your own Firebase Realtime Database project for live room sync, so there is no custom backend server to deploy or maintain.

![Why It Exist](public/images/headings/why-it-exists.png)

Planning poker is best when it stays out of the way.

Refinimo gives teams the core loop they need:

- create a planning room
- pick an estimation deck
- invite people with a link
- vote without anchoring each other
- reveal the spread
- discuss outliers
- save the useful bits for later

It also includes the practical extras that real sessions eventually ask for: custom decks, task context, round history, timers, leader mode, reactions, profile/avatar preferences, and a separate voting dock for another screen or device.

<details>
<summary>Show screenshots</summary>

### Landing Page

The front door: what Refinimo is, how Firebase setup works, and why teams can bring their own realtime backend.

| Light | Dark |
| --- | --- |
| ![Refinimo landing page in light theme](docs/screenshots/landing-page-light-theme.png.png) | ![Refinimo landing page in dark theme](docs/screenshots/landing-page-dark-theme.png) |

### Lobby

The place to start or rejoin planning sessions, with recent rooms close at hand.

| Light | Dark |
| --- | --- |
| ![Refinimo lobby in light theme](docs/screenshots/lobby-light-theme.png) | ![Refinimo lobby in dark theme](docs/screenshots/lobby-dark-theme.png) |

### Create Or Join

Room setup keeps the important choices visible: deck, special cards, history, task context, timers, reactions, and leader mode.

| Light | Dark |
| --- | --- |
| ![Refinimo create room page in light theme](docs/screenshots/join-create-page-light-theme.png) | ![Refinimo create room page in dark theme](docs/screenshots/join-create-page-dark-theme.png) |

### Room Creation

The room creation flow is dense enough for real planning defaults, without turning setup into a form marathon.

| Light | Dark |
| --- | --- |
| ![Refinimo room creation options in light theme](docs/screenshots/lobby-creation-light-theme.png) | ![Refinimo room creation options in dark theme](docs/screenshots/lobby-creation-dark-theme.png.png) |

### Voting Results

After reveal, Refinimo shows who voted, the vote spread, and the useful summary numbers for the discussion.

| Light | Dark |
| --- | --- |
| ![Refinimo room after voting in light theme](docs/screenshots/lobby-after-vote-lighh-theme.png) | ![Refinimo room after voting in dark theme](docs/screenshots/lobby-after-vote-dark-theme.png) |

### Avatar Settings

Profiles let each participant tune their name, avatar, theme, room display, and optional support settings.

| Light | Dark |
| --- | --- |
| ![Refinimo avatar settings in light theme](docs/screenshots/user-settings-avatar-light-theme.png) | ![Refinimo avatar settings in dark theme](docs/screenshots/user-settings-avatar-dark-theme.png) |

</details>

![How It Works](public/images/headings/how-it-works.png)

Refinimo is intentionally small in shape:

```text
Browser app + Firebase Realtime Database = live planning room
```

The Vue app handles the interface, routing, preferences, voting logic, and result display. Firebase stores the shared room state so every participant sees the same room update in real time.

In practice:

1. Someone configures Refinimo with a Firebase web app config.
2. They create a room.
3. Refinimo writes the room to Firebase under `rooms/{roomId}`.
4. Everyone joins the same room link.
5. Votes, reveals, timers, participants, and history sync through Firebase.
6. Personal preferences, such as display name, avatar, theme, recent rooms, and ad opt-in, stay in browser storage.

That means teams keep control of their Firebase project and room data. Refinimo provides the interface; your Firebase project provides the live sync.

![Run It Locally](public/images/headings/run-it-locally.png)

Clone the repository:

```bash
git clone git@github.com:poziel/refinimo.git
cd refinimo
```

Install dependencies:

```bash
npm run init
```

The init command installs dependencies, reserves a local dev port, writes that port to `.env.local`, and adds `refinimo.local` to your hosts file. On Windows, run it from an elevated PowerShell window so it can update `C:\Windows\System32\drivers\etc\hosts`.

Start the development server:

```bash
npm run dev
```

Open the app at the URL printed by `npm run init`, for example:

```text
http://refinimo.local:3000
```

To use real rooms locally, create a Firebase project, enable Realtime Database, register a Firebase Web app, and paste the generated config into Refinimo. The detailed Firebase walkthrough lives in [CONFIG.md](CONFIG.md).

![Tech Stack](public/images/headings/tech-stack.png)

- Vue 3
- TypeScript
- Vite
- Vuetify
- Pinia
- Vue Router
- Firebase Realtime Database
- Vitest
- Playwright
- ESLint

<details>
<summary>Show the project shape</summary>

```text
src/
  pages/          Route-level screens: landing, lobby, config, create, room, dock
  components/     Room UI, voting controls, profile/config modals, history panels
  stores/         Pinia state for app UI, Firebase config, identity, preferences
  composables/    Shared room and voting behavior
  utils/          Firebase helpers, ad handling, dock links, avatars, timers
  types/          Room, vote, task, timer, and history contracts

tests/
  unit/           Vitest coverage for focused logic
  e2e/            Playwright browser flows

public/
  404.html        GitHub Pages fallback for client-side routes
```

</details>

![Local Commands](public/images/headings/local-commands.png)

```bash
npm run init         # install dependencies and configure refinimo.local
npm run dev          # start the local Vite dev server
npm run build        # type-check and build production assets
npm run preview      # preview the production build
npm run type-check   # run vue-tsc
npm run lint         # run ESLint
npm run lint:fix     # auto-fix lint issues when possible
npm run test:unit    # run Vitest unit tests
npm run test:e2e     # run Playwright E2E tests
npm run test:e2e:ui  # open the Playwright test UI
npm run test         # run unit tests, then E2E tests
```

Before running Playwright for the first time:

```bash
npx playwright install chromium
```

The E2E suite uses a mocked Firebase server, so tests can exercise room flows without requiring a live Firebase project.

![Deployment](public/images/headings/deployment.png)

Refinimo is built as static files and is intended to be hosted at:

```text
https://refinimo.app
```

For the custom domain, keep the Vite base path at `/`. GitHub Pages deep links are handled by `public/404.html`, which lets routes such as `/app/room/:roomId` recover correctly after a browser refresh.

Firebase Realtime Database does not need a special domain change for the current app. If Firebase Auth, App Check, or Firebase Hosting are added later, the deployed domain should be added to the relevant Firebase allowed-domain settings.

![Credit & License](public/images/headings/credit-and-license.png)

Refinimo is built with Vue, Vite, Vuetify, Firebase, DiceBear, Material Design Icons, Playwright, Vitest, and a lot of small open-source gifts that make web apps nicer to build.
