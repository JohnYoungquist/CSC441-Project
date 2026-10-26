# Team Workflow

**Team size:** 2 (Developer 1: @JohnYoungquist, Developer 2: @johnstm00). Roles are listed in [design.md](design.md#6-roles-2-person-team).

## Tools
- **GitHub** – this repo + the "CSC441 Project" Projects board for tasks
- **VS Code** – editor (+ Live Server and Live Share extensions)
- **Group chat** – Discord or Teams for quick questions
- **Google Drive** – meeting notes and the final report

## Getting Started (each teammate)
1. Accept the GitHub collaborator invite.
2. Clone: `git clone https://github.com/JohnYoungquist/CSC441-Project.git`
3. Open the folder in VS Code and open `public/index.html` with Live Server.

## Daily Workflow
```bash
git checkout main
git pull                          # get latest changes
git checkout -b yourname/feature  # e.g. john/contact-form
# ...make changes...
git add .
git commit -m "Add contact form validation"
git push -u origin yourname/feature
```
Then open a **Pull Request** on GitHub and request your partner as reviewer. The partner reviews and merges it. If your partner doesn't reply within about 24 hours, merge it yourself and let them know in the chat.

## Rules
- Don't push straight to `main` - use branches and pull requests.
- Pull before you start working each time.
- Small commits with clear messages (they are evidence of your contribution).
- Only edit shared files (`styles.css`, `main.js`, header/nav) after telling the team.
- Move your task card on the Projects board: Todo -> In Progress -> Done.

## Check-ins
With two people, a short message twice a week (for example, Sunday and Wednesday) is enough. Hop on a quick call or VS Code Live Share when you're merging big changes or connecting the front end to the server.

## Weekly Check-in Template
- What I finished:
- What I'm doing next:
- What's blocking me:
