# Team Workflow

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
Then open a **Pull Request** on GitHub. Another teammate reviews and merges it.

## Rules
- Don't push straight to `main` - use branches and pull requests.
- Pull before you start working each time.
- Small commits with clear messages (they are evidence of your contribution).
- Only edit shared files (`styles.css`, `main.js`, header/nav) after telling the team.
- Move your task card on the Projects board: Todo -> In Progress -> Done.

## Weekly Check-in Template
- What I finished:
- What I'm doing next:
- What's blocking me:
