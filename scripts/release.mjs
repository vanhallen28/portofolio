#!/usr/bin/env node
/* npm run release — makes the versioned zip that is handed over.
   1. the working tree must be committed (the zip is built from git, so it matches the repo exactly)
   2. lint, typecheck, unit + SQL tests, production build (and end-to-end with --e2e)
   3. ../rilis/portofolio-v<version>.zip with every tracked file at the zip root
   The version comes from package.json; bump it (and CHANGELOG + docs/updates/BACA-INI-v<version>.txt) first. */
import { execSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const { version } = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
const name = `portofolio-v${version}.zip`;
const outDir = path.resolve(root, "..", "rilis");
const out = path.join(outDir, name);
const sh = (cmd) => execSync(cmd, { cwd: root, encoding: "utf8" }).trim();
const step = (label, cmd, args) => {
  console.log(`\n▶ ${label}`);
  const r = spawnSync(cmd, args, { cwd: root, stdio: "inherit", env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" } });
  if (r.status !== 0) { console.error(`\n✗ ${label} gagal. Zip tidak dibuat.`); process.exit(1); }
};

if (sh("git status --porcelain") && !process.argv.includes("--allow-dirty")) {
  console.error("✗ Ada perubahan yang belum di-commit. Commit dulu supaya isi zip sama dengan repo.");
  process.exit(1);
}
for (const f of ["CHANGELOG.md", `docs/updates/BACA-INI-v${version}.txt`]) {
  if (!existsSync(path.join(root, f))) { console.error(`✗ ${f} belum ada.`); process.exit(1); }
}
if (!readFileSync(path.join(root, "CHANGELOG.md"), "utf8").includes(`## v${version}`)) {
  console.error(`✗ CHANGELOG.md belum punya bagian "## v${version}".`);
  process.exit(1);
}
if (existsSync(out) && !process.argv.includes("--overwrite")) {
  console.error(`✗ ${name} sudah ada. Naikkan versi di package.json (setiap zip harus bernomor baru), atau --overwrite untuk membuat ulang rilis yang belum dikirim.`);
  process.exit(1);
}

step("Lint", "npx", ["eslint", "."]);
step("Typecheck", "npx", ["tsc", "--noEmit"]);
step("Uji unit & SQL", "npx", ["vitest", "run"]);
step("seed.sql sesuai isi awal", "npx", ["vitest", "run", "tests/sql/rls.test.ts", "-t", "up to date"]);
if (process.argv.includes("--e2e")) step("Uji end-to-end", "node", ["tests/e2e/run.mjs"]);
step("Build produksi", "npx", ["next", "build"]);

mkdirSync(outDir, { recursive: true });
sh(`git archive --format=zip -9 --output "${out}" HEAD`);
const sha = createHash("sha256").update(readFileSync(out)).digest("hex");
const files = sh(`git ls-files | wc -l`);
const mb = (statSync(out).size / 1024 / 1024).toFixed(1);
console.log(`
✓ ${name} (${mb} MB, ${files} file, commit ${sh("git rev-parse --short HEAD")})
  ${out}
  sha256 ${sha}

Pasang:
  cd ~/Documents/Virgiawan/PROJECT/portofolio
  unzip -o ~/Downloads/${name} -d .
  npm install
  git add -A && git commit -m "v${version}" && git push
`);
