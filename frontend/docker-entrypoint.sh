#!/bin/sh
set -e

# node_modules lives in an anonymous volume, so it survives image rebuilds
# and can drift from package.json (e.g. a new dependency added on the host).
# Reconcile on every container start/restart before running the app.
npm install

exec "$@"
