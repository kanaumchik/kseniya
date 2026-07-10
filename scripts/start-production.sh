#!/usr/bin/env bash
set -euo pipefail

cd /srv/xeniia
set -a
. /srv/xeniia/.env
set +a

exec npm start
