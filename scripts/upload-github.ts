import { execSync } from "node:child_process";

const REPO = "vertex-studio";

function run(cmd: string): string {
  console.log(`\n$ ${cmd}`);
  try {
    const out = execSync(cmd, { stdio: ["ignore", "pipe", "pipe"] }).toString().trim();
    if (out) console.log(out);
    return out;
  } catch (e: any) {
    const stderr = e.stderr?.toString() ?? e.message;
    console.log(`FAILED: ${stderr.trim().split("\n").slice(0, 4).join("\n")}`);
    throw new Error(stderr);
  }
}

// Commit any pending changes
run("git add -A");
try {
  run('git commit -m "Polish README, remove scratch scripts"');
} catch {
  console.log("(nothing to commit)");
}

// Normalize default branch
run("git branch -M main");

// Create repo (skip if it already exists) and push
try {
  run(`gh repo create ${REPO} --private --source=. --push`);
} catch {
  console.log("Repo may already exist — adding remote and pushing instead.");
  try { run(`git remote add origin https://github.com/shredthaGNAR/${REPO}.git`); } catch {}
  run("git push -u origin main");
}

const url = run("gh repo view --json url -q .url");
console.log(`\nDone: ${url}`);
