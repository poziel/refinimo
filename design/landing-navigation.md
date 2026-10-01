# Landing navigation and controls

The public pages are Overview (`/`), Features (`/features`), Your database
(`/your-database`), and About (`/about`). Labels, paths, and page metadata live in
`src/utils/landingNavigation.ts`; the header, footer, and router use that source.
These pages remain public, without the app's username or Firebase setup guards.

The desktop header uses equal outer grid columns to center navigation independently
of the brand and actions. At narrower widths the navigation occupies its own row.

Use `APP_ENTRY_ICON` for links that enter `/app`. The doorway/enter icon describes
entering the application; `mdi-open-in-new` remains reserved for external links.

Use the global `--icon-text-gap` token (8px) for adjacent icons and labels.
Native controls and Vuetify buttons share it. Vuetify prepend/append margins are
reset so they do not double that spacing. Gaps between separate controls and
edge-aligned disclosure indicators are layout spacing, rather than icon spacing.

The database guide uses three illustrated steps with optional detail disclosures.
The rules, copy action, and Open configuration action stay together. Illustrations
are examples, not live Firebase project status. Setup references checked against:

- [Firebase web setup](https://firebase.google.com/docs/web/setup)
- [Realtime Database setup](https://firebase.google.com/docs/database/web/start)
- [Firebase config retrieval](https://support.google.com/firebase/answer/7015592)
- [Realtime Database rules](https://firebase.google.com/docs/database/security/get-started)
