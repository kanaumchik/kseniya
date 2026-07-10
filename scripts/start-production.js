#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const { spawn } = require("node:child_process");

const child = spawn("bash", ["-lc", "cd /srv/xeniia && set -a && . /srv/xeniia/.env && set +a && exec npm start"], {
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.exit(1);
  }

  process.exit(code ?? 1);
});
