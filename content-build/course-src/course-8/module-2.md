# MODULE: Module 2 — Branching & Merging
# DURATION: 45

## TOPIC: Topic 2.1 [Unlocked]: Branches: Parallel Worlds of Code

## Introduction & Core Concepts

A **branch** is an independent line of development. The default branch is `main` — the official, deployable version. Branches let you build features, fix bugs, or experiment without touching main until you're ready.

**Explanation:** Branches are pointers to commits. Creating a branch copies the pointer, so two lines of work can evolve independently from the same point — then merge back when done.

```bash
git branch feature-login     # create a branch
git switch feature-login     # switch to it  (older Git: git checkout)
```

**Expected output:** Now you're on `feature-login`. Commits made here are invisible to `main` until merged.

**Real-world analogy:** Branches are separate worktables in a workshop: the master's table (main) holds the finished pieces. Each apprentice gets their own table (branch) to build a part freely — the master table is only touched when a finished part is approved and brought over (merge).

### Why Branching Is Essential

- **Isolation**: broken experiments never touch main
- **Parallel work**: several developers, several features, one repo
- **Safety**: merge only what's tested and approved
- **Standard practice**: pull requests (GitHub) are branch reviews before merging

### Branch Commands

```bash
git branch                  # list branches (* marks current)
git branch <name>           # create branch
git switch <name>           # switch to branch
git switch -c <name>        # create AND switch in one step
git branch -d <name>        # delete a merged branch
```

### Real-World Use Cases & Rules

- main is sacred: never commit experimental code to it directly
- One branch per feature/bugfix — name it clearly: feature/cart, fix/navbar
- Create branches from main, merge back via pull requests
- switch (or checkout) to move between branches — commits follow the branch

### Key Takeaways

- Branches = parallel development lines
- main is the official line; branches isolate work
- git switch to move; branch -c to create+switch
- Feature branches are the professional workflow

## TOPIC: Topic 2.2 [Locked — Requires 2.1 Completion]: Merging & Resolving Conflicts

## Introduction & Core Concepts

**Merging** brings a branch's commits into another branch. Fast-forward merges are clean; when branches diverged, Git creates a merge commit — and sometimes, **conflicts**.

### The Merge

```bash
git switch main             # go to the receiving branch
git merge feature-login     # bring feature-login into main
```

### Three Merge Outcomes

| Outcome | When | Result |
|---|---|---|
| Fast-forward | Main hasn't moved since branching | Branch pointer moves forward — no extra commit |
| Clean merge commit | Different files changed | New "Merge branch" commit, automatic |
| Conflict | SAME lines changed differently | Git stops and asks YOU to decide |

### Resolving a Conflict Step by Step

```
1. git merge → Git reports: CONFLICT (content) in index.html
2. Open the file — Git marks the two versions:

   <<<<<<< HEAD
   <title>IH Academy</title>
   =======
   <title>IH Academy — Learn to Code</title>
   >>>>>>> feature-login

3. Decide the correct final text (keep one, both, or new)
4. Delete the markers (<<<<<<<, =======, >>>>>>>)
5. Stage and commit:

   git add index.html
   git commit -m "Resolve conflict in page title"
```

**Explanation:** `HEAD` is your current branch; the other side of the marker is the incoming branch. The resolution is whatever final content you choose — then the merge commit records it. Conflicts are normal and expected: real teams resolve them daily.

**Real-world analogy:** A conflict is two editors who both rewrote the same sentence of a manuscript. The editor-in-chief (you) reads both versions, picks the best wording (or blends them), strikes the markup, and signs off the page. It's a decision, not a failure.

### Real-World Use Cases & Rules

- Pull the latest main BEFORE starting new work — fewer conflicts
- Resolve conflicts in the file, remove ALL markers, then commit
- Never rush a conflict: read both versions, understand intent
- Small, frequent merges create fewer conflicts than big rare ones

### Key Takeaways

- merge brings branches together; fast-forward vs merge commit
- Conflicts happen when the same lines changed both sides
- Resolve: pick content, delete markers, add, commit
- Merge often, merge small — conflicts shrink

## TOPIC: Topic 2.3 [Locked — Requires 2.2 Completion]: Working with Remotes

## Introduction & Core Concepts

A **remote** is a Git repository hosted elsewhere — on GitHub, GitLab, or a company server. Remotes are how teams share work; the conventional name for the main remote is `origin`.

### Connecting a Local Repo to GitHub

```bash
# 1. Create an empty repo on GitHub (no README — we have a repo already)
# 2. Link it:
git remote add origin https://github.com/you/my-project.git

# 3. Push your branch and set it as upstream (tracking):
git push -u origin main
```

**Explanation:** `git remote add` names the GitHub URL `origin`. `git push -u origin main` uploads your commits AND records that local `main` tracks `origin/main` — so future pushes are just `git push`.

### The Remote Commands

```bash
git clone <url>        # full copy of a remote repo (first time)
git fetch              # download remote info WITHOUT merging
git pull               # fetch + merge remote changes into your branch
git push               # upload your commits to the remote
git remote -v          # list configured remotes
```

### push vs pull vs fetch

- `push`: yours → remote (upload)
- `pull`: remote → yours (download + merge)
- `fetch`: remote → yours (download only; you merge manually)

**Real-world analogy:** Remotes are the team's shared drive: clone copies the whole project folder onto your desk, push saves your edits back to the shared drive, pull grabs the newest edits from everyone else, fetch just checks the drive without copying anything onto your desk yet.

### Real-World Use Cases & Rules

- clone once, then pull regularly and push your work
- Always pull before you push — pushing without pulling causes rejections
- origin is the convention, not a requirement
- git remote -v shows where your repo lives

### Key Takeaways

- Remote = hosted copy; origin = the convention name
- clone/pull/push = get, sync, send
- fetch downloads without merging; pull fetches and merges
- Pull before push, always

## TOPIC: Topic 2.4 [Locked — Requires 2.3 Completion]: GitHub Collaboration Workflow

## Introduction & Core Concepts

GitHub's collaboration model is built on **forks, pull requests (PRs), and code review** — the same workflow used by open-source projects and companies worldwide.

### The Collaboration Flow

```
1. Fork: copy the repo to YOUR GitHub account
2. Clone your fork locally
3. Create a feature branch
4. Commit your changes
5. Push the branch to your fork
6. Open a Pull Request: fork's branch → original repo's main
7. Maintainers review, comment, request changes
8. Merge when approved
```

### Pull Requests Explained

A **pull request** is a proposal: "Here is a branch with changes — please review and merge it." PRs show:

- Exactly what changed (diff)
- Discussion and review comments per line
- CI checks (tests, lint) passing or failing
- Merge buttons with options (merge commit, squash, rebase)

### The Golden Rules of Collaboration

- **Never push to main** on a shared repo — always branch + PR
- Write a clear PR title and description: what, why, how tested
- Keep PRs small — hundreds of changed lines are painful to review
- Address review comments on the same branch; push updates to the PR
- Update your branch from main before merging (rebase or merge main in)

**Real-world analogy:** The PR workflow is a school's essay submission process: you draft in your own notebook (fork/branch), submit your essay (PR), the teacher reviews and marks suggestions (code review), you revise (push updates), and only an approved essay reaches the published anthology (merge to main). No one slips essays into the anthology unread.

### Real-World Use Cases & Rules

- Fork → clone → branch → commit → push → PR → review → merge
- PRs are the quality gate: review before merge
- Small PRs, clear descriptions, never push to main
- This exact workflow runs the world's largest projects

### Key Takeaways

- Fork copies to your account; PR proposes changes to the original
- Review, comments, and CI checks happen in the PR
- Never push to main — branch and PR
- Small PRs with clear descriptions get merged faster

## QUIZ: Module 2 Quiz — Pass to Unlock Module 3

Q: What is a branch in Git?
A: A copy of the repository on GitHub
A: An independent line of development
A: A commit message
A: A deleted file
ANS: 1

Q: Which command switches to another branch?
A: git switch <name>
A: git branch <name>
A: git log <name>
A: git remote <name>
ANS: 0

Q: Why should experimental work never go directly on main?
A: It is slower
A: Main should stay stable and deployable
A: Main cannot hold commits
A: It is only a style preference
ANS: 1

Q: When does Git report a merge conflict?
A: When the branches are identical
A: When the same lines were changed differently on both branches
A: When files were added on both branches
A: When the repo is empty
ANS: 1

Q: What does HEAD mean in a conflict marker?
A: The incoming branch
A: Your current branch's version
A: The remote repository
A: A file hash
ANS: 1

Q: What must you do after editing the content of a conflict?
A: Push immediately
A: Delete the conflict markers and commit the resolution
A: Delete the file
A: Run git reset
ANS: 1

Q: What does git push do?
A: Downloads remote changes
A: Uploads your commits to the remote
A: Creates a branch
A: Shows history
ANS: 1

Q: What does git pull do?
A: Fetches and merges remote changes into your branch
A: Uploads to GitHub
A: Clones the repo
A: Deletes the remote
ANS: 0

Q: What is the conventional name for the main remote?
A: master
A: origin
A: main
A: github
ANS: 1

Q: What is a pull request?
A: A command that pulls files
A: A proposal to review and merge a branch's changes
A: A way to delete a repo
A: A conflict resolution tool
ANS: 1
