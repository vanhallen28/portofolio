import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { backend } from "@/lib/env";
import { LocalStore } from "./local-store";
import { seed } from "./seed";
import { publicView, StoreError, type ContentStore } from "./store";
import { SupabaseStore } from "./supabase-store";
import type { Content } from "./types";

export const CONTENT_TAG = "content";

/** Read-only store used when a production build has no Supabase variables. */
class SeedStore implements ContentStore {
  async read() {
    return structuredClone(seed);
  }
  private refuse(): never {
    throw new StoreError("Database belum terhubung. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di Vercel, lalu deploy ulang.");
  }
  saveSettings = async () => this.refuse();
  saveSection = async () => this.refuse();
  saveLines = async () => this.refuse();
  saveProject = async () => this.refuse();
  deleteProject = async () => this.refuse();
  reorderProjects = async () => this.refuse();
  saveCaseStudy = async () => this.refuse();
}

/** Store for the admin: drafts included, writes go through the signed-in admin's session. */
export async function getStore(): Promise<ContentStore> {
  switch (backend()) {
    case "supabase": {
      const { createServerSupabase } = await import("@/lib/supabase/server");
      return new SupabaseStore(await createServerSupabase());
    }
    case "local":
      return new LocalStore();
    default:
      return new SeedStore();
  }
}

async function readPublic(): Promise<Content> {
  const b = backend();
  if (b === "local") return publicView(await new LocalStore().read());
  if (b === "seed") return publicView(seed);
  const { createPublicSupabase } = await import("@/lib/supabase/public");
  try {
    return publicView(await new SupabaseStore(createPublicSupabase()).read());
  } catch (e) {
    // First deploy before the SQL has been run (tables missing): build from the seed so the site is up;
    // it switches to Supabase content once the tables exist. Any other failure (database paused,
    // network, wrong key) must fail the build, so Vercel keeps the previous good deployment instead of
    // publishing seed content. At runtime a throw keeps the last cached version on screen.
    const code = e instanceof StoreError ? e.code : undefined;
    if (process.env.NEXT_PHASE === "phase-production-build" && (code === "PGRST205" || code === "42P01")) {
      console.warn("[konten] Tabel Supabase belum ada (supabase/migrations/0001_init.sql belum dijalankan): build memakai isi awal.");
      return publicView(seed);
    }
    if (process.env.NEXT_PHASE === "phase-production-build") {
      throw new Error(`Supabase tidak bisa dibaca saat build (${(e as Error).message}). Periksa proyek Supabase tidak sedang di-pause dan variabelnya benar, lalu deploy ulang. Deploy sebelumnya tetap tayang.`);
    }
    throw e;
  }
}

/** Published content for visitors. Cached under the `content` tag; every admin save clears it. */
export const getPublicContent = cache(
  unstable_cache(readPublic, ["public-content", process.env.PORTO_VERSION ?? "dev", process.env.VERCEL_DEPLOYMENT_ID ?? "", process.env.PORTO_DATA_FILE ?? ""], {
    tags: [CONTENT_TAG],
    revalidate: 600,
  }),
);
