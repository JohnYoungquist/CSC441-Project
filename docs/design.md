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

## 6. Roles (split evenly)

| Role | Main responsibilities | Also owns page(s) |
|---|---|---|
| Front-end lead | HTML structure, shared header/nav/footer | TBD |
| Style lead | `styles.css`, responsive design, consistency | TBD |
| Back-end lead | Node.js/Express server, routes | TBD |
| Data lead | MySQL schema, MongoDB collections, connections | TBD |

_With 2–3 members, combine roles (e.g., Front-end + Style, Back-end + Data)._

## 7. Style Guide
- Colors and fonts are CSS variables at the top of `public/css/styles.css`. Change them there only.
- Class names: lowercase with hyphens (`card-grid`, `main-nav`).
- Every page uses the same header, nav, and footer and links `css/styles.css` and `js/main.js`.
