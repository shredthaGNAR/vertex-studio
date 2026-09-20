import { execSync } from "node:child_process";

const GIT = "/opt/homebrew/bin/git";
const run = (cmd: string) => {
  console.log(`$ ${cmd}`);
  const out = execSync(cmd, { stdio: ["ignore", "pipe", "pipe"] }).toString().trim();
  if (out) console.log(out);
  return out;
};

run(`${GIT} add -A`);
try { run(`${GIT} commit -m "Remove one-off upload helper scripts"`); } catch { console.log("(nothing to commit)"); }
run(`${GIT} push`);
run(`${GIT} rm scripts/push-cleanup.ts`);
try { run(`${GIT} commit -m "Remove push helper"`); } catch {}
run(`${GIT} push`);
console.log("\nRepo files:");
console.log(run("gh repo view --json name,visibility,url"));
run(`gh api repos/shredthaGNAR/vertex-studio/git/trees/main?recursive=1 -q '.tree[].path'`);
