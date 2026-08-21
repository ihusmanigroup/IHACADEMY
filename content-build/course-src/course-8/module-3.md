# MODULE: Module 3 — GitHub Essentials & Beyond Basics
# DURATION: 45

## TOPIC: Topic 3.1 [Unlocked]: Repositories, READMEs & Issues

## Introduction & Core Concepts

A GitHub **repository (repo)** is a project container: code, history, docs, and settings in one place. Three elements make a repo professional: a README, issues, and good organization.

### README: Your Project's Front Door

The README (`README.md`) is the first thing visitors see on the repo page — rendered from Markdown. Every serious repo has one.

```
# Project Name

One-line description.

## Features
- What it does

## Getting Started
1. npm install
2. npm run dev

## Tech Stack
React, Node.js, PostgreSQL
```

| Section | Purpose |
|---|---|
| Title + description | What is this project? |
| Screenshots/demo | Show, don't tell |
| Getting started | Install + run instructions |
| Tech stack | What's under the hood |
| License | How others may use it |

### Issues: The Task Tracker

**Issues** are GitHub's built-in task tracker — bugs, features, and questions, each with a number, labels, and discussion:

- Every issue gets a number: `#42`
- Labels organize: `bug`, `enhancement`, `good first issue`, `help wanted`
- Commits can link issues: `git commit -m "Fix login crash (closes #42)"`
- Projects: issues + pull requests grouped into boards

**Real-world analogy:** The README is the shop window of your repo — what's inside, how to use it, who made it. Issues are the suggestion box and complaint log: numbered slips anyone can file, tag, and track to resolution.

### Real-World Use Cases & Rules

- Write the README before sharing the repo — it IS the first impression
- Use issues for every task; reference numbers in commits
- Labels turn a pile of issues into a manageable queue
- Good first issue labels welcome new contributors

### Key Takeaways

- Repo = project container; README = its front door
- Issues = numbered, labeled task tracker
- Commit messages link to issues with #number
- Professional repos are documented and organized

## TOPIC: Topic 3.2 [Locked — Requires 3.1 Completion]: GitHub Actions: Automating Workflows

## Introduction & Core Concepts

**GitHub Actions** automates tasks triggered by repo events — the standard way to run tests and builds on every push, without running anything locally.

### The Workflow File

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test
```

**Explanation:** This file — committed to `.github/workflows/` — tells GitHub: "when code is pushed to main or a PR is opened, run the test job on a fresh Ubuntu machine." Each `run` line is a shell command; `uses` lines pull in ready-made actions. Green checkmarks in PRs = "tests pass."

### What Teams Automate

| Workflow | Trigger |
|---|---|
| Tests | Every push / PR |
| Linting | Every push / PR |
| Build | Every push to main |
| Deploy | Push to main / tag release |
| Security scan | Scheduled |
| Docs generation | On release |

### The Value

- **Checks on every PR** — broken code never reaches main unnoticed
- **Consistency** — identical environment every run (no "works on my machine")
- **Deploy automation** — push to main → tests pass → deploys to production
- **Free for public repos** — unlimited minutes on open source

**Real-world analogy:** GitHub Actions is the quality-control line in a factory: every product (commit) automatically rolls past inspectors (tests), and only products that pass all checks reach the shipping dock (merge to main / deploy). The QC line never sleeps and never skips a unit.

### Real-World Use Cases & Rules

- Workflows live in .github/workflows/*.yml
- Triggers: push, pull_request, schedule, manual dispatch
- Standard starter: checkout → setup-node → install → test
- Red X = fix before merge; that's the point

### Key Takeaways

- Actions = automated workflows on repo events
- One YAML file runs tests/builds on every push/PR
- Checks gate merges; deploys can be automated
- Public repos get free minutes

## TOPIC: Topic 3.3 [Locked — Requires 3.2 Completion]: Git Best Practices

## Introduction & Core Concepts

Great teams don't just use Git — they follow habits that keep history readable and teams unblocked.

### The Commit Habit Checklist

| Habit | Why |
|---|---|
| Commit small and often | Small commits are easy to review, bisect, revert |
| One logical change per commit | History tells one story per snapshot |
| Write imperative messages | "Fix login crash" — reads like a command |
| Follow a message convention | Conventional Commits: `feat:`, `fix:`, `docs:` |
| Never commit generated files | node_modules, dist — keep .gitignore complete |
| Never commit secrets | Ever. History is permanent |
| Review your own diff | git diff before committing catches half the bugs |

### Conventional Commit Messages

```
feat: add course search
fix: resolve quiz scoring bug
docs: update setup instructions
refactor: simplify lesson parser
test: add branch merge tests
chore: bump dependencies
```

**Explanation:** A type prefix + concise description. This format is the de-facto standard: readable history, automatic changelogs, and semantic versioning tools all consume it.

### The Workflow That Prevents Pain

```
1. Pull latest main           → sync
2. Create a feature branch    → isolate
3. Small commits with messages → communicate
4. Push the branch            → backup
5. Open a PR                  → review
6. Merge when green           → ship
```

**Real-world analogy:** Good Git habits are a pilot's checklist: every item is small and individually trivial, but the combination makes every flight (merge) safe and predictable. Skipping items is possible — until the day it isn't.

### Real-World Use Cases & Rules

- Small commits + clear messages = readable history
- Conventional Commits prefix types
- Pull first, branch, commit, push, PR
- Review your own diff before committing

### Key Takeaways

- Commit small, one logical change, imperative messages
- Conventional Commits: feat:, fix:, docs:...
- Never commit secrets or generated files
- The pull→branch→commit→push→PR loop is the daily rhythm

## TOPIC: Topic 3.4 [Locked — Requires 3.3 Completion]: Undoing & Recovering Safely

## Introduction & Core Concepts

History is permanent, but mistakes are recoverable — Git is designed for safe undo. The key: match the command to the situation, and never rewrite **published** history recklessly.

### The Safe Undo Toolkit

| Situation | Command | Result |
|---|---|---|
| Unstaged changes | `git restore <file>` | Discard working changes |
| Staged by accident | `git restore --staged <file>` | Unstage, keep changes |
| Fix last commit | `git commit --amend` | Edit message / add missing file |
| Undo a PUBLISHED commit | `git revert <hash>` | New commit that reverses it — history preserved |
| Move the branch back locally | `git reset --hard <hash>` | Discard commits after hash (local only!) |
| Recover a deleted branch | `git reflog` | Find the hash, branch again from it |

### revert vs reset — The Critical Difference

```
git revert:  history stays — a NEW commit undoes the bad one
             safe for pushed/shared branches ✓

git reset:   history is REWRITTEN — commits disappear
             only safe on local, unpublished work ✗ on shared branches
```

### The reflog: Git's Recovery Net

```bash
git reflog
# a1b2c3d HEAD@{0}: commit: fix login crash
# e4f5g6h HEAD@{1}: checkout: moving from feature-x to main
```

**Explanation:** The reflog records EVERY move of HEAD — even "deleted" commits. If you reset too far or delete a branch, the reflog reveals the hash, and `git branch <name> <hash>` brings the work back. It's the safety net under every other command.

**Real-world analogy:** revert is crossing out a line in the meeting notes with a dated correction — the record shows both. reset is erasing the whiteboard — fine for drafts (local), catastrophic for the shared flipchart (remote). The reflog is the security camera footage: whatever happened, the footage (hash) exists to replay.

### Real-World Use Cases & Rules

- Published work: revert (never rewrite)
- Local work: amend/reset freely
- When lost: check reflog before panicking
- Amending a pushed commit causes divergence — pull/force-push carefully

### Key Takeaways

- revert for shared history; amend/reset for local
- reflog recovers almost anything
- Match the tool to the state of the work
- Never rewrite published history without a plan

## QUIZ: Module 3 Quiz — Pass to Unlock Module 4

Q: What is a GitHub repository?
A: A folder on your desktop
A: A project container with code, history, and docs
A: A chat room
A: A database table
ANS: 1

Q: What is the README for?
A: Storing logs
A: The first documentation visitors see — description and usage
A: Hiding secrets
A: Commit history
ANS: 1

Q: What are GitHub issues used for?
A: Reporting browser bugs
A: Tracking tasks, bugs, and feature requests with labels
A: Storing files
A: Running tests
ANS: 1

Q: What triggers a GitHub Actions workflow?
A: Manual only
A: Events like push or pull_request
A: The full moon
A: Actions cannot be triggered
ANS: 1

Q: Where do workflow files live?
A: src/actions/
A: .github/workflows/*.yml
A: config/
A: bin/
ANS: 1

Q: Which of these is a Conventional Commit prefix?
A: error: 
A: fix: 
A: stop: 
A: debug: 
ANS: 1

Q: Why commit small and often?
A: It is faster
A: Small commits are easier to review and revert
A: Git requires it
A: It fills the history
ANS: 1

Q: What does git revert do?
A: Deletes the commit
A: Creates a new commit that reverses the target commit
A: Rewrites all history
A: Restores deleted files
ANS: 1

Q: When is git reset safe to use?
A: On published shared branches
A: On local, unpublished work
A: Never
A: Only on GitHub
ANS: 1

Q: What is the reflog?
A: A log of every HEAD movement, useful for recovery
A: A list of files
A: A remote log
A: A configuration file
ANS: 0
