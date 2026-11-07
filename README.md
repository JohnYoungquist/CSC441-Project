# CSC441 Project

Course-long team website for CSC441 (web programming fundamentals).

**Requirements:** 5+ pages built with HTML, CSS, JavaScript, a Node.js web server, a MySQL database, and a MongoDB database.

**Project:** Security Equipment & Service Tracker. Users sign in, browse equipment at assigned sites, submit service requests, and track status and notes.

## Team

Two-person team. Each developer owns pages front to back plus one database, so the work splits evenly. See [docs/design.md](docs/design.md#6-roles-2-person-team).

| Developer | GitHub | Pages | Shared code | Database / Server |
|---|---|---|---|---|
| Developer 1: John Youngquist | @JohnYoungquist | Home, About, Catalog (Equipment) | `styles.css` (layout, theme, responsive) | Express server setup, MySQL (`/api/items`) |
| Developer 2: Matthew Johnston | @johnstm00 | Service Requests, Submit Request, Sign In | `main.js` (form validation, DOM features) | MongoDB (service notes via `/api/requests/:id/notes`) |

## Project Structure

```
CSC441-Project/
├── public/                       # Front end served by Express
│   ├── index.html                # Home
│   ├── about.html                # About / team
│   ├── catalog.html              # Equipment listing backed by MySQL
│   ├── contact.html              # Submit a service request
│   ├── reviews.html              # View requests, update status, and add notes
│   ├── login.html                # Sign in
│   ├── css/
│   │   └── styles.css            # Shared stylesheet
│   ├── js/
│   │   ├── main.js               # Shared page behavior
│   │   └── service-tracker.js    # Request forms and API calls
│   └── images/                   # Image asset folder
├── db/
│   ├── mysql.js                  # MySQL connection setup
│   ├── schema.sql                # MySQL table definitions
│   └── seed.js                   # Demo account and data setup
├── docs/
│   ├── design.md                 # High-level design and team roles
│   ├── wireframes/               # Page sketches
│   ├── team-workflow.md          # How we collaborate with Git/GitHub
│   └── progress.md               # Module-by-module checklist
├── test/
│   └── access.test.js            # Tests assigned-site access for requests and notes
├── .env.example                  # Local configuration template
├── .gitignore                    # Files Git should ignore
├── package.json                  # Node.js dependencies and scripts
├── package-lock.json             # Locked dependency versions
├── server.js                     # Express server and API routes
└── README.md
```

## Run It (current stage)

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

## Progress

| Module | Focus | Status |
|---|---|---|
| 1 | High-level design, wireframes, first HTML pages, external CSS | Done (starter) |
| 2 | More HTML/CSS, form validation, DOM modification | Done (starter); service request and sign-in pages added |
| Next | Node.js + Express server and API | Implemented on the backend branch |
| Later | MySQL: equipment, users, site assignments, and service requests | Implemented; live verification pending |
| Later | MongoDB: service notes linked to MySQL request IDs | Implemented; live verification pending |
| Final | Testing, documentation, presentation | Setup and demo steps documented; automated site access test passed. Live demo, browser checks, and presentation pending. |

See [docs/progress.md](docs/progress.md) for the detailed checklist.
