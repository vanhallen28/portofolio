/* npm run seed:sql — writes supabase/seed.sql from lib/content/seed.ts. */
import { mkdirSync, writeFileSync } from "node:fs";
import { seed } from "../lib/content/seed";
import { buildSeedSql } from "../lib/content/seed-sql";
import { buildUpdateSql020, buildUpdateSql022, buildUpdateSql027, buildUpdateSql028 } from "../lib/content/update-sql";

writeFileSync("supabase/seed.sql", buildSeedSql(seed));
mkdirSync("supabase/updates", { recursive: true });
writeFileSync("supabase/updates/v0.2.0.sql", buildUpdateSql020(seed));
writeFileSync("supabase/updates/v0.2.2.sql", buildUpdateSql022(seed));
writeFileSync("supabase/updates/v0.2.7.sql", buildUpdateSql027(seed));
writeFileSync("supabase/updates/v0.2.8.sql", buildUpdateSql028(seed));
console.log(`supabase/seed.sql ditulis: ${seed.projects.length} proyek, ${seed.caseStudies.length} studi kasus. supabase/updates/v0.2.0.sql, v0.2.2.sql, v0.2.7.sql, dan v0.2.8.sql ditulis.`);
