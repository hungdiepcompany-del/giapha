const { spawnSync } = require("node:child_process");

const PREFIX = "[backup:pipeline:readiness]";
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const steps = [
  "backup:dry-run",
  "backup:fixture:generate",
  "backup:fixture:verify",
  "restore:dry-run",
];

function runStep(scriptName) {
  const command = process.platform === "win32" ? "cmd.exe" : npmCommand;
  const args =
    process.platform === "win32"
      ? ["/d", "/s", "/c", `${npmCommand} run ${scriptName}`]
      : ["run", scriptName];
  const result = spawnSync(command, args, {
    encoding: "utf8",
    stdio: "pipe",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.stdout.write(result.stdout || "");
    process.stderr.write(result.stderr || "");
    throw new Error(`${scriptName} failed`);
  }

  console.log(`${PREFIX} ${scriptName}: PASS`);
}

function main() {
  console.log(`${PREFIX} PIPELINE_READINESS_ONLY`);

  for (const step of steps) {
    runStep(step);
  }

  console.log(`${PREFIX} Result: PASS`);
}

try {
  main();
} catch (error) {
  console.error(`${PREFIX} Result: FAIL`);
  console.error(`${PREFIX} ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
