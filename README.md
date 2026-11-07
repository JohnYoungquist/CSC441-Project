# Security Equipment & Service Tracker

CSC441 team project by John Youngquist and Matthew Johnston. Users sign in, browse equipment at assigned sites, submit service requests, and track progress and notes. The demo includes six pages: Home, About, Equipment, Submit Request, Service Requests, and Sign In.

## Run locally

1. Install Node.js 22.9+ and have access to a running MySQL server and MongoDB instance (local or Atlas). Run `npm ci` in the project folder.
2. Create a new MySQL database named `security_tracker` and an application user with access to it. Open and run `db/schema.sql` in MySQL Workbench with that database selected, or run `mysql -u YOUR_USER -p security_tracker < db/schema.sql` from Command Prompt. Use a fresh demo database.
3. Copy `.env.example` to `.env`. Set your MySQL user/password and MongoDB connection URI. For Atlas, allow your development IP and use a database user with access to the specified database. Keep `.env` local.
4. Set `DEMO_PASSWORD` in `.env` to a demo password of 12–256 characters and run `npm run seed`. The script creates or updates the two demo accounts. Both use this local demo password.
5. Run `npm start` and open `http://127.0.0.1:3000`. Open the app from Node.js so the pages can use the API. If port 3000 is in use, set `PORT` in `.env`.

| Demo account | Assigned location |
|---|---|
| north.demo | Demo North |
| south.demo | Demo South |

MySQL stores equipment, site assignments, users and requests. MongoDB stores notes keyed by the numeric MySQL request ID. The server uses the signed-in account for requester and note author. Within assigned sites, demo accounts can view requests, change status and add notes. Accounts and assignments are provisioned in MySQL; there is no public registration or email verification. Sessions expire after eight hours and reset when Node restarts. The default listener is local; for an HTTPS deployment enable secure cookies and review deployment settings separately.

## Demo and verification

1. Open Submit Request while signed out. Sign-in should be required.
2. Sign in as `north.demo`, open Equipment and confirm only North devices appear. Pick a camera, submit a request, and confirm it appears on Service Requests.
3. Search for the request, change its status, and add a note. Refresh and confirm both persist.
4. Sign out, then sign in as `south.demo`. Confirm North equipment and requests are absent. For an API check, try submitting a North equipment ID as South (expect 403) and opening or posting notes on the North request ID (expect 404).
5. Restart Node, sign in again, and confirm the request and note remain. In MongoDB, find the note in `service_notes` by numeric `requestId`.
6. Check the main navigation and narrow-screen layout. Use fictional data for the demo.

`npm test` runs HTTP tests with in-memory database stand-ins. Run the checklist above with both live databases before submitting.
