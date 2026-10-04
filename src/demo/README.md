# Local room demo

`/demo` mounts the real `pages/room.vue` inside `DemoSession`. The only injected
differences are the room data source, generic visitor identity, and local popup
connection. Voting, settings, task entry, timers, history, views, and reactions
remain in the application components. Shared deck and vote helpers live in
`utils/roomVoting.ts` and are used by the room, voting dock, and simulated players.

`data/roomDatabase.ts` delegates connected rooms to Firebase. The demo uses
`MemoryRoomDatabase`, never the E2E Firebase mock. Demo data is held in memory;
restarting, reloading, or leaving discards it. Existing Firebase configuration,
recent rooms, and connected-room dock state are not used for the demo. Personal
preferences still use the normal preferences UI.

Every launch samples 1–8 simulated teammates, in addition to the visitor, without
replacement from the 100 character records in `demoPlayers.ts`. Each character
has a fixed name, color, and DiceBear style; their name seeds the existing avatar
URL generator. Teams with multiple characters always include different styles.
The visitor's name is excluded from the selection.

The visitor is always named `Demo`, independently of their saved profile name.
Every seat has an equal chance when a session starts, and that position stays
the same through voting, resets, and subsequent rounds. A new team draws a new
position. The assigned join order is preserved in both presence and round data.

Group sizes are weighted: 1 (5%), 2 (7%), 3 (3%), 4 (30%), 5 (30%), 6 (15%),
7 (7%), and 8 (3%). Four or five teammates are most common; three and eight are
the rarest. Teammates use delayed votes and react to the current deck, round,
reveal state, and task lock. Delegated leadership returns to the visitor after
two seconds so the demo remains usable.

The popup renders the real `pages/dock.vue`. Its BroadcastChannel forwards
writes to the host tab, which owns all state and transactions. Channels are
unique per demo; cleanup closes the popup and cancels simulated votes. Phone
voting requires a connected room and is explained in the UI. Sharing a demo
link starts an independent session for its recipient.

Coverage: `tests/unit/demoRoom.spec.ts` and `tests/e2e/demo.feature.spec.ts`.
