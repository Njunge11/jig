# Kickstart a dependent checklist during a PR review

Status: process notes, not a skill yet. Review before you convert it.

## Problem

A tracker checklist is ready to build, but it builds on a PR that is still in review. The developer wants to start the new checklist now, without merge conflicts and without dirtying the review checkout.

## When this process applies

Use it when all of these are true:

- The new checklist's "Builds on" line names the checklist whose PR is in review.
- The new checklist edits files that the in-review PR created or changed.
- The developer wants to review and build at the same time.

If the new checklist is independent of the in-review PR, skip this process. Give it a plain worktree instead:

```bash
git worktree add --detach ../<repo>-<checklist-id> origin/main
```

`--detach` checks out `origin/main` without a branch, so the builder creates the checklist's branch itself when the `/goal` runs — the same way it does in a normal checkout. Steps 3 and 4 (install, env links) still apply; the stacked steps do not.

## The process

The pattern is a stacked branch in a separate worktree. The review checkout stays untouched. The new work sits on top of the PR's commits.

### 1. Read the dependency

Open the new checklist. Confirm the "Builds on" line and the branch name. The checklist's `Branch:` line gives the branch name for step 2.

### 2. Create the worktree with a stacked branch

From the review checkout:

```bash
git worktree add ../<repo>-<checklist-id> -b <checklist-branch> <pr-branch>
```

Example from the 10a run:

```bash
git worktree add ../ajiri-10a -b feat/mcp-registration-policy feat/mcp-oauth-authorize-token
```

The new branch starts at the tip of the PR branch, not at `main`.

Known caveat: a husky `post-checkout` hook can fail with code 128 on a fresh worktree. Git passes a null previous HEAD, so the hook's `git diff` fails. The worktree is still correct. Verify with `git worktree list`.

### 3. Install dependencies in the worktree

A worktree is a separate directory. It has no `node_modules`.

```bash
cd ../<repo>-<checklist-id> && pnpm install --prefer-offline
```

### 4. Link the ignored env files into the worktree

`git worktree add` copies tracked files only. Every gitignored file stays behind in the review checkout, and `.env` is gitignored. The worktree therefore has no database URL, and the first command that needs one fails:

```
$ pnpm db:migrate
 Error  Please provide required params for Postgres driver:
    [x] url: undefined
```

The error names the driver, not the missing file, so it reads as a config fault instead of a worktree fault.

Symlink each env file the app reads, from the review checkout into the worktree:

```bash
ln -s <review-checkout>/apps/<app>/.env <worktree>/apps/<app>/.env
```

Example from the 10a run. `apps/mcp` reads the dashboard's env through its `with-env` script:

```bash
mkdir -p ../ajiri-10a/apps/dashboard
ln -s ~/Personal/ajiri-monorepo/apps/dashboard/.env ../ajiri-10a/apps/dashboard/.env
```

A symlink stays in step with the review checkout, and `.gitignore` keeps it out of commits. Copy the file instead when the two should drift apart.

Find the files to link by reading the app's `with-env` script and its `.env.example`, not by guessing. A monorepo app can read another app's env file: `apps/mcp` points `dotenv -e` at `../../apps/dashboard/.env`.

Do this before the build session starts. A builder that hits `url: undefined` mid-run has no way to fix it, because the file it needs is outside its checkout.

### 5. Start the build in a second session

Open a second Claude Code session in the worktree directory. Run the tracker's `/goal` command for the new checklist. The checklist tells the builder to create its branch; the branch already exists, so the builder continues on it.

The review session and the build session never share a checkout. The tracker file is the one file both efforts can edit. The build flips only its own Status row, so a conflict there is unlikely and trivial.

### 6. Absorb review fixes

Review fixes land on the PR branch. The stacked branch does not track them. After each push to the PR branch, rebase inside the worktree:

```bash
git rebase <pr-branch>
```

This surfaces overlap early, in small files, instead of at merge time.

### 7. Re-parent after the PR merges

If GitHub squash-merges the PR, the PR's commits are not on `main`. A plain rebase replays them and conflicts. Use `--onto` to move only the new checklist's commits:

```bash
git fetch origin
git rebase --onto origin/main <pr-branch> <checklist-branch>
```

After this step the branch matches the tracker rule "every checklist branches off main".

### 8. Open the PR at the right time

Open the new checklist's PR only after the base PR merges and step 7 is done. If you must open it earlier, set its base to the PR branch, then retarget it to `main` after the merge. Otherwise the PR shows both diffs.

### 9. Clean up

After the new PR merges:

```bash
git worktree remove ../<repo>-<checklist-id>
```

## Leave the worktree before the PR merges

The build can finish long before the base PR merges. The developer then wants the branch back in the review checkout, where the env files and the muscle memory already are.

Push first. `git worktree remove` deletes the directory, so anything uncommitted or unpushed is gone. Confirm both:

```bash
git status --short --branch
```

The output must name the remote branch with no `ahead`/`behind` marker, and list no files.

Pick by how long you need the files.

**One command, then back** — for example, applying a migration in the review checkout. Detach; do not remove the worktree:

```bash
cd <review-checkout>
git checkout --detach <checklist-branch>
# run the command
git checkout <pr-branch>
```

Git refuses a normal checkout of a branch that a worktree already holds. `--detach` is allowed, changes nothing, and leaves the worktree intact.

**Carry on working there** — remove the worktree, then check the branch out normally:

```bash
cd <review-checkout>
git worktree remove <worktree-path>
git checkout <checklist-branch>
pnpm install
```

Three caveats:

- Run these from a terminal in the review checkout. Removing the worktree deletes the directory that any session inside it runs from.
- Run `pnpm install`. A stacked branch carries the base PR's dependency changes as well as its own.
- Any Claude Code session open in the worktree loses its working directory. Start a fresh session in the review checkout.

Do not merge the checklist branch into the PR branch to move the work across. That rewrites the base PR's branch and breaks the stack.

## Sketch: the future skill

Name idea: `kickstart-checklist`. Input: the checklist path, for example `/jig:kickstart-checklist docs/mcp-server/checklists/10a-registration-policy.md`.

What the skill does:

1. Read the checklist. Extract the `Branch:` line and the "Builds on" line.
2. Map "Builds on" entries to tracker rows. Find the newest one that is not merged. That row's PR branch is the base. If all are merged, the base is `main`.
3. Refuse to run if the working tree of the current checkout is dirty and the dirt touches files the checklist names.
4. Create the worktree and the stacked branch (step 2 above).
5. Run `pnpm install --prefer-offline` in the worktree.
6. Link the ignored env files (step 4 above). Read each app's `with-env` script for the paths, and symlink every one that exists in the review checkout.
7. Print the exact `/goal` command from the tracker and the worktree path. The developer starts the build session; the skill does not.
8. Print the two follow-up commands the developer runs later: the rebase (step 6) and the `--onto` re-parent (step 7), with the branch names filled in.

Step 6 is the one that pays for itself. It costs two commands and removes a failure that stops a build session dead.

Open questions for review:

- Should the skill detect the base branch from the tracker, or take it as an argument?
- Should the skill also handle the cleanup step, or leave `git worktree remove` manual?
- Should the rebase after each review push become a hook or a `/loop`, or stay manual?
- Where does the skill live: this plugin, or the user scope?
- Should env linking be a repo-level fix rather than a skill step? A `direnv` file, a secrets manager (`vercel env pull`, `op run`, `dotenvx`), or a `post-checkout` hook would give every worktree its env with no skill involved.
- Should the skill own the return path as well ("Leave the worktree before the PR merges"), or is that a second skill?
