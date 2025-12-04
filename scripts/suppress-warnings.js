/**
 * Wrapper script to suppress specific console warnings during Next.js build/dev
 * This filters out the baseline-browser-mapping warning which is a false positive
 */

const { spawn } = require("child_process");

const command = process.argv[2]; // 'dev' or 'build'
const nextCommand = command === "dev" ? "next dev" : "next build";

const child = spawn("npx", nextCommand.split(" "), {
  stdio: ["inherit", "pipe", "pipe"],
  shell: true,
});

const filterWarning = (data) => {
  const text = data.toString();
  // Filter out the baseline-browser-mapping warning
  if (text.includes("baseline-browser-mapping")) {
    return "";
  }
  return text;
};

child.stdout.on("data", (data) => {
  const filtered = filterWarning(data);
  if (filtered) process.stdout.write(filtered);
});

child.stderr.on("data", (data) => {
  const filtered = filterWarning(data);
  if (filtered) process.stderr.write(filtered);
});

child.on("close", (code) => {
  process.exit(code);
});
