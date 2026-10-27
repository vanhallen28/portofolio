/* npm run seed:sql — writes supabase/seed.sql from lib/content/seed.ts. */
import { mkdirSync, writeFileSync } from "node:fs";
import { seed } from "../lib/content/seed";
import { buildSeedSql } from "../lib/content/seed-sql";
import { buildUpdateSql020 } from "../lib/content/update-sql";

writeFileSync("supabase/seed.sql", buildSeedSql(seed));
mkdirSync("supabase/updates", { recursive: true });
writeFileSync("supabase/updates/v0.2.0.sql", buildUpdateSql020(seed));
console.log(`supabase/seed.sql ditulis: ${seed.projects.length} proyek, ${seed.caseStudies.length} studi kasus. supabase/updates/v0.2.0.sql ditulis.`);
