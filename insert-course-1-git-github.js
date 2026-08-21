require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const MIGRATION_PATH = path.join(__dirname, 'supabase', 'migrations', '20260729000009_add_quizzes_table.sql');

const SUPABASE_URL = 'https://dolfyahvhqsszjzsjgsi.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

if (!SUPABASE_KEY) {
  console.error('Missing Supabase key. Set SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

async function run() {
  try {
    // 1) Check if quizzes table is queryable (migration may be required via Supabase SQL editor if it's missing)
    let quizzesExists = true;
    try {
      const { error } = await supabase.from('quizzes').select('id').limit(1);
      if (error) {
        // If table does not exist, PostgREST responds with 422 or 404 and error.details may include "relation \"quizzes\" does not exist"
        console.warn('Warning checking quizzes table:', error.message || error.details || error);
        quizzesExists = false;
      }
    } catch (e) {
      console.warn('Error checking quizzes table:', e.message || e);
      quizzesExists = false;
    }

    if (!quizzesExists) {
      console.warn('The quizzes table does not appear to exist. Migration SQL file is at:', MIGRATION_PATH);
      console.warn('Supabase JS cannot execute arbitrary DDL. Please run the migration SQL via Supabase SQL editor or allow a direct Postgres connection. Proceeding but quiz creation will be skipped.');
    }

    // 2) Wipe target tables safely (order respects FKs)
    const tables = ['lesson_completions','enrollments','quizzes','lessons','courses'];

    for (const t of tables) {
      // Attempt delete if table exists
      try {
        const { error } = await supabase.from(t).delete().not('id','is','null');
        if (error) {
          console.warn(`Could not delete rows from ${t}:`, error.message || error.details || error);
        } else {
          console.log(`Requested delete from ${t}`);
        }
      } catch (e) {
        console.warn(`Delete failed for ${t}:`, e.message || e);
      }
    }

    // Confirm counts are zero (or report current counts)
    for (const t of tables) {
      try {
        const { data, count, error } = await supabase.from(t).select('id', { count: 'exact' });
        if (error) {
          console.warn(`Count failed for ${t}:`, error.message || error.details || error);
        } else {
          console.log(`${t} count after delete:`, count ?? (data ? data.length : 0));
        }
      } catch (e) {
        console.warn(`Count check failed for ${t}:`, e.message || e);
      }
    }

    // 3) Insert Course 1
    const courseData = {
      title: 'Git & GitHub for Beginners',
      description: 'Master version control from fundamental CLI commands to collaborative branching, pull requests, and production GitHub workflows.',
      category: 'Fundamentals',
      level: 'Beginner',
      xp_reward: 50,
      total_lessons: 2
    };

    const { data: courseInsert, error: courseError } = await supabase.from('courses').insert([courseData]).select('id').single();
    if (courseError) {
      console.error('Failed to insert course:', courseError.message || courseError.details || courseError);
      process.exit(1);
    }
    const courseId = courseInsert.id;
    console.log('Inserted course id:', courseId);

    // Build topic-structured lessons (store topics JSON inside content field as stringified JSON)

    function mkTopic(id, title, duration, content) {
      return { topic_id: id, title, duration, content };
    }

    // Lesson 1 topics (4 exhaustive pages)
    const l1_topics = [
          mkTopic('topic-1', 'Centralized vs Distributed VCS Architecture', '18 min', `# Centralized vs Distributed VCS Architecture

    A rigorous mental model is the best defense against confusion when working with version control at scale. This topic develops the contrast between centralized systems (like SVN) and distributed systems (like Git), then maps those models to day-to-day workflows and fault scenarios.

    Core differences

    - Centralized (SVN-style): one authoritative server holds history. Clients check out a working copy; commits are remote operations that update server state. This simplifies access control and single-source-of-truth framing, but creates a single point of failure and many operations (history lookup, blame, logs) require network access.

    - Distributed (Git-style): each clone contains the full history. Local operations—commits, diffs, logs, branching—are fast and offline. Collaboration happens by pushing and pulling changes between repositories.

    Internal metaphors

    - Working Directory: the editable snapshot of files on disk. Think of it as your mutable workspace.
    - Staging Area (Index): the curated list of file states that will form the next commit's tree. It lets you compose an atomic snapshot from multiple unrelated edits.
    - Local Repository & HEAD: the repository stores objects (blobs, trees, commits). HEAD is a movable pointer to the current commit on the active branch.

    Operational diagrams

    Working Directory → Staging Area (index) → Local Object Store (commits/HEAD) → Remote (push/pull)

    Example workflow and evidence

    $ git status            # shows working vs staged
    $ git add README.md     # stage file into index
    $ git commit -m "Init README"  # create commit object

    When to use which model

    - Centralized fits simple linear teams where tooling and central policies must be enforced strictly.
    - Distributed fits highly parallel teams, open-source collaboration, and scenarios that require offline work or multiple forks.

    Practical implications

    - Recovery: with Git you can recover many states locally because each clone retains full history.
    - CI/CD: distributed models require strong remote policies (protected branches, status checks) to maintain production guarantees.

    Key takeaways

    - Treat the staging area as your composition surface for atomic commits.
    - Choose pull strategies and branch protection according to team size and release cadence.`),

          mkTopic('topic-2', 'Repository Initialization & .git Internals', '20 min', `# Repository Initialization & .git Internals

    This topic dissects the .git directory created by git init and explains how commits, trees, and blobs are persisted. Understanding these internals helps with advanced debugging and recovery.

    Primary structures inside .git

    - objects/: content-addressed storage for blobs (file contents), trees (directory listings), commits (snapshots with metadata). Objects are named by their SHA (SHA-1 or SHA-256 in modern Git).\n
    - refs/: contains branch and tag refs (refs/heads/*, refs/tags/*) which are small files or packed refs pointing to commit SHAs.\n
    - HEAD: a file pointing to the current branch (e.g., refs/heads/main) or directly to a commit (detached HEAD).\n
    - index: the staging area file (binary) that records the state of staged entries (path, blob id, mode).\n
    Typical object creation sequence

    1. git add writes blobs for file contents and updates the index.
    2. git write-tree (internal) constructs a tree object from index entries.
    3. git commit creates a commit object pointing to the tree and parent commits.

    Inspecting internals

    $ git hash-object -w file.txt        # write blob and return object id
    $ git ls-files --stage               # inspect index entries
    $ git cat-file -p <sha>              # print object contents (tree/commit/blob)

    Practical recovery example

    If you accidentally remove a branch ref, you can often find commit SHAs via git reflog and restore them:

    ```
    $ git reflog
    $ git checkout -b recovered <sha>
    ```

    Security and performance notes

    - .git objects are immutable and efficient due to delta compression (packfiles).
    - Avoid committing secrets; use pre-commit hooks and scanning to prevent leaks.

    Key takeaways

    - The index is a precise representation of the next commit's tree; learning how to read the index accelerates debugging.
    - Cat-file and reflog are your forensic tools when recovering lost commits.`),

          mkTopic('topic-3', 'The Git Staging Lifecycle & Atomic Commits', '18 min', `# The Git Staging Lifecycle & Atomic Commits

    This topic treats commits as the primary unit of reasoning. An atomic commit encapsulates a single logical change set with a clear message and minimal scope.

    Why staging exists

    - Staging lets you pick hunks across files and build a single coherent commit. This is crucial for separating unrelated edits (e.g., bugfix vs formatting).

    Commands and workflows

    $ git add -p path/to/file.js    # interactively stage hunks
    $ git status --porcelain        # quick machine-friendly state
    $ git commit -m "Short: Why" -m "Long description..."  # two-paragraph commit message

    Good commit message template

    Subject line (50 chars max)

    Optional blank line

    Long description explaining the rationale, important implementation notes, and any migration steps.

    Atomic commit benefits

    - Easier reviews: small focused diffs.
    - Safer reverts: revert a single logical change rather than mixed edits.

    Example: creating two commits instead of one mixed commit

    ```
    # bad: both UI and backend changes in one commit
    git add .
    git commit -m "feat: add feature X and update styles"

    # good: separate concerns
    git add server/
    git commit -m "fix(api): validate request payload"

    git add ui/
    git commit -m "style(ui): adjust spacing for feature X"
    ```

    Key takeaways

    - Use interactive staging for granular commits.
    - Write a meaningful message: subject, blank line, body.`),

          mkTopic('topic-4', 'History Inspection & Safe Undo Operations', '18 min', `# History Inspection & Safe Undo Operations

    Inspecting history and undoing changes are essential day-to-day skills. This topic walks through common commands and recommended safe patterns.

    Viewing history

    $ git log --oneline --graph --decorate --all
    $ git show <sha>

    Recovering lost commits

    - git reflog shows HEAD movements; use it to find lost references.

    Safe undo patterns

    - Undo in working tree: git restore <file>
    - Unstage: git restore --staged <file>
    - Revert published commit: git revert <sha>  # creates a reversing commit
    - Rewrite local history: git reset --soft HEAD~1 or git rebase -i (only for local/private branches)

    Destructive operations

    - git reset --hard: resets HEAD, index, and working tree—use with caution. Consider making a temporary branch before using it.

    Example: safe revert flow

    ```
    # published commit that needs undoing
    git revert <sha>
    # push revert commit and let CI validate
    ```

    Key takeaways

    - Prefer git revert for commits that have been pushed.
    - Use the reflog and cat-file to inspect and recover when needed.`)
        ];

    // Lesson 2 topics (4 exhaustive pages)
    const l2_topics = [
      mkTopic('topic-1', 'Git Branching Mechanics & Pointer Operations', '18 min', `# Git Branching Mechanics & Pointer Operations

Branches are among the simplest but most powerful abstractions in Git: lightweight pointers to commits. This topic explains what a branch actually is, how HEAD is involved, and how to reason about branch pointers during day-to-day work.

What a branch is

A branch is simply a ref (a file in refs/heads/) that contains a commit SHA. Creating a branch means creating a tiny file that points to a commit; switching branches updates HEAD to point to that ref.

Common workflows

$ git branch feature/x                # create a pointer
$ git checkout -b feature/x           # create and switch
$ git switch feature/x                # modern equivalent

HEAD and detached HEAD

- Normal: HEAD -> refs/heads/main -> <sha>
- Detached: HEAD -> <sha> (no branch ref) — useful for inspecting old commits or testing a commit without moving branches.

Branch naming and policies

Use descriptive, ticket-linked names (e.g., feat/auth-otp, fix/login-typo). Delete branches after merge to keep the repo tidy.

Interactive example

```
# create feature branch and push
git checkout -b feat/shopping-cart
git push -u origin feat/shopping-cart
```

Key takeaways

- Branches are cheap and encouraged; create many short-lived branches for focused work.
- HEAD is the active pointer; understanding it prevents accidental commits to the wrong branch.`),

      mkTopic('topic-2', 'Merging Strategies & Conflict Resolution', '20 min', `# Merging Strategies & Conflict Resolution

Merging reconciles divergent histories. There are three common strategies: fast-forward, three-way merge, and rebase. Each has trade-offs.

Fast-forward

If the base branch has no new commits, Git simply moves the branch pointer forward — no merge commit required.\n

Three-way merge

When histories diverge, Git computes a merge commit using the two tips and their common ancestor. The result preserves the topology.

Rebase

Rebase rewrites commits by replaying them onto a new base, producing a linear history. Useful for local/private cleanup, but avoid rebasing shared history.

Conflict markers and resolution

When Git cannot automatically merge, conflict markers appear in files:

```
<<<<<<< HEAD
your changes
=======
their changes
>>>>>>> feature-branch
```

Resolution steps

1. Edit conflicted files to resolve differences.
2. git add <file> to mark resolved.
3. git commit to finish the merge.

Best practices

- Perform frequent pulls and small PRs to reduce conflicts.
- Use `git merge --no-ff` if you want to force a merge commit even for fast-forward cases to preserve feature branch history.

Key takeaways

- Prefer merge commits for shared long-running branches, rebase for local cleanup.
- When resolving conflicts, prioritize clarity and minimal changes to keep reviewable history.`),

      mkTopic('topic-3', 'Remote Repository Synchronization', '16 min', `# Remote Repository Synchronization

Remotes are named endpoints (origin, upstream) that point to other repositories. This topic explores fetch/pull/push mechanics and safe synchronization strategies.

Common commands

$ git remote add origin git@github.com:org/repo.git
$ git push -u origin main
$ git fetch origin
$ git pull --rebase origin main

Fetch vs Pull

- git fetch: downloads refs and objects but does not modify the working tree. Use it to inspect remote state.
- git pull: shorthand for fetch + merge (or rebase). Pull can introduce changes into your working tree, so inspect first when unsure.

Safe sync workflow

1. git fetch origin
2. git log --oneline origin/main..main   # what is only local
3. git log --oneline main..origin/main   # what is remote
4. git merge or git rebase depending on workflow

Handling upstream changes

Use rebase for local feature branches to keep a linear history:
```
git fetch origin
git rebase origin/main
```

Key takeaways

- Prefer fetch + inspect before merging to avoid surprises.
- Use rebase for small local branches; use merge for shared branches.`),

      mkTopic('topic-4', 'Professional Pull Requests & Code Reviews', '18 min', `# Professional Pull Requests & Code Reviews

Pull requests are the primary collaboration surface. This topic outlines how to prepare a reviewable PR, common checklist items, and branch protection rules to safeguard production.

PR anatomy

- Title: concise, follows conventional commits (optional).
- Description: why the change exists, testing steps, screenshots or sample commands.
- Small diffs: prefer multiple small PRs over one massive change.

Checklist for reviewers

- Does the code match requirements?
- Are edge cases tested?
- Is the commit history meaningful or should it be squashed?

Branch protection

- Require reviews before merge
- Require passing CI checks
- Restrict who can push to critical branches

Merging strategies on platforms

- Merge commit: preserves branch history and shows merge points.
- Squash merge: collapses commits into a single commit — useful for noisy histories.
- Rebase and merge: replays and applies commits onto the base branch.

Etiquette and feedback

Provide actionable comments, cite examples, and focus on the code’s impact on the system rather than the author. Use automated tools (linters, security scanners) to reduce manual burden.

Key takeaways

- Small, well-documented PRs speed reviews and reduce regressions.
- Enforce CI and branch protection to maintain production quality.`)
    ];

    const lessonsToInsert = [
      { course_id: courseId, title: 'Version Control Fundamentals & Core Git CLI', content: JSON.stringify({ topics: l1_topics }), duration_mins: 45, lesson_order: 1 },
      { course_id: courseId, title: 'Branching Strategy, Remote Repositories, & GitHub Workflows', content: JSON.stringify({ topics: l2_topics }), duration_mins: 40, lesson_order: 2 }
    ];

    const { data: lessonsInserted, error: lessonsError } = await supabase.from('lessons').insert(lessonsToInsert).select('id');
    if (lessonsError) {
      console.error('Failed to insert lessons:', lessonsError.message || lessonsError.details || lessonsError);
      process.exit(1);
    }
    const lessonIds = (lessonsInserted || []).map(r => r.id);
    console.log('Inserted lessons ids:', lessonIds);

    // 4) Insert Quiz attached to lesson 1 (if quizzes table exists)
    const questionsPayload = {
      meta: { pass_score: 80, scoring: 'percent', total_questions: 5, pass_required: 4 },
      items: [
        { id: 'q1', question: 'Which command moves files to the staging area?', options: ['git commit','git add','git push','git status'], answer_index: 1 },
        { id: 'q2', question: 'What is the difference between git fetch and git pull?', options: ['Fetch downloads only; Pull downloads and merges','Pull downloads only; Fetch downloads and merges','They are the same','Fetch deletes remote branches'], answer_index: 0 },
        { id: 'q3', question: 'Which command creates and switches to a new branch?', options: ['git branch new-branch','git checkout -b new-branch','git merge new-branch','git push origin new-branch'], answer_index: 1 },
        { id: 'q4', question: 'What does git reset --hard do?', options: ['Discard last commit and uncommitted working changes','Create a new commit that reverts the last commit','Only unstage files','Show commit history'], answer_index: 0 },
        { id: 'q5', question: 'Which hidden directory contains Git metadata?', options: ['.git','.github','.gitignore','.gitattributes'], answer_index: 0 }
      ]
    };

    let quizId = null;
    if (quizzesExists) {
      const quizRow = { lesson_id: lessonIds[0], title: 'Git & GitHub — Quick Assessment', questions: questionsPayload };
      const { data: quizInserted, error: quizError } = await supabase.from('quizzes').insert([quizRow]).select('id').single();
      if (quizError) {
        console.error('Failed to insert quiz:', quizError.message || quizError.details || quizError);
      } else {
        quizId = quizInserted.id;
        console.log('Inserted quiz id:', quizId);
      }
    }

    // Final verification counts
    for (const t of tables) {
      try {
        const { data, count, error } = await supabase.from(t).select('id', { count: 'exact' });
        if (error) console.warn(`Count for ${t} failed:`, error.message || error.details || error);
        else console.log(`FINAL ${t} count:`, count ?? (data ? data.length : 0));
      } catch (e) {
        console.warn(`Count check failed for ${t}:`, e.message || e);
      }
    }

    console.log('\n=== SUMMARY ===');
    console.log('Course inserted:', courseId);
    console.log('Lessons inserted:', lessonIds.length);
    if (quizId) console.log('Quiz inserted:', quizId);
    console.log('\nLogic rules: quiz JSON includes meta.pass_score=80 and pass_required=4 (4/5 -> 80%).');
    console.log('On pass actions: mark enrollment status completed, add XP to profile.xp, and enable certificate download button are application-layer responsibilities. The quiz metadata was added to support this.');

  } catch (err) {
    console.error('Error during Supabase seed:', err.stack || err);
    process.exitCode = 1;
  }
}

run().catch(err => { console.error(err); process.exit(1); });
