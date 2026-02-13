const fs = require("fs");
const path = require("path");

const roots = [
  path.join(process.cwd(), "frontend"),
  path.join(process.cwd(), "api"),
  path.join(process.cwd(), "sql"),
  path.join(process.cwd(), "docs"),
];

const allowExt = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".mjs",
  ".php",
  ".sql",
  ".md",
  ".txt",
  ".json",
]);

const pattern = /(Å|Ä|Â|â€œ|â€|â€™|â€“|â€”|â€¢|â†’)/g;
const ignoredFiles = new Set([
  path.join(process.cwd(), "scripts", "check-mojibake.js"),
  path.join(process.cwd(), "sql", "migrations", "2026-02-13-encoding-audit.sql"),
]);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === ".next" || entry.name === "node_modules" || entry.name === ".git") {
        continue;
      }
      walk(fullPath, out);
      continue;
    }
    if (!allowExt.has(path.extname(entry.name).toLowerCase())) continue;
    out.push(fullPath);
  }
  return out;
}

let hasErrors = false;
for (const root of roots) {
  const files = walk(root);
  for (const file of files) {
    if (ignoredFiles.has(file)) continue;
    const content = fs.readFileSync(file, "utf8");
    const match = content.match(pattern);
    if (!match) continue;
    hasErrors = true;
    const relPath = path.relative(process.cwd(), file);
    const uniq = [...new Set(match)].join(", ");
    console.error(`Mojibake detected in ${relPath}: ${uniq}`);
  }
}

if (hasErrors) {
  process.exit(1);
}

console.log("No mojibake patterns detected.");
