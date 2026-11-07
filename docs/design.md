# High-Level Design

## 1. Purpose
A sign-in-only tracker where staff at assigned locations browse physical security equipment (cameras, card readers, alarm panels, sensors), submit service requests, update request status, and keep a running set of service notes. All demo data is fictional.

## 2. Pages (minimum 5)

| Page | Route / File | Purpose | Data source |
|---|---|---|---|
| Home | `/` `index.html` | Landing page and how it works | — |
| About | `/about` `about.html` | Project purpose and team | — |
| Equipment | `/equipment` `catalog.html` | Equipment at the user's sites, live search | MySQL |
| Service Requests | `/requests` `reviews.html` | List, search, filter, change status, add notes | MySQL + MongoDB |
| Submit Request | `/submit` `contact.html` | Validated service request form | MySQL |
| Summary | `/summary` (server-rendered) | Request counts, equipment table, recent notes | MySQL + MongoDB |
| Sign In | `/login` `login.html` | Session sign-in and sign-out | MySQL |

## 3. Architecture

```
 Browser (HTML / CSS / JavaScript)
            │  page requests + fetch() JSON calls
            ▼
 Node.js + Express web server (server.js, views/layout.js)
     │                           │
     ▼                           ▼
  MySQL                       MongoDB
  sites, equipment, users,    service_notes
  user_sites, service_requests (keyed by numeric MySQL request ID)
```

**Why two databases?**
- **MySQL** – fixed columns and relationships: a site has equipment, a user is assigned to sites, a request belongs to one device and one user.
- **MongoDB** – free-form, append-only service notes that can grow without schema changes.

## 4. Data Model

### MySQL (`db/schema.sql`)
| Table | Key columns |
|---|---|
| `sites` | `id`, `name` |
| `equipment` | `id` (e.g. `CAM-001`), `site_id`, `name` |
| `users` | `id`, `username`, `name`, `password_hash` (scrypt `salt:hash`) |
| `user_sites` | `user_id`, `site_id` |
| `service_requests` | `id`, `equipment_id`, `user_id`, `priority`, `status`, `issue`, `created_at` |

### MongoDB (`service_notes` collection)
```json
{ "requestId": 1, "author": "North Demo User", "text": "Replacement IR board ordered.", "createdAt": "2026-11-07T20:40:37Z" }
```

## 5. Server Routes

| Method | Route | Purpose | Database |
|---|---|---|---|
| GET | `/`, `/about`, `/equipment`, `/requests`, `/submit`, `/login` | Page navigation | — |
| GET | `/summary` | Server-rendered summary page | MySQL + MongoDB |
| POST | `/api/login`, `/api/logout` | Start or end a session | MySQL |
| GET | `/api/session` | Current user | — |
| GET | `/api/equipment` | Equipment at the user's sites | MySQL |
| GET / POST | `/api/requests` | List or create service requests | MySQL |
| PATCH | `/api/requests/:id` | Change request status | MySQL |
| GET / POST | `/api/requests/:id/notes` | List or add service notes | MongoDB |

## 6. Roles (2-person team)

Each developer owns complete pages **and** one database, so both people touch HTML, CSS, JavaScript, Node.js, and a database. This keeps the split even and gives each person clear work to point to in the peer evaluation.

| Area | Developer 1: John (@JohnYoungquist) | Developer 2: Matthew Johnston (@johnstm00) |
|---|---|---|
| Pages | Home, About, Equipment, Summary | Service Requests, Submit Request, Sign In |
| Shared front end | `styles.css`: theme, layout, responsive design | `main.js`: form validation, DOM features |
| Server | Express setup, page navigation routes, server-rendered Summary | API routes, sessions, site-based access |
| Database | MySQL schema fix, seed data for MySQL and MongoDB | MySQL request queries, MongoDB Atlas, `/api/requests/:id/notes` |
| Docs | README, design doc, progress checklist | Testing checklist, setup steps |
| Shared | Code reviews of each other's pull requests, final presentation | Code reviews of each other's pull requests, final presentation |

**Rules for shared files:** Developer 1 has final say on `styles.css`, Developer 2 on `main.js`. Either person can edit either file, but post in the group chat first and use a pull request.

## 7. Style Guide
- Colors and fonts are CSS variables at the top of `public/css/styles.css`. Change them there only.
- Class names: lowercase with hyphens (`card-grid`, `main-nav`).
- Every page uses the same header, nav, and footer and links `css/styles.css` and `js/main.js`.
