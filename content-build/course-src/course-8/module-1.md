# MODULE: Module 1 — Getting Started with Git
# DURATION: 45

## TOPIC: Topic 1.1 [Unlocked]: What is Git & Why Use It?

## Introduction & Core Concepts

**Git** is a free, open-source **version control system (VCS)** — a tool that tracks every change to your files over time. Created by Linus Torvalds in 2005 (yes, the same person who built Linux), Git is now the global standard: virtually every software team on Earth uses it.

**Explanation:** Git keeps a complete history of your project. You can see what changed, who changed it, when, and why — and you can travel back to any point in time. It also lets many developers work on the same project simultaneously without stepping on each other.

### Why Version Control Is Non-Negotiable

- **History**: every change is recorded with a message — no more "final_v2_FINAL.txt"
- **Safety**: broken change? Revert to the last good version in seconds
- **Collaboration**: many people work on the same codebase without conflicts
- **Experimentation**: try ideas on branches without touching the main code
- **Backup**: every clone is a full copy of the project

### Git vs GitHub — The Key Distinction

| Git | GitHub |
|---|---|
| The tool (runs locally on your machine) | A website hosting Git repositories |
| Tracks versions on YOUR computer | Stores copies in the cloud for sharing |
| Works fully offline | Adds: pull requests, issues, actions, code review |

**Real-world analogy:** Git is your camera roll and file cabinet: it snapshots your project at every step and keeps them all organized. GitHub is the cloud backup + photo-sharing app: it stores your snapshots online so you can share, collaborate, and never lose them even if your computer dies.

### Real-World Use Cases & Rules

- Git is local; GitHub is the popular cloud hosting service (alternatives: GitLab, Bitbucket)
- Git history is your project's memory — commit early, commit often
- Every developer job assumes Git fluency — this is the prerequisite skill

### Key Takeaways

- Git = version control system tracking every change
- History, safety, collaboration, experimentation
- Git is local; GitHub hosts and adds collaboration tools
- The standard skill for every developer

## TOPIC: Topic 1.2 [Locked — Requires 1.1 Completion]: Installing Git & Your First Commit

## Introduction & Core Concepts

Time to get hands-on: install Git, configure it once, and make your first commit.

### Installation (One Time)

```
Windows:  download from https://git-scm.com and run the installer
macOS:    brew install git
Linux:    sudo apt install git

Verify:   git --version   →  git version 2.4x.x
```

### Configure Your Identity (One Time)

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

**Explanation:** Every commit is stamped with the configured name and email. `--global` sets it for all projects on this machine. GitHub links commits to accounts through this email, so use the one registered on GitHub.

### Your First Repo & Commit

```bash
mkdir my-project
cd my-project
git init            # create an empty repository (.git folder)

# Create your first file (e.g., index.html)
# then:

git add index.html          # stage the file
git commit -m "Initial commit: add index.html"
```

### What Just Happened

```
Working directory ──add──► Staging area ──commit──► Repository (history)
     (your files)          (selected changes)        (permanent snapshots)
```

**Explanation:** `git init` creates the repository. `git add` puts changes in the **staging area** (the "to be committed" tray). `git commit` seals them into history with a message. Files you modify but don't `add` are not committed.

**Real-world analogy:** Committing is taking a photograph of your project: you arrange the scene (staging — pick exactly what's in the shot), then click (commit) to freeze the moment permanently in the album (history). Each photo has a caption (commit message) explaining what was happening.

### Real-World Use Cases & Rules

- Configure name and email once after installing
- init once per project; add then commit for every change
- Write meaningful commit messages: what changed and why
- Commit often — small commits are easy to understand and revert

### Key Takeaways

- Install + configure identity (one-time)
- git init → git add → git commit = the core flow
- Staging area lets you choose what to commit
- Small, frequent commits with clear messages

## TOPIC: Topic 1.3 [Locked — Requires 1.2 Completion]: The Three States & Core Commands

## Introduction & Core Concepts

Every file in a Git project lives in one of three states at any moment:

| State | Meaning | Where It Is |
|---|---|---|
| Modified | Changed but not yet staged | Working directory |
| Staged | Added, ready to be committed | Staging area |
| Committed | Safely stored in history | Repository (.git) |

### The Daily Command Set

```bash
git status               # what's modified/staged — check before EVERYTHING
git add <file>           # stage a file (git add . stages everything)
git commit -m "message"  # commit staged changes
git log                  # view commit history (q to exit)
git diff                 # see unstaged changes, line by line
```

### Seeing It All in Action

```bash
# 1. File is Modified
git status
#   modified:   index.html

# 2. Stage it
git add index.html

# 3. Commit it
git commit -m "Update page title"

# 4. History
git log --oneline
#   a1b2c3d Update page title
#   e4f5g6h Initial commit: add index.html
```

**Explanation:** `git status` is your compass — run it constantly. `git log --oneline` shows the history one line per commit: the shortened hash (a1b2c3d) identifies each commit forever, alongside its message.

**Real-world analogy:** The three states are like a photo workflow: the camera roll holds every taken photo (committed history), the editing tray holds photos chosen for the album (staged), and the folder where you're currently arranging (modified files). You decide what moves to the tray, and from the tray to the album.

### Real-World Use Cases & Rules

- git status before and after every action
- Stage deliberately: related changes go in one commit
- Commit messages: imperative, concise ("Fix login bug", not "fixed stuff")
- git log is your time machine — learn to read it early

### Key Takeaways

- Three states: modified → staged → committed
- status, add, commit, log, diff = the daily loop
- Read git status before acting — always
- Clear commit messages = readable history

## TOPIC: Topic 1.4 [Locked — Requires 1.3 Completion]: Undoing Changes & .gitignore

## Introduction & Core Concepts

Mistakes are normal — Git's whole point is safe recovery. And some files should never be tracked at all; that's what `.gitignore` is for.

### Undoing at Each Stage

| Situation | Command | Result |
|---|---|---|
| Modified, not staged | `git restore <file>` | Discards working-directory changes |
| Staged, want to unstage | `git restore --staged <file>` | Back to modified |
| Committed, want to fix last commit message | `git commit --amend` | Rewrites the last commit |
| Want to see what a commit changed | `git show <hash>` | Full diff of that commit |
| Want a past version | `git checkout <hash> -- <file>` | Restore file from history |

**Explanation:** `git restore` returns a file to its last committed state — careful, unstaged changes are gone for good once restored. `git commit --amend` safely edits the most recent commit (not older ones — we'll handle history rewriting safely with `revert` later).

### .gitignore: Files Git Should Never Track

```
# .gitignore — common entries
node_modules/
.env
*.log
dist/
.DS_Store
```

**Explanation:** Any file or pattern listed in `.gitignore` is invisible to Git: it won't appear in status and can't be committed by accident. Secrets (`.env`), dependencies (`node_modules/`), and build output (`dist/`) are the classic entries — never commit generated or sensitive files.

### Why .gitignore Matters

- Secrets in history are leaked forever — and history is permanent
- Huge folders (node_modules) bloat every clone
- Different machines produce different generated files — ignore them all

**Real-world analogy:** .gitignore is the "do not photograph" list on a film set: crew members (secrets, build files) are never in the shots (commits), no matter how often the camera (git add) sweeps the room. The album stays clean and safe automatically.

### Real-World Use Cases & Rules

- Match the undo command to the state (modified vs staged vs committed)
- Create .gitignore at project start — retrofitting is harder
- Never commit .env or any secrets — ever
- git revert (later module) is the safe way to undo published commits

### Key Takeaways

- restore discards working changes; --staged unstages
- amend edits the last commit safely
- .gitignore keeps secrets and generated files out of history
- Always ignore node_modules and .env from day one

## QUIZ: Module 1 Quiz — Pass to Unlock Module 2

Q: What is Git?
A: A cloud storage service
A: A version control system that tracks file changes
A: A text editor
A: A package manager
ANS: 1

Q: What is the difference between Git and GitHub?
A: They are the same thing
A: Git runs locally; GitHub hosts repositories in the cloud
A: GitHub is a programming language
A: Git only works on macOS
ANS: 1

Q: Which command creates a new Git repository?
A: git new
A: git init
A: git start
A: git create
ANS: 1

Q: What does git add do?
A: Commits the changes
A: Moves changes to the staging area
A: Deletes files
A: Shows history
ANS: 1

Q: What does git commit do?
A: Saves staged changes permanently into history
A: Uploads to GitHub
A: Checks file sizes
A: Starts a server
ANS: 0

Q: Which command shows the current state of the repository?
A: git log
A: git status
A: git diff
A: git show
ANS: 1

Q: What are the three states of a file in Git?
A: New, old, deleted
A: Modified, staged, committed
A: Open, closed, saved
A: Local, remote, cloud
ANS: 1

Q: What does git restore <file> do?
A: Deletes the file permanently
A: Discards unstaged changes, returning the file to its last commit
A: Commits the file
A: Uploads the file
ANS: 1

Q: Which file tells Git which paths to never track?
A: package.json
A: .gitignore
A: .gitconfig
A: README.md
ANS: 1

Q: Why must .env never be committed?
A: It is too large
A: Secrets in history are leaked forever
A: Git cannot read it
A: It slows down commits
ANS: 1
