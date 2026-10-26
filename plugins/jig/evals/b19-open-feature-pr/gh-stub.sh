#!/bin/bash
# A stand-in for the GitHub CLI in the eval: `gh pr create` records its title,
# base, branch, the remote's branches and its body in .eval/pr.txt, and prints a
# PR URL. No network.
root=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
record="$root/.eval/pr.txt"
url="https://github.com/acme/store/pull/7"
case "$1 $2" in
  "auth status") echo "github.com"; echo "  ✓ Logged in to github.com account acme-dev (keyring)"; exit 0 ;;
  "pr view")
    if [ -f "$record" ]; then echo "$url"; exit 0; fi
    echo "no pull requests found for branch \"$(git branch --show-current)\"" >&2; exit 1 ;;
  "pr create") ;;
  *) exit 0 ;;
esac
shift 2
title="" base="main" head="" body="" body_file=""
while [ $# -gt 0 ]; do
  case "$1" in
    -t|--title) title="$2"; shift 2 ;;
    --title=*) title="${1#*=}"; shift ;;
    -b|--body) body="$2"; shift 2 ;;
    --body=*) body="${1#*=}"; shift ;;
    -F|--body-file) body_file="$2"; shift 2 ;;
    --body-file=*) body_file="${1#*=}"; shift ;;
    -B|--base) base="$2"; shift 2 ;;
    --base=*) base="${1#*=}"; shift ;;
    -H|--head) head="$2"; shift 2 ;;
    --head=*) head="${1#*=}"; shift ;;
    *) shift ;;
  esac
done
if [ "$body_file" = "-" ]; then body=$(cat); elif [ -n "$body_file" ]; then body=$(cat "$body_file"); fi
[ -n "$head" ] || head=$(git branch --show-current)
if ! git ls-remote --exit-code --heads origin "$head" >/dev/null 2>&1; then
  echo "pull request create failed: the branch $head is not on the remote; push it first" >&2; exit 1
fi
mkdir -p "$root/.eval"
{
  echo "title: $title"
  echo "base: $base"
  echo "head: $head"
  echo "remote-heads:"
  git ls-remote --heads origin
  echo "body:"
  printf '%s\n' "$body"
} > "$record"
echo "$url"
