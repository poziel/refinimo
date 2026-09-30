<img src="public/images/readme-banner-decorative.png" alt="Refinimo — Collaborative planning poker" width="100%">

<a id="refinimo"></a>

# ![Refinimo](public/images/headings/refinimo.png)

Refinimo is a free planning poker app for teams that want to get straight to estimation. Create a room, invite your teammates, and turn individual votes into a shared estimate in an interface built to keep the session moving.

Use custom decks, choose a room view that suits your team, and keep task context and round history close at hand. Refinimo is ad-free by default and follows a **Bring Your Own Database (BYODB)** approach: your team's Firebase project stores the shared room data.

[Try Refinimo](https://refinimo.com/) · [Set up your database](CONFIG.md) · [MIT license](LICENSE)

<a id="why-it-exists"></a>

## ![Why It Exists](public/images/headings/why-it-exists.png)

I built Refinimo because I wanted a planning poker tool I would enjoy using: free, quick to get into, and pleasant to spend a session in. I wanted the focus to stay on voting and discussion, without a subscription or unwanted advertising getting in the way.

I also wanted features I was missing in other tools, with enough flexibility to fit the way different teams work:

- **Shape the session:** custom decks, optional timers, leader controls, and emoji reactions.
- **Choose your workspace:** five room views, keyboard shortcuts, and a voting dock for another window or your phone.
- **Keep the useful context:** task details, round history, and the ability to revisit earlier estimates.
- **Bring your own database:** connect a Firebase project you control, whether you use the official website or host your own copy.

Advertising is optional and disabled by default. You can enable it in your preferences if you want to support the project; voting features do not depend on it.

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

Choose the deck, voting rules, task context, timers, and leader controls for a session.

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

<a id="how-it-works"></a>

## ![How It Works](public/images/headings/how-it-works.png)

An estimation session follows a simple loop:

1. **Connect your database.** One organizer sets up a Firebase Realtime Database project and enters its web app configuration in Refinimo.
2. **Create a room.** Choose your estimation deck and the options your team needs, such as task information, history, timers, or leader mode.
3. **Invite your teammates.** Copy the room's invitation link. It includes the database configuration so everyone can connect to the same session.
4. **Estimate independently.** Discuss the task and select a card. Vote values stay hidden in the interface until the round is revealed.
5. **Reveal and discuss.** Compare the votes, talk through differences, and agree on an estimate. With history enabled, record the final estimate for later reference.
6. **Move to the next task.** Start a new round in the same room. Participants, votes, and room controls update in real time.

### Bring Your Own Database (BYODB)

BYODB means that Refinimo supplies the interface while **your Firebase Realtime Database project** supplies the shared storage and live updates. Your team chooses and manages the Firebase project it uses.

You can connect that project to [refinimo.com](https://refinimo.com/) without hosting the frontend yourself. Teammates joining through an invitation do not each need a separate Firebase project. Self-hosting is an additional option if you want to run your own copy of the interface.

Your Firebase configuration and personal preferences are saved in your browser. Shared room data—including participant names and avatars, votes, task information, and history—syncs through Firebase. You manage the Firebase project and its access rules; the [setup guide](CONFIG.md) explains how to connect it.

Under the hood, Refinimo is a static Vue application that talks directly to Firebase. There is no custom backend server to deploy or maintain.

<a id="tech-stack"></a>

## ![Tech Stack](public/images/headings/tech-stack.png)

| Technology | What it does in Refinimo |
| --- | --- |
| **Vue 3 + TypeScript** | Build the interactive screens and define the room, vote, task, and history data structures. |
| **Vuetify + custom Vue components** | Provide interface controls and theming, alongside layouts and interactions built for planning poker. |
| **Pinia + Vue Router** | Manage application state and preferences, and navigation between setup, lobby, rooms, and the voting dock. |
| **Firebase Realtime Database** | Synchronize shared room state across participants using the team's own Firebase project. |
| **Vite** | Run the local development server and produce the static files used for deployment. |
| **Vitest** | Test focused logic such as timers, reactions, keyboard shortcuts, and dock sessions. |
| **Playwright** | Exercise browser workflows, including setup, room creation, voting, and multiple participants. |
| **ESLint** | Check code quality and consistency while developing. |

Supporting libraries handle generated avatars (DiceBear), custom avatar cropping (Vue Advanced Cropper), image checks in the browser (NSFWJS and TensorFlow.js), and QR codes for phone voting.

<details>
<summary>Show the project structure</summary>

```text
src/
  pages/          Landing, lobby, configuration, room creation, room, and dock
  components/     Voting controls, room views, settings, and history panels
  stores/         Application state, Firebase configuration, and preferences
  composables/    Shared room and voting behavior
  utils/          Firebase helpers, avatars, keyboard shortcuts, docks, and timers
  types/          Room, vote, task, timer, and history data structures

tests/
  unit/           Focused logic tests
  e2e/            Browser workflows

public/
  404.html        GitHub Pages fallback for client-side routes
```

</details>

<a id="run-it-locally"></a>

## ![Run It Locally](public/images/headings/run-it-locally.png)

Prerequisites: **Git**, **Node.js 22.x (22.13.0 or newer)**, and **npm**. The project's CI runs on Node.js 22.

Clone the repository, install the locked dependencies, and start the development server:

```bash
git clone https://github.com/poziel/refinimo.git
cd refinimo
npm ci
npm run dev
```

If you are working from a fork, use your fork's clone URL instead. Open the URL printed by Vite; a fresh checkout defaults to `http://localhost:3000`.

The landing page and configuration screens work without a database. To create or join real rooms, follow [CONFIG.md](CONFIG.md) and enter your Firebase configuration at `/app/config`.

<details>
<summary>Optional local hostname and port configuration</summary>

Vite reads these optional settings from `.env.local`:

```dotenv
LOCAL_DEV_HOST=refinimo.local
LOCAL_DEV_BIND_HOST=127.0.0.1
LOCAL_DEV_PORT=3000
```

Using `refinimo.local` also requires a hosts-file entry mapping it to `127.0.0.1`. You can change only `LOCAL_DEV_PORT` if you simply need another port. Vite requires the selected port to be available.

The repository includes an `npm run init` helper that configures this hostname, writes the local environment settings, records an assigned port, and installs dependencies. Its npm-launch step currently fails on Windows, so use the standard setup above there. The helper modifies the system hosts file and requires permission to write it.

</details>

<a id="local-commands"></a>

## ![Local Commands](public/images/headings/local-commands.png)

These are the main commands for developing a fork and checking changes before sharing them:

| Command | When to use it |
| --- | --- |
| `npm run dev` | Work on the app with Vite's development server and live updates. |
| `npm run build` | Type-check the application and generate a production build in `dist/`. |
| `npm run preview` | Serve the existing `dist/` build locally to check it before deployment. Run `build` first. |
| `npm run lint` | Check the source for code-quality and style issues. |
| `npm run test` | Run the unit tests, followed by the browser test suite. |

Before running browser tests for the first time, install Playwright's Chromium browser:

```bash
npx playwright install chromium
```

Playwright starts its own local server with a mocked Firebase backend. You do not need a real Firebase project or a separately running development server for these tests.

For a quicker check while working, use `npm run test:unit` for logic tests or `npm run test:e2e` for browser workflows. Other development helpers are listed in [package.json](package.json).

<a id="deployment"></a>

## ![Deployment](public/images/headings/deployment.png)

The official application is available at **[https://refinimo.com/](https://refinimo.com/)**. You can use it with your Firebase project without deploying your own frontend.

To host your own copy, build the app and publish the contents of `dist/` to a static hosting service:

```bash
npm run build
```

This repository's [deployment workflow](.github/workflows/deploy.yml) publishes to **GitHub Pages** on pushes to `main` or when run manually. For a fork, enable GitHub Pages with **GitHub Actions** as the source and configure your own domain or hosting target.

The current setup expects the app at the domain root, with the Vite base path set to `/`. On GitHub Pages, `public/404.html` and `index.html` restore deep links such as `/app/room/:roomId` after a refresh. For other static hosts, configure a fallback to `index.html` for application routes. Hosting beneath a project subdirectory also requires adapting the route fallback; changing the Vite base alone is not enough.

Firebase remains the live backend for either deployment. See [CONFIG.md](CONFIG.md) for database configuration and access rules.

<a id="credit-and-license"></a>

## ![Credit & License](public/images/headings/credit-and-license.png)

Refinimo is licensed under the **[MIT License](LICENSE)**.

Thank you to the projects and creators that make it possible:

- **Vue, Vite, Vuetify, Pinia, and Vue Router** for the application foundation, and **Firebase** for realtime synchronization.
- **[DiceBear](https://www.dicebear.com/)** and **[Gravatar](https://gravatar.com/)** for avatar options.
- **[Anggara Putra](https://www.magnific.com/author/anggara-putra)** for the playing-card suit artwork, and **[Material Design Icons](https://pictogrammers.com/library/mdi/)** for interface icons.
- **[Vue Advanced Cropper](https://github.com/advanced-cropper/vue-advanced-cropper)** for avatar cropping, and **[NSFWJS](https://github.com/infinitered/nsfwjs)** with **[TensorFlow.js](https://www.tensorflow.org/js)** for custom avatar image checks.
- **Vitest, Playwright, and ESLint** for the testing and development tools.

The application's [Attributions page](https://refinimo.com/app/attributions) includes individual artwork links. Third-party dependencies and artwork retain their respective licenses.
