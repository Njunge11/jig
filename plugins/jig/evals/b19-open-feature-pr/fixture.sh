#!/bin/bash
# The store app on main, pushed to a local remote; then the builder's finished
# work for checklist 07, committed on its feature branch and not pushed. A
# stand-in `gh` on the agent's PATH records the PR it opens.
set -euo pipefail
source "$(dirname "$0")/../fixture-store-app.sh"
case_dir="$(cd "$(dirname "$0")" && pwd)"
git init -q --bare .git/remote.git
git remote add origin .git/remote.git
git push -q origin main
git checkout -q -b feat/invite-resend
commit() { git add -A; git -c user.name=builder -c user.email=builder@example.invalid commit -q -m "$1"; }
cp -R "$case_dir/work/db" .
mkdir -p features/members/db && cp "$case_dir/work/features/members/db/invitations.repo.ts" features/members/db/
commit "feat(invites): resend a pending invitation with a new token"
cp -R "$case_dir/work/features" "$case_dir/work/lib" .
rm -rf features/members/ui
commit "feat(invites): send the invitation again on resend"
cp -R "$case_dir/work/features" .
cp -R "$case_dir/work/app" .
commit "feat(invites): add the Resend button to the members page"
cp -R "$case_dir/work/docs" .
commit "docs(growth): hand off checklist 07"
# The agent's sandbox cannot read the developer tools folder that /usr/bin/git
# hands off to, so the run gets its own clone of the real git, in the same
# layout (bin/ beside libexec/git-core/), so the helpers' relative links resolve.
clt=/Library/Developer/CommandLineTools/usr
mkdir -p ../git/usr/bin ../git/usr/libexec ../bin
cp -Rc "$clt"/bin/git "$clt"/bin/git-receive-pack "$clt"/bin/git-upload-pack "$clt"/bin/git-upload-archive ../git/usr/bin/
cp -Rc "$clt/libexec/git-core" ../git/usr/libexec/git-core
cp "$case_dir/gh-stub.sh" ../bin/gh
chmod +x ../bin/gh
cat > ../.zshenv <<'ENV'
export PATH="$HOME/bin:$HOME/git/usr/bin:$PATH"
export GIT_EXEC_PATH="$HOME/git/usr/libexec/git-core"
export GIT_CONFIG_NOSYSTEM=1
ENV
