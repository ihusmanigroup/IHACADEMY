# MODULE: Module 4 — Real-World Workflows & Capstone
# DURATION: 45

## TOPIC: Topic 4.1 [Unlocked]: The Professional Git Workflow

## Introduction & Core Concepts

The "branch → PR → review → merge" loop is how real teams (open source and corporate) ship every day. This topic assembles the complete professional workflow, end to end.

### The Complete Daily Loop

```bash
# 1. Start from a fresh main
git switch main
git pull

# 2. Create a feature branch
git switch -c feature/quiz-scoring

# 3. Make small commits as you work
git add src/quiz.js
git commit -m "fix: correct quiz score rounding"
git add tests/quiz.test.js
git commit -m "test: cover score rounding"

# 4. Push the branch and open a PR
git push -u origin feature/quiz-scoring
#   → open the Pull Request on GitHub

# 5. After review approval → merge on GitHub
# 6. Sync your local main
git switch main
git pull
```

### The PR Description Template

```
## What
Short summary of the change.

## Why
The problem or feature this addresses.

## How tested
- [x] Unit tests pass
- [x] Manual test on staging

Closes #42
```

**Explanation:** Every step of the loop serves a purpose: fresh main avoids conflicts, named branches keep work isolated, small commits tell the story, the PR invites review before anything reaches the official line, and `Closes #42` auto-links the issue so it closes when merged.

**Real-world analogy:** The workflow is the assembly line of a modern factory: each part is built on its own station (branch), inspected at quality gates (CI checks + review), and only approved parts reach the main assembly line (main). The line never stops, and no unapproved part ever reaches the finished product.

### Real-World Use Cases & Rules

- Pull before branching; branch per task; commit small
- PRs include: what, why, how tested
- Merge only when CI is green and review approves
- Pull main right after merging — stay current

### Key Takeaways

- The loop: fresh main → branch → commits → push → PR → merge → pull
- PR descriptions: what, why, how tested
- CI + review gate every merge
- This workflow is universal — learn it once, use it everywhere

## TOPIC: Topic 4.2 [Locked — Requires 4.1 Completion]: Git Stash & Advanced Techniques

## Introduction & Core Concepts

Real work is interrupted constantly: a hotfix lands while your feature is half-built. **git stash** shelves your uncommitted work temporarily so you can switch context — then bring it back.

### The Stash

```bash
git stash                 # save uncommitted changes, working tree clean
git stash list            # show saved stashes
git stash apply           # restore the latest stash (keep it saved)
git stash pop             # restore and remove it from the list
git stash drop stash@{0}  # discard a stash
```

```
Half-finished feature (modified files)
        │ git stash
        ▼
Clean working tree → switch branches freely → fix the hotfix
        │ git stash pop
        ▼
Feature work restored exactly where you left it
```

**Explanation:** `git stash` is a quick shelf: modified and staged changes are set aside, the working tree becomes clean, and you can switch branches. `pop` puts everything back. Stashes are identified as `stash@{0}`, `stash@{1}`... in order.

### More Advanced Techniques

| Technique | Command | Use Case |
|---|---|---|
| Stash with message | `git stash push -m "wip cart"` | Remember what's stashed |
| Stash untracked files | `git stash -u` | Include new files |
| Cherry-pick | `git cherry-pick <hash>` | Copy ONE commit to another branch |
| Interactive rebase | `git rebase -i HEAD~3` | Squash/reorder local commits |
| Bisect | `git bisect` | Binary-search the commit that broke something |
| Tags | `git tag v1.0.0` | Mark release points in history |

**Real-world analogy:** The stash is the "in progress" tray on a busy desk: when the boss needs a different project NOW, you sweep the papers into the tray (stash), handle the interruption, then lift the tray back onto the desk (pop) and continue exactly where you stopped.

### Real-World Use Cases & Rules

- Stash when interrupted; pop when back — never lose work
- Cherry-pick moves a single fix without merging a whole branch
- Rebase -i only on local, unpushed commits
- Tags mark releases: v1.0.0, v1.1.0, v2.0.0

### Key Takeaways

- stash shelves and restores uncommitted work
- cherry-pick = copy one commit; bisect = find the breaker
- Tags mark releases; rebase only local history
- Context switching without losing work

## TOPIC: Topic 4.3 [Locked — Requires 4.2 Completion]: Your GitHub Profile & Contribution Portfolio

## Introduction & Core Concepts

For beginners, GitHub is also a **portfolio**: employers look at repositories, contribution history, and how you collaborate. A maintained profile is a working resume.

### Building a Profile That Opens Doors

| Element | Action |
|---|---|
| Profile README | A pinned markdown repo introducing you |
| Pinned repositories | Pin your 4–6 best projects |
| Project READMEs | Every repo documented and runnable |
| Contributions | Consistent commits across weeks |
| Open source | Fix issues on others' repos (good first issue) |
| Stars & follows | Engage with projects you use |

### The Contribution Heatmap

Your GitHub profile shows a calendar of contributions. The point is not the color of the graph — it's the **consistency** it signals: someone who ships small improvements steadily, in public, every week.

```
Sample weekly pattern:
Mon ██ commit: add tests
Wed ██ commit: fix typo in README
Fri ██ commit: improve error message
```

### The Beginner Contribution Path

1. Learn to read a codebase (your own projects first)
2. Find `good first issue` labels on friendly open-source repos
3. Fork, branch, fix, PR — the exact workflow from Module 2
4. Accept review feedback gracefully — that's how you learn
5. Repeat. Your PR history becomes your public learning log

**Real-world analogy:** A GitHub profile is the public workshop with glass walls: employers walk past and see your projects (built pieces), your routine (consistent commits), and your collaboration skills (reviews, PRs, issue discussions) — all without an interview. It's proof of work, not promises.

### Real-World Use Cases & Rules

- Profile README + pinned repos = your landing page
- Consistency beats bursts: small commits every week
- Contribute to open source via good first issues
- Every PR and review is a visible reference

### Key Takeaways

- GitHub = your public developer portfolio
- Profile README, pinned projects, documented repos
- Consistent contributions signal reliability
- Open-source PRs are a learning and visibility engine

## TOPIC: Topic 4.4 [Locked — Requires 4.3 Completion]: Capstone Project & Next Steps

## Introduction & Core Concepts

The capstone puts every module into practice: build a small project, and take it through the complete professional workflow — this is the drill every team repeats daily.

### Capstone: Your First Full Workflow

```bash
# 1. Create a project (this one: a simple course-notes repo)
mkdir ih-notes
cd ih-notes
git init
git config user.name "Your Name"          # if not set globally
git config user.email "you@example.com"
```

```bash
# 2. First commit with essential files
#    (create README.md and .gitignore first)
git add .
git commit -m "feat: initial commit with README and gitignore"
```

```bash
# 3. Branch for a feature
git switch -c feature/add-notes-file

# 4. Add notes.md and commit
git add notes.md
git commit -m "feat: add study notes file"

# 5. Push and open a PR (create repo on GitHub first)
git remote add origin https://github.com/you/ih-notes.git
git push -u origin feature/add-notes-file
#   → open the Pull Request on GitHub → merge it

# 6. Sync main and delete the branch
git switch main
git pull
git branch -d feature/add-notes-file
```

**Explanation:** This sequence exercises: init and config (M1), commits and messages (M1/M3), branching (M2), remotes and push (M2), pull requests (M2), and cleanup (M2/M3). Run it twice — once following along, once solo — and the workflow becomes muscle memory.

### The Roadmap After This Course

| Skill | Where It Leads |
|---|---|
| Git & GitHub | The prerequisite for every team project |
| Next: HTML/CSS/JS | The languages you'll commit |
| React + Node + API | Full-stack projects to version and ship |
| Open source | Real-world PRs on real projects |
| CI/CD (Actions) | Automated tests and deployments |
| Portfolio | Your profile IS your job application |

### Real-World Use Cases & Rules

- Complete the capstone twice: guided, then solo
- Push early and often — the remote is your backup
- Every project: README, .gitignore, clean history
- The best next step: contribute one PR to an open-source project

### Key Takeaways

- The capstone drills the complete daily workflow
- init → commit → branch → push → PR → merge → clean up
- Git unlocks teamwork, open source, and your career
- Keep committing: history is your growth log

## QUIZ: Module 4 Quiz — Pass to Complete the Course

Q: What is the correct order of the professional workflow?
A: push → branch → commit → PR
A: Pull main → branch → commit → push → PR → merge
A: commit → pull → delete → push
A: PR → push → pull → commit
ANS: 1

Q: Why pull main before creating a new branch?
A: To delete old commits
A: To start from the latest code and avoid conflicts
A: It is optional
A: To speed up the computer
ANS: 1

Q: What should a PR description include?
A: What, why, and how tested
A: Only the branch name
A: The author's password
A: Nothing — code speaks for itself
ANS: 0

Q: What does git stash do?
A: Deletes uncommitted changes
A: Shelves uncommitted work so you can switch context
A: Uploads to GitHub
A: Creates a branch
ANS: 1

Q: Which command restores and removes a stash?
A: git stash apply
A: git stash pop
A: git stash list
A: git stash drop
ANS: 1

Q: What does git cherry-pick do?
A: Merges two branches
A: Copies a single commit to another branch
A: Deletes a commit
A: Renames a branch
ANS: 1

Q: What should be pinned on your GitHub profile?
A: Your passwords
A: Your best 4–6 repositories
A: Only private repos
A: Your email address
ANS: 1

Q: Where should a beginner start contributing to open source?
A: The core of a huge project
A: Issues labeled "good first issue"
A: By forking the most popular repo
A: By emailing maintainers
ANS: 1

Q: What does the contribution heatmap signal to employers?
A: Number of followers
A: Consistency of public work
A: Repository size
A: Account age
ANS: 1

Q: After merging a PR, what should you do locally?
A: Nothing
A: Pull main and delete the merged branch
A: Force push
A: Reset the repo
ANS: 1
