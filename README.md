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
├── views/
│   └── layout.js                 # Server-rendered HTML (shared layout + Summary page)
├── db/
│   ├── mysql.js                  # MySQL connection setup
│   ├── schema.sql                # MySQL table definitions
│   └── seed.js                   # Demo accounts, equipment, sample requests (MySQL) and notes (MongoDB)
├── docs/
│   ├── design.md                 # High-level design and team roles
│   ├── wireframes/               # Page sketches
│   ├── team-workflow.md          # How we collaborate with Git/GitHub
│   └── progress.md               # Module-by-module checklist
├── test/
│   ├── access.test.js            # Tests assigned-site access for requests and notes
│   └── pages.test.js             # Tests page routes and the server-rendered Summary page
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
3. Copy `.env.example` to `.env`. Set your MySQL user/password and MongoDB connection URI. For Atlas, copy the `mongodb+srv://...` string from Connect > Drivers, add your public IP under Network Access (turn off any VPN first), and use a database user with access to the specified database. Keep `.env` local and never commit credentials.
4. Set `DEMO_PASSWORD` in `.env` to a demo password of 12–256 characters and run `npm run seed`. The script creates or updates the two demo accounts (both use this password), adds 10 fictional equipment items, 3 sample service requests in MySQL, and their service notes in MongoDB. It is safe to run again. If your `users` table was created from an older `schema.sql`, the seed widens `password_hash` automatically (this fixes the "Data too long for column 'password_hash'" error).
5. Run `npm start` and open `http://127.0.0.1:3000`. Node.js 22.9+ is required (`node -v`) because the scripts use `--env-file-if-exists`. Open the app from Node.js so the pages can use the API. If port 3000 is in use, set `PORT` in `.env`.

## Pages and Routes

| URL | File | What it shows | Data |
|---|---|---|---|
| `/` | `index.html` | Home | — |
| `/about` | `about.html` | Project purpose and team | — |
| `/equipment` | `catalog.html` | Equipment cards with live search | MySQL `GET /api/equipment` |
| `/requests` | `reviews.html` | Requests with search, status filter, status updates, notes | MySQL `GET/PATCH /api/requests`, MongoDB `GET/POST /api/requests/:id/notes` |
| `/submit` | `contact.html` | Service request form with JavaScript validation | MySQL `POST /api/requests` |
| `/summary` | `views/layout.js` | Server-rendered summary tables and recent notes | MySQL + MongoDB, HTML built on the server |
| `/login` | `login.html` | Sign in / sign out | MySQL `users`, `POST /api/login`, `/api/logout` |

The `.html` file names still work, but the nav uses the clean routes defined in `server.js`.

## Requirements Coverage

| Course requirement | Where it is met |
|---|---|
| 5+ HTML pages, external CSS | Six static pages plus the server-rendered Summary page; `public/css/styles.css` (variables, flexbox, grid, media query, dark mode) |
| JavaScript form validation | `service-tracker.js` `validate()`: Submit Request and Sign In show inline errors and mark fields invalid; note form rejects blank notes |
| DOM modification | Dark mode, mobile menu, greeting, footer year, equipment cards, request cards, live search/filter, character counter, validation messages |
| Node.js server routes for page navigation | `server.js` page routes (`/`, `/about`, `/equipment`, `/requests`, `/submit`, `/login`, `/summary`) |
| Create and populate databases | `db/schema.sql` (MySQL tables) and `npm run seed` (MySQL rows and MongoDB `service_notes` documents) |
| Query and insert into SQL | `GET /api/equipment`, `GET /api/requests`, `POST /api/requests`, `PATCH /api/requests/:id`, `/summary` |
| Query the NoSQL database | `GET /api/requests/:id/notes` and `/summary` (MongoDB `find`); notes are also inserted |
| Query results formed into HTML | Browser builds cards from JSON with the DOM; `/summary` sends finished HTML from the server |

| Demo account | Assigned location |
|---|---|
| north.demo | Demo North |
| south.demo | Demo South |

MySQL stores equipment, site assignments, users and requests. MongoDB stores notes keyed by the numeric MySQL request ID. The server uses the signed-in account for requester and note author. Within assigned sites, demo accounts can view requests, change status and add notes. Accounts and assignments are provisioned in MySQL; there is no public registration or email verification. Sessions expire after eight hours and reset when Node restarts. The default listener is local; for an HTTPS deployment enable secure cookies and review deployment settings separately.

## Demo and verification

1. Open Submit Request while signed out. Sign-in should be required.
2. Try submitting Sign In and Submit Request with empty fields and confirm the inline validation messages.
3. Sign in as `north.demo`, open Equipment and confirm only North devices appear. Pick a camera, submit a request, and confirm it appears on Service Requests.
4. Search for the request, change its status, and add a note. Refresh and confirm both persist.
5. Open Summary and confirm the counts and recent notes match. Sign out, then sign in as `south.demo`. Confirm North equipment and requests are absent. For an API check, try submitting a North equipment ID as South (expect 403) and opening or posting notes on the North request ID (expect 404).
6. Restart Node, sign in again, and confirm the request and note remain. In MongoDB, find the note in `service_notes` by numeric `requestId`.
7. Check the main navigation and narrow-screen layout. Use fictional data for the demo.

`npm test` runs HTTP tests with in-memory database stand-ins. Run the checklist above with both live databases before submitting.

## Progress

| Module | Focus | Status |
|---|---|---|
| 1 | High-level design, wireframes, first HTML pages, external CSS | Done |
| 2 | More HTML/CSS, form validation, DOM modification | Done |
| 3 | Node.js + Express server, page routes, API routes | Done |
| 4 | MySQL: equipment, users, site assignments, service requests | Done; seeded and verified with a live MySQL-compatible server |
| 4 | MongoDB: service notes linked to MySQL request IDs | Done; seeded and verified with a live MongoDB server |
| 4 | Query results formed into HTML | Done (client-rendered pages + server-rendered `/summary`) |
| Final | Testing, documentation, submission | Automated tests pass; live run on both partners' machines with Atlas still to confirm |

See [docs/progress.md](docs/progress.md) for the detailed checklist.
