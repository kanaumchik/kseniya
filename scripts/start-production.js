#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const { readFileSync } = require("node:fs");
const { spawn } = require("node:child_process");

const envPath = "/srv/xeniia/.env";
const envFile = readFileSync(envPath, "utf8");

for (const line of envFile.split(/\r?\n/)) {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith("#")) {
    continue;
  }

  const equalsIndex = trimmed.indexOf("=");

  if (equalsIndex === -1) {
    continue;
  }

  const key = trimmed.slice(0, equalsIndex).trim();
  const rawValue = trimmed.slice(equalsIndex + 1).trim();
  const value = rawValue.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");

  process.env[key] = value;
}

const child = spawn("npm", ["start"], {
  cwd: "/srv/xeniia",
  env: process.env,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.exit(1);
  }

  process.exit(code ?? 1);
});
