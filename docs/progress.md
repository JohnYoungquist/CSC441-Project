# Progress Checklist

## Module 1 – Design and first pages
- [x] High-level design (`docs/design.md`)
- [x] Wireframes (`docs/wireframes/`)
- [x] HTML pages started
- [x] External CSS file started
- [x] Team roles set (2-person split in `docs/design.md`)
- [x] Team finalizes topic and site name (Security Equipment & Service Tracker)
- [x] Replace placeholder text with real content

## Module 2 – HTML/CSS, form validation, DOM
- [x] 5+ HTML pages with semantic tags (header, nav, main, section, footer)
- [x] Shared CSS: variables, flexbox, grid, hover effects, media query, dark mode
- [x] Submit Request form with JavaScript validation (required equipment and priority, 10–500 character issue)
- [x] Sign In form with JavaScript validation (username format, required password)
- [x] DOM changes: dark mode, mobile menu, greeting, equipment cards, request cards, live search/filter, character counter, inline validation messages
- [x] Dev 1 customizes Home, About, Equipment + `styles.css`
- [x] Dev 2 customizes Service Requests, Submit Request, Sign In + `service-tracker.js`

## Module 3 – Node.js server and routes
- [x] `npm init`, install Express
- [x] `server.js` serves the `public/` folder
- [x] Page navigation routes (`/`, `/about`, `/equipment`, `/requests`, `/submit`, `/login`, `/summary`)
- [x] API routes for equipment, requests, status, notes, sign-in

## Module 4 – Databases
- [x] MySQL: create tables (`db/schema.sql`), connect with `mysql2`, populate with `npm run seed`
- [x] MySQL queries and inserts: equipment list, request list, new requests, status updates
- [x] MongoDB: connect, populate `service_notes`, query and insert notes by request ID
- [x] Query results formed into HTML (browser DOM rendering + server-rendered `/summary`)
- [x] Fix `password_hash` column length so demo accounts seed correctly

## Final
- [x] Automated tests (`npm test`): site access, page routes, server-rendered summary
- [x] Update README with setup steps, routes, and requirements coverage
- [ ] Both partners run the demo checklist against the shared Atlas database
- [ ] Submit project and complete peer evaluation
