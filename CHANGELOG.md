# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

Upcoming release notes are copied from merged pull request changelog sections.

## [2.1.0] - 2026-10-04

### Added
- Full interactive practice rooms that require no Firebase configuration and support repeated rounds, room settings, custom decks, timers, tasks, history, reactions, and a separate voting dock.
- A roster of 100 simulated teammates with individual names, colors, and varied avatar styles, weighted team sizes, and randomized visitor seating.
- Dedicated Features and Your database pages with illustrated Firebase setup instructions, console shortcuts, and expandable Realtime Database rules.
- A GitHub star button, shared maker credit, and planning artwork on the public site.
- A local setup command for assigning a development hostname and port, saving environment settings, and installing dependencies.
- An MIT license file.

### Modified
- Redesign the landing page and About page with consistent navigation, improved typography and icon spacing, responsive layouts, and refined light and dark theme surfaces.
- Reuse application playing-card designs throughout the public site and share room persistence and voting logic between live sessions and the practice room.
- Refresh the README and Firebase configuration guide with bring-your-own-database details, storage behavior, setup instructions, commands, and project artwork.


## [2.0.0] - 2026-06-12

### Added

- Refinimo branding, documentation, metadata, and screenshots for the renamed app.
- Unified Preferences modal with dedicated sections for display name, avatar, theme, room display, and advertising.
- Standalone keyboard shortcuts modal opened from the user menu.
- DiceBear, Gravatar, and custom image avatar flows with seed randomization, previewing, cropping, moderation, and saved rendered avatar URLs.
- Independent theme family selection plus `Follow system`, `Dark`, and `Light` mode behavior.
- Theme previews that show split light/dark variants when following the browser/system preference.
- External voting dock route, browser-window dock, phone/QR dock flow, and dock session heartbeat handling.
- Simple room view, console/activity log view, and group status view in addition to existing room presentations.
- Configurable automatic/manual round timers with pause, resume, restart, extend, warning, and auto-reveal behavior.
- Post-reveal vote changing option.
- Realtime emoji reactions for room participants.
- Active player presence highlighting.
- Advertising preference and ad slot infrastructure.
- Firebase mock, Playwright E2E suites, unit tests, and CI/build workflow coverage.
- Attributions for DiceBear, Gravatar, Anggara Putra / Magnific assets, custom image URL validation, and cropping libraries.

### Removed

- Legacy Poker0Matic-facing app naming from the primary user experience.
- Username-keyed vote history as the durable history format.
- Checked-in generated `dist` assets from source control.
- Legacy split theme entries that duplicated each palette as separate light/dark choices.
- Redundant top-right room/switch-view control now covered by Preferences.
- Side panel room-panel content that duplicated the room itself.
- Large revealed-state paint effects that made the revealed room feel laggy.

### Modified

- Room history now stores vote snapshots by user ID, preserving identity even when names change.
- Profile/configuration naming now treats the main user modal as Preferences rather than a narrow Profile-only model.
- Avatar changes propagate to active room participants so other users see updated avatars.
- Theme mode persistence is separate from selected theme family.
- Light-theme and external/simple dock styling now avoid incorrect opaque dock backgrounds.
- Room reveal UI supports updated insights, vote distributions, final vote controls, and simpler visual hierarchy.
- Voting shortcuts now cover deck toggling, external dock toggling, preferences, shortcut help, lobby navigation, reveal/hide, timers, room settings, card cycling, reactions, new/reset round, theme mode, and room display mode.
- Console view now logs external dock vote changes and shows revealed votes in a side panel.
- Room sidebar keeps a meaningful header/collapse control for mobile access.
- About page content now includes expanded project acknowledgements.
- Landing page and light-theme surfaces have improved contrast and theme support.
- README, CONFIG, changelog, and Ruler/testing guidance now reflect the release-2 application shape.

### Fixed

- Avatar updates only changing the user menu but not the active room participant.
- Follow-theme avatar backgrounds rendering incorrectly as white in the user menu.
- External voting dock and simple-mode dock backgrounds appearing opaque in light themes.
- Shortcut toasts blocking repeated shortcut execution.
- Browser-reserved shortcut conflicts by supporting shifted variants.
- Console view not updating when external voting dock votes changed.
- Revealed-vote steady-state performance caused by expensive paint/compositing work.
- Multiplayer E2E assertion ambiguity around the new repeated `Avg` labels in round insights.


## [1.5.0] - 2026-05-15

### Added
- public landing page with overview, setup guidance, and project attribution content
- dedicated `/app` lobby route and `/app/...` internal application route structure

### Modified
- root routing so shared entry links reach the correct internal app destinations
- landing-page messaging to better explain Firebase setup, browser local storage, and project differentiators
- app shell behavior so the public page does not show the in-app header


## [1.4.2] - 2026-05-15

### Added

- Added a Ruler-managed source structure for AI agent instructions.
- Added secret-safe Ruler apply tooling with `.ruler/.env*` support.
- Added a repository pull request template with standardized changelog guidance and target-repository rules.

### Modified

- Regenerated agent instruction outputs from `.ruler` fragments.
- Updated project scripts and ignore rules for the Ruler workflow.


## [1.4.1] - 2026-05-15

### Added
- persisted current-round participant tracking separate from live room presence
- lobby refresh recovery for the room pill when the current user still has an active vote

### Modified
- room presence now clears immediately when a user leaves back to the lobby
- lobby/header room summary now shows connected-player counts and away state separately from persisted votes
- round reset and next-round flows now rebuild participants from currently connected users

### Fixed
- votes no longer disappear on temporary refreshes or disconnects during an active round
- disconnected users are no longer carried into later rounds once they have left the room
- stale participants no longer remain visible after resetting a round


## [1.4.0] - 2026-05-12

### Added
- keyboard shortcuts for voting, room actions, panel toggling, and navigation
- an in-app shortcut reference in the About modal

### Modified
- Firebase configuration is now controlled through a shared app-level modal state so it can be opened consistently from global shortcuts


## [1.3.0] - 2026-05-12

### Added
- optional task information support for voting rounds, including creation, editing, and room-level configuration
- history round restoration for re-voting with previous task context and vote selections

### Modified
- room headers and side panel presentation to use task metadata more consistently across active rounds and history


## [1.2.0] - 2026-05-11

### Added
- optional leader mode for planning rooms with persisted room ownership and leader transfer

### Modified
- room controls and final estimate selection now respect leader-only permissions when leader mode is enabled


## [1.1.2] - 2026-05-11

### Fixed
- Prevent consensus from being reported when some participants voted `?` or `☕` and others voted a numeric card.
- Remove history-only room UI behavior when history mode is disabled, including the sidebar, round counter, and accidental committed-state styling for unanimous consensus cards.
- Keep grid-mode player ordering stable after reveal and show plain revealed vote values instead of mini cards.


## [1.1.1] - 2026-05-11

### Fixed

- Fix release publishing so merged PRs can automatically update the changelog, create the version tag, and publish the GitHub Release.

### Modified

- Move release notes ownership to the PR `## Changelog` section, which is copied into both `CHANGELOG.md` and the GitHub Release description.
- Keep release process instructions in `AGENTS.md` instead of the public README.


## [1.1.0] - 2026-05-07

Large UI and room-experience update focused on visual polish, mobile ergonomics, room configuration, and clearer voting feedback.

### Added

- **Clean application shell** — redesigned the toolbar, brand treatment, background system, and modal styling around the current Refinimo identity.
- **Logo and chip imagery** — added dedicated public image assets and a smaller favicon instead of relying on the default scaffold visuals.
- **Player avatars** — added generated avatar styles, avatar background controls, and avatar previews so players are easier to identify across the room.
- **Theme picker** — added selectable visual themes from the user menu, with the selected theme persisted locally.
- **Room side panel** — added a dedicated room information panel with settings, story metadata, and room history sections.
- **Room settings form and modal** — added reusable room configuration controls for room name, story title, description, deck selection, auto-reveal, and history options.
- **Deck picker** — added selectable estimation decks, including Fibonacci, T-shirt sizing, and custom deck entry.
- **Simple results grid** — added an alternate result view for revealed votes alongside the table view.
- **Full-screen loader** — added a reusable loading state for room transitions and configuration checks.
- **Median vote** — displayed in the table footer alongside the average, both shown only after votes are revealed.
- **Vote status icons** — while votes are hidden, the Vote column shows a green checkmark for players who have voted and a grey outline circle for those who haven't, replacing the "Voted" / "No vote" text.
- **Vote count in header** — the Vote column header shows `voted/total` on a second line so progress is visible at a glance.
- **About modal** — added a small app information modal with attribution content.

### Changed

- **Room page layout rebuilt** — moved the room experience into a denser workspace with a side panel, central table/grid area, and a redesigned voting dock.
- **Vote dock redesigned** — cards now have stronger visual hierarchy, clearer selected states, improved reveal/reset controls, and better wrapping on smaller screens.
- **Mobile room experience improved** — the side panel now behaves as an overlay on narrow screens with a backdrop, while vote controls and results adapt to available space.
- **Lobby experience improved** — refined config validation, recent-room handling, join-by-room flow, and room creation entry points.
- **Room synchronization hardened** — improved room metadata updates, participant profile persistence, and local state syncing when users join or change settings.
- **User menu expanded** — grouped profile, theme, avatar, result-view, configuration, and about actions into a single toolbar menu.
- **Current user row highlighted in bold** — your own row in the player table is rendered in bold for quick self-identification.
- **Average rounded to 2 decimal places** — trailing zeros are omitted (e.g. `3.5` not `3.50`, `3` not `3.00`).
- **Consensus feedback polished** — improved revealed-state stats, consensus indication, and result distribution styling.
- **Responsive styling refreshed** — rewrote a large portion of the SCSS for the new shell, panels, modals, forms, avatars, vote cards, and mobile breakpoints.

## [1.0.0] - 2026-05-07

First stable release.

### Added

- **`/rooms/:roomId` route** — rooms now have clean, shareable URLs instead of query parameters.
- **`/create` route** — dedicated page for creating a room with separate name and room-name fields.
- **`UserMenu` component** — avatar button in the toolbar that groups theme toggle and "Change name" into a dropdown, replacing the standalone theme-toggle icon.
- **Active room link in toolbar** — when inside a room, a "Room — {name}" breadcrumb appears in the navigation bar.
- **`activeRoomId` / `activeRoomName` state in config store** — tracks the current room so the toolbar can display it; cleared automatically when the Firebase config changes.
- **Room-not-found handling** — snackbar notification with a 3-second auto-redirect to home when a room ID resolves to nothing in the database.
- **"Reveal votes" guard** — the reveal button is disabled until at least one vote has been cast.
- **`CONFIG.md`** — step-by-step guide for setting up a Firebase project and connecting it to the app, including the recommended Realtime Database security rules.
- **`README.md`** — project-specific readme replacing the Vuetify scaffold boilerplate.

### Changed

- **Home page** (`/`) is now a lobby: a "Create a room" button and a "Join by room code" form, replacing the old all-in-one create/join/vote page.
- **Room logic moved to `room.vue`** — voting, reveal, reset, and Firebase sync extracted from `index.vue` into a dedicated page component.
- **Create room logic moved to `create.vue`** — extracted from `index.vue` into its own page.
- **Router guards refactored** — extracted into named `requireConfig` / `requireConfigIndex` functions; legacy `?roomId=` query param now redirects to `/rooms/:roomId`.
- **Config URL param cleanup** delegated to the router instead of manual `history.replaceState` in the store.
- **`saveFirebaseConfig`** now resets `_db` and clears the active room when a new config is saved.
- **Share button** in the room view is now a compact icon button (`mdi-link-variant`) in the card title instead of a full-width action button.

### Removed

- **`/attributions` route and page** — attributions content moved inline to the home page.
- **"Attributions" nav link** from the toolbar.

[Unreleased]: https://github.com/poziel/refinimo/compare/v2.1.0...HEAD
[2.1.0]: https://github.com/poziel/refinimo/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/poziel/refinimo/compare/v1.5.0...v2.0.0
[1.5.0]: https://github.com/poziel/Refinimo/compare/v1.4.2...v1.5.0
[1.4.2]: https://github.com/poziel/Refinimo/compare/v1.4.1...v1.4.2
[1.4.1]: https://github.com/poziel/Refinimo/compare/v1.4.0...v1.4.1
[1.4.0]: https://github.com/poziel/Refinimo/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/poziel/Refinimo/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/poziel/Refinimo/compare/v1.1.2...v1.2.0
[1.1.2]: https://github.com/poziel/Refinimo/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/poziel/Refinimo/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/poziel/Refinimo/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/poziel/Refinimo/releases/tag/v1.0.0
