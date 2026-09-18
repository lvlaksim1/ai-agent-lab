const { spawnSync } = require("node:child_process");

const apiBase = "https://api.github.com";
const repo = process.env.GITHUB_REPOSITORY;
const token = process.env.GITHUB_TOKEN;
const ref = process.env.RUNTIME_REF || "work-webhook-test";
const guardMinutes = [10, 22, 34, 46, 58];

if (!repo || !token) {
  throw new Error("GITHUB_REPOSITORY and GITHUB_TOKEN are required");
}

const headers = {
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${token}`,
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "ai-agent-lab-stale-worker-watchdog"
};

async function api(path) {
  const response = await fetch(apiBase + path, { headers });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`GitHub API ${response.status} ${path}: ${text}`);
  }
  return text ? JSON.parse(text) : null;
}

async function state() {
  const row = await api(`/repos/${repo}/contents/.agent/state.json?ref=${encodeURIComponent(ref)}`);
  return JSON.parse(Buffer.from(row.content.replace(/\n/g, ""), "base64").toString("utf8"));
}

function nextGuardEpoch(nowMs) {
  const now = new Date(nowMs);
  for (const minute of guardMinutes) {
    const candidate = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      minute,
      0,
      0
    );
    if (candidate > nowMs + 1000) return candidate;
  }
  return Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours() + 1,
    guardMinutes[0],
    0,
    0
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function runRecoveryCycle() {
  const result = spawnSync(
    process.execPath,
    [".github/scripts/stale-worker-recovery.cjs"],
    {
      stdio: ["ignore", "pipe", "pipe"],
      encoding: "utf8",
      env: process.env
    }
  );
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== 0) {
    throw new Error(`Recovery cycle exited with status ${result.status}`);
  }
  return result.stdout || "";
}

async function main() {
  while (true) {
    const current = await state();
    if (current.status === "idle") {
      console.log("WATCHDOG: runtime idle; exiting.");
      return;
    }
    if (current.status !== "processing") {
      throw new Error(`WATCHDOG: unsupported state ${current.status}`);
    }

    const staleAtMs = Date.parse(current.heartbeat?.stale_at || "");
    const nowMs = Date.now();

    if (Number.isFinite(staleAtMs) && nowMs > staleAtMs) {
      console.log("WATCHDOG: heartbeat is already stale at startup; running recovery immediately.");
      const output = runRecoveryCycle();
      if (/RECOVERED:|IDLE:|UNKNOWN\/DEFECT:|RACE:/.test(output)) return;
      continue;
    }

    const guardMs = nextGuardEpoch(nowMs);
    const waitMs = Math.max(0, guardMs - Date.now());
    console.log(
      `WATCHDOG: processing ${current.active_event} / ${current.worker_id}; next guard at ${new Date(guardMs).toISOString()} (${Math.ceil(waitMs / 1000)}s).`
    );

    await sleep(waitMs);

    const output = runRecoveryCycle();
    if (/RECOVERED:|IDLE:|UNKNOWN\/DEFECT:|RACE:/.test(output)) return;

    const after = await state();
    if (after.status === "idle") return;

    // LIVE/no-op: remain armed for the next guard. A newer heartbeat state
    // push cancels this run and starts a fresh watchdog through workflow concurrency.
  }
}

main().catch((error) => {
  console.error(error.stack || String(error));
  process.exitCode = 1;
});
