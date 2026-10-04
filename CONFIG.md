# Firebase Setup Guide

Refinimo uses **BYODB — Bring Your Own Database**. Your team connects its own Firebase Realtime Database, which stores rooms and keeps participants, votes, timers, and round history in sync. The current app supports Firebase Realtime Database specifically.

This works with the hosted app at [refinimo.com](https://refinimo.com/), a local development server, or your own deployment. You do not need to host the frontend yourself to use your own database. One person sets up the Firebase project, then shares a configuration or room link with the team.

---

## Step 1 — Create a Firebase project

1. Go to the [Firebase Console](https://console.firebase.google.com/) and sign in with a Google account.
2. Create a new project and give it a name, such as `my-team-refinimo`.
3. Follow the setup prompts. Google Analytics is optional for this database project.
4. Click **Create project**, then open the project when it is ready.

---

## Step 2 — Enable Realtime Database

1. Open **Realtime Database** in the Firebase Console and click **Create database**.
2. Choose **Locked mode** and a database location close to your team, then finish creating the database.
3. Open the database's **Rules** tab and replace the initial rules with the complete contents of [firebase.database.rules.json](firebase.database.rules.json).
4. Click **Publish** to apply Refinimo's room access and validation rules.

Copy the **Database URL** from the Realtime Database page for Step 4. Depending on the region, it looks like `https://my-team-refinimo-default-rtdb.firebaseio.com` or `https://my-team-refinimo-default-rtdb.europe-west1.firebasedatabase.app`. See Firebase's [database setup guide](https://firebase.google.com/docs/database/web/start) for the console workflow and regional URL formats.

---

## Step 3 — Register a web app

1. From the project overview, click the **`</>`** (web) icon. If the project already has an app, choose **Add app** first.
2. Enter a nickname, such as `Refinimo`, and click **Register app**. Firebase Hosting is not required.
3. Open the web app's configuration snippet. You can find it again under **Project settings → Your apps**.
4. Firebase will show you a config snippet that looks like this:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "my-team-refinimo.firebaseapp.com",
  databaseURL: "https://my-team-refinimo-default-rtdb.firebaseio.com",
  projectId: "my-team-refinimo",
  storageBucket: "my-team-refinimo.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

Keep this page open — you'll copy these values in the next step. Refinimo already includes the Firebase SDK, so you only need the configuration values from Firebase's [web app setup flow](https://firebase.google.com/docs/web/setup).

---

## Step 4 — Enter the config in Refinimo

1. Open the [Refinimo lobby](https://refinimo.com/app), or `/app` on your own deployment, and choose a display name if prompted.
2. Click **Set up configuration**. You can reopen this dialog later through **Configuration** in the user menu. A standalone form is also available at `/app/config`.
3. Fill in each field using the values from your Firebase web app:

| Field in the app | Firebase config key |
|---|---|
| `apiKey` | `apiKey` |
| `authDomain` | `authDomain` |
| `databaseUrl` | `databaseURL` |
| `projectId` | `projectId` |
| `storageBucket` | `storageBucket` |
| `messagingSenderId` | `messagingSenderId` |
| `appId` | `appId` |

4. Click **Save config**. The dialog closes and the lobby checks the connection. If you used `/app/config`, saving returns you to the lobby.
5. Once the lobby is ready, click **Create room** or enter a **Room code** to join an existing room in that database.

The configuration is saved in this browser's local storage. A different browser, device, or site address needs the configuration again; a shared link can load it for you. The lobby's connection check confirms that the database can be reached, so publish the rules in Step 2 before creating or joining rooms.

---

## Step 5 — Invite your team

Your teammates can use the same Firebase project without repeating its setup:

1. Open **Configuration** from the user menu, or visit `/app/config`.
2. Click **Share config** to copy a link for the current configuration.
3. Send it to your teammates. Opening the link saves the configuration in their browser and opens the lobby.

To invite people directly into a session, use **Share room link** inside the room. That link includes both the room ID and its Firebase configuration. A room code by itself works once the recipient is connected to the same Firebase project.

---

## Security rules

Use [firebase.database.rules.json](firebase.database.rules.json) as the source for your database rules. It contains the current validation rules for rooms, participants, decks, timers, history, reactions, and external voting dock sessions. When updating a self-hosted copy, review changes to this file and publish the matching rules in **Realtime Database → Rules**.

The rules block reads and writes at the database root and the whole `rooms` collection, while allowing unauthenticated access to individual `rooms/{roomId}` paths. Anyone who knows the database endpoint and room ID can read or write that room within the validation rules. Refinimo currently uses this shared-room model without Firebase Authentication; the rules do not enforce participant identities or leader permissions.

## Refinimo domain notes

The official app is [refinimo.com](https://refinimo.com/). It connects directly from your browser to the Firebase project you configure. The database setup is the same when using a local or self-hosted frontend; there is no shared Refinimo database to configure on the frontend host.

For a deployment at the root of your own domain, use `VITE_REFINIMO_BASE_PATH=/` and configure that domain with your static hosting provider. The project's current integration does not use Firebase Authentication, App Check, or Firebase Hosting. See the [README deployment section](README.md#deployment) for frontend hosting details.
