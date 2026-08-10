---
name: implementation-planner
description: Converts a spec doc into a tracker and implementation checklists. Each implementation checklist is one PR and holds the tasks that implement it. The tracker lists every implementation checklist with its status and its /goal run command. Work that changes what the software does gets a TDD implementation checklist, which a builder implements with TDD. Work that only changes the code's structure gets a step implementation checklist, which a builder follows step by step. The skill audits the repo first, and asks the developer when the spec leaves a decision open. Use when the developer runs /implementation-planner with a doc path.
---

# Implementation planner

## Instructions

### Step 1: Read the spec

The spec is the doc at `$ARGUMENTS`. Read the full document.

### Step 2: Audit the repo

Read the codebase and collect the context this spec's implementation checklists need: what already exists, what must be added, what must change to implement the spec. Every fact about the repo that you write into an implementation checklist must be verified against the repo in this session, not from memory.

### Step 3: Resolve gaps with the developer

Two kinds of gap stop the work:

1. The spec leaves undecided a detail the implementation checklists need.
2. The audit shows the spec is wrong about the repo.

In both cases, ask the developer. Write the resolution into the spec doc. Then continue from the amended spec. Do not design the answer yourself.

### Step 4: Split the work into implementation checklists

Split the spec's work into implementation checklists. One implementation checklist is one PR: the smallest unit of work a builder can implement and test on its own. Smaller units make testing and review easier. Order the checklists so that each one depends only on earlier ones.

A builder is the agent that executes one implementation checklist, task by task, in a run the developer starts with the checklist's /goal command.

Write each implementation checklist as `docs/<project>/checklists/NN-<slug>.md`. One question decides which checklist to write: **does the work change what the software does?**

- Yes: write a TDD implementation checklist, per `references/tdd-implementation-checklist.md`.
- No — the work only changes the code's structure: write a step implementation checklist, per `references/step-implementation-checklist.md`.
- Work that does both: split it into two checklists. If the answer is unclear, ask the developer.

Also give each implementation checklist its Conventional Commits type (`feat`, `fix`, `chore`, `refactor`, ...). The type names its branch and PR title. It does not decide which checklist to write.

Then write the tracker as `docs/<project>/tracker.md` — fill `assets/tracker-template.md`.

### Step 5: Check your output

Check every file you wrote. Fix every miss, then check again.

1. Open every checklist link in the tracker table. The file must exist. A tracker entry that links to a missing file cannot be run.
2. List the files in `checklists/`. Every file must appear in the tracker table. An implementation checklist missing from the tracker is never built.
3. Read each /goal run command. The path in it must equal the real path of the implementation checklist it runs. With a wrong path, the checklist can never pass its /goal check.
4. Checklist numbers must agree across the tracker table, the filenames, and the run-command labels. No two implementation checklists share a number.
5. Each /goal command must match the Run command in the checklist's reference file from Step 4.
6. Every task checkbox in every implementation checklist must be `[ ]`. The builder ticks boxes, not you.
7. Every Status in the tracker must be `Not started`.

When every check passes, you are done. Author documents only: do not write code or tests, do not create branches, do not run the checklists.
