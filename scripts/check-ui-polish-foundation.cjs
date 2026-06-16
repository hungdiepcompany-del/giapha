const fs = require("node:fs");
const path = require("node:path");

const requiredFiles = [
  "components/layout/admin-shell.tsx",
  "components/layout/public-shell.tsx",
  "components/ui/page-header.tsx",
  "components/ui/empty-state.tsx",
  "components/ui/status-callout.tsx",
  "components/ui/section-card.tsx",
  "components/ui/action-link.tsx",
  "app/(public)/page.tsx",
  "app/auth/login/page.tsx",
  "app/(admin)/admin/people/page.tsx",
  "app/(admin)/admin/tree/page.tsx",
  "app/(admin)/admin/exports/page.tsx",
  "docs/99_NEXT_AI_HANDOFF.md",
];

const missing = requiredFiles.filter((file) => {
  return !fs.existsSync(path.join(process.cwd(), file));
});

if (missing.length > 0) {
  console.error("UI polish foundation check failed. Missing files:");
  for (const file of missing) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

console.log("UI polish foundation check passed.");
