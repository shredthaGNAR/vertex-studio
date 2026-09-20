import { execSync } from "node:child_process";
import { unlinkSync } from "node:fs";

const GIT = "/opt/homebrew/bin/git";
const run = (cmd: string) => console.log(execSync(cmd, { stdio: ["ignore", "pipe", "pipe"] }).toString().trim());

run(`${GIT} add -A`);
try { run(`${GIT} commit -m "Remove helper scripts"`); } catch { console.log("(nothing to commit)"); }
run(`${GIT} push`);
unlinkSync("scripts/sync.ts");
run(`${GIT} add -A`);
try { run(`${GIT} commit -m "Remove sync helper"`); run(`${GIT} push`); } catch {}
console.log("done");
