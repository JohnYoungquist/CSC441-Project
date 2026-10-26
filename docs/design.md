# High-Level Design

## 1. Purpose
_TODO: One or two sentences on what the site does and who it is for._

## 2. Pages (minimum 5)

| Page | File | Purpose | Data source (later) |
|---|---|---|---|
| Home | `index.html` | Landing page, featured content | — |
| About | `about.html` | Project purpose and team | — |
| Catalog | `catalog.html` | List/search of items, products, or services | MySQL |
| Reviews | `reviews.html` | Users post and read reviews | MongoDB |
| Contact | `contact.html` | Contact form | MongoDB |
| _(optional)_ Login/Register | `login.html` | User accounts | MySQL |

## 3. Architecture

```
 Browser (HTML / CSS / JavaScript)
            │  HTTP requests (fetch)
            ▼
 Node.js + Express web server
     │                    │
     ▼                    ▼
  MySQL                MongoDB
  (structured:         (flexible:
   users, items,        reviews, contact
   orders)              messages, logs)
```

**Why two databases?**
- **MySQL** – data with fixed columns and relationships (e.g., a user has many orders).
- **MongoDB** – documents whose shape can vary (e.g., reviews with optional photos/tags).

## 4. Draft Data Model

### MySQL
```sql
CREATE TABLE users (
  user_id    INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE items (
  item_id     INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  description TEXT,
  price       DECIMAL(8,2) NOT NULL
);
```

### MongoDB
```json
// reviews collection
{ "name": "Sample User", "rating": 5, "review": "Great site", "createdAt": "2026-10-22T00:00:00Z" }

// messages collection (contact form)
{ "name": "...", "email": "...", "phone": "...", "topic": "...", "message": "...", "createdAt": "..." }
```
Form field names in the HTML already match these fields.

## 5. Planned Server Routes (later module)

| Method | Route | Purpose | Database |
|---|---|---|---|
| GET | `/api/items` | List catalog items | MySQL |
| GET | `/api/reviews` | List reviews | MongoDB |
| POST | `/api/reviews` | Save a review | MongoDB |
| POST | `/api/contact` | Save a contact message | MongoDB |

## 6. Roles (2-person team)

Each developer owns complete pages **and** one database, so both people touch HTML, CSS, JavaScript, Node.js, and a database. This keeps the split even and gives each person clear work to point to in the peer evaluation.

| Area | Developer 1: John (@JohnYoungquist) | Developer 2: Matthew Johnston (@johnstm00) |
|---|---|---|
| Pages | Home, About, Catalog | Reviews, Contact, Login _(optional 6th page)_ |
| Shared front end | `styles.css`: theme, layout, responsive design | `main.js`: form validation, DOM features |
| Server | Create `server.js`, Express setup, serve `public/` | Add MongoDB routes to `server.js` |
| Database | MySQL schema, `/api/items` | MongoDB Atlas, `/api/reviews`, `/api/contact` |
| Docs | README, design doc | Testing checklist, wireframe updates |
| Shared | Code reviews of each other's pull requests, final presentation | Code reviews of each other's pull requests, final presentation |

**Rules for shared files:** Developer 1 has final say on `styles.css`, Developer 2 on `main.js`. Either person can edit either file, but post in the group chat first and use a pull request.

## 7. Style Guide
- Colors and fonts are CSS variables at the top of `public/css/styles.css`. Change them there only.
- Class names: lowercase with hyphens (`card-grid`, `main-nav`).
- Every page uses the same header, nav, and footer and links `css/styles.css` and `js/main.js`.
