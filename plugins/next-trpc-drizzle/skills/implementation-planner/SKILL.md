---
name: implementation-planner
description: Converts a spec doc into a tracker and implementation checklists. Each implementation checklist is one PR and holds the tasks that implement it. The tracker lists every implementation checklist with its status and its /goal run command. Work that changes what the software does gets a TDD implementation checklist, which a builder implements with TDD. Work that only changes the code's structure gets a step implementation checklist, which the implement-steps skill executes step by step. The skill audits the repo first, and asks the developer when the spec leaves a decision open. Use when the developer runs /next-trpc-drizzle:implementation-planner with a doc path, or asks to plan a spec's implementation, to split a spec doc into checklists or PRs, or to write a spec's project tracker.
---

# Implementation planner

Author documents only. Do not write code or tests. Do not create branches. Do not run the implementation checklists.

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

- Yes: write a TDD implementation checklist, per `references/tdd-implementation-checklist.md`. Before you write the first one, invoke the `backend-tests` skill. Its Review checklist defines the tests the builder writes — write every task so its tests can pass that checklist.
- No — the work only changes the code's structure: write a step implementation checklist, per `references/step-implementation-checklist.md`.
- Work that does both: split it into two checklists. If the answer is unclear, ask the developer.

Plan the spec's backend work only. The spec's frontend work is out of scope for this skill. Write no checklist for it. List it for the developer at the end of the run.

Also give each implementation checklist its Conventional Commits type (`feat`, `fix`, `chore`, `refactor`, ...). The type names its branch and PR title. It does not decide which checklist to write.

Then write the tracker as `docs/<project>/tracker.md` — fill `assets/tracker-template.md`. The tracker carries each implementation checklist's /goal run command:

For a TDD implementation checklist:

```
/goal the implement-backend skill was run on docs/<project>/checklists/NN-<slug>.md and every item in its Done section is shown satisfied in the transcript
```

For a step implementation checklist:

```
/goal the implement-steps skill was run on docs/<project>/checklists/NN-<slug>.md and every step and every Done item in it is shown satisfied in the transcript; for each Done item the pasted proof is the command, its final summary output, and its exit status — full output is not required
```

### Step 5: Check your output

Check every file you wrote. Fix every miss, then check again.

1. Open every checklist link in the tracker table. The file must exist. A tracker entry that links to a missing file cannot be run.
2. List the files in `checklists/`. Every file must appear in the tracker table. An implementation checklist missing from the tracker is never built.
3. Read each /goal run command. The path in it must equal the real path of the implementation checklist it runs. With a wrong path, the checklist can never pass its /goal check.
4. Checklist numbers must agree across the tracker table, the filenames, and the run-command labels. No two implementation checklists share a number.
5. Each /goal command must match its template in Step 4: the TDD command for a TDD implementation checklist, the step command for a step implementation checklist.
6. Every task checkbox in every implementation checklist must be `[ ]`. The builder ticks boxes, not you.
7. Every implementation checklist this run created must have Status `Not started` in the tracker. A checklist that was already in the tracker before this run keeps its Status.
8. Every section heading and label in every implementation checklist must come from its template. A label copied from an older document in the repo does not belong — the template decides the format, not the documents already there.

When every check passes, you are done.

## When a step fails

- **`$ARGUMENTS` is empty, or the spec doc does not exist.** Do not guess a path. Ask the developer for the spec doc's path.
- **The developer does not resolve a gap from Step 3.** Stop and report the open question. Never design the answer yourself. Never write a checklist over a gap.
- **`docs/<project>/tracker.md` already exists.** Add this run's rows and run commands to it. Keep every row that is already there, with its number and its Status. Never renumber an existing implementation checklist.
- **A Step 5 check fails twice on the same file.** Stop and report the file, the failing check, and the fix you tried. A tracker with a wrong link or a wrong run command is worse than no tracker.
