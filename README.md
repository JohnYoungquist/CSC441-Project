# CSC441 Project

Course-long team website for CSC441 (web programming fundamentals).

**Requirements:** 5+ pages built with HTML, CSS, JavaScript, a Node.js web server, a MySQL database, and a MongoDB database.

> Site topic and name are placeholders (`Project Name`) until the team finalizes them.

## Team

| Name | Role | Pages / Features |
|---|---|---|
| John Youngquist | TBD | TBD |
| Teammate 2 | TBD | TBD |
| Teammate 3 | TBD | TBD |
| Teammate 4 | TBD | TBD |

## Project Structure

```
CSC441-Project/
├── public/              # Front end (served by Node.js later)
│   ├── index.html       # Home
│   ├── about.html       # About / team
│   ├── catalog.html     # Item listing (MySQL later)
│   ├── reviews.html     # Review form + list (MongoDB later)
│   ├── contact.html     # Contact form (MongoDB later)
│   ├── css/styles.css   # Shared stylesheet
│   ├── js/main.js       # Shared JS: DOM changes + form validation
│   └── images/
├── docs/
│   ├── design.md        # High-level design
│   ├── wireframes/      # Page sketches
│   ├── team-workflow.md # How we collaborate with Git/GitHub
│   └── progress.md      # Module-by-module checklist
└── README.md
```

## Run It (current stage)

No server yet. Open `public/index.html` in a browser, or use the VS Code **Live Server** extension.

## Progress

| Module | Focus | Status |
|---|---|---|
| 1 | High-level design, wireframes, first HTML pages, external CSS | Done (starter) |
| 2 | More HTML/CSS, form validation, DOM modification | Done (starter) |
| Next | Node.js + Express server | Not started |
| Later | MySQL (structured data) | Not started |
| Later | MongoDB (reviews/messages) | Not started |
| Final | Testing, documentation, presentation | Not started |

See [docs/progress.md](docs/progress.md) for the detailed checklist.
