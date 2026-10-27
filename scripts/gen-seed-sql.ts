/* npm run seed:sql — writes supabase/seed.sql from lib/content/seed.ts. */
import { writeFileSync } from "node:fs";
import { seed } from "../lib/content/seed";
import { buildSeedSql } from "../lib/content/seed-sql";

writeFileSync("supabase/seed.sql", buildSeedSql(seed));
console.log(`supabase/seed.sql ditulis: ${seed.projects.length} proyek, ${seed.caseStudies.length} studi kasus.`);
