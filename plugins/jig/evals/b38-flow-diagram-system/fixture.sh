#!/bin/bash
# A bare repo: the case writes documents only, so no app is needed.
set -euo pipefail
echo '{ "name": "webhooks-app", "private": true }' > package.json
printf '# webhooks-app\n' > README.md
git init -q -b main
git add -A
git -c user.name=eval -c user.email=eval@example.invalid commit -q -m "fixture"
