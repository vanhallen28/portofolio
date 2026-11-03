import { getAdmin } from "@/lib/admin/auth";
import { backend } from "@/lib/env";
import { parseRange } from "@/lib/stats/classify";
import { readRows } from "@/lib/stats/store";
import type { Visit, Vital } from "@/lib/stats/types";

/* "Tarik data": every row of a period as CSV (UTF-8 with BOM, so Excel shows the accents). Admins only. */

const WIB = 7 * 3600 * 1000;
const wibTime = (iso: string) => new Date(Date.parse(iso) + WIB).toISOString().replace("T", " ").slice(0, 19);
const cell = (v: unknown) => { const s = String(v ?? ""); return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };

export async function GET(request: Request) {
  if (!(await getAdmin())) return new Response("Masuk sebagai admin dulu.", { status: 401 });
  const u = new URL(request.url);
  const kind = u.searchParams.get("kind") === "vitals" ? "vitals" : "visits";
  const r = parseRange(u.searchParams.get("from") ?? undefined, u.searchParams.get("to") ?? undefined);
  let db;
  if (backend() === "supabase") { const { createServerSupabase } = await import("@/lib/supabase/server"); db = await createServerSupabase(); }
  let rows: (Visit | Vital)[];
  try { rows = await readRows(kind, r, db); } catch (e) { return new Response(`Data tidak bisa dibaca: ${(e as Error).message}`, { status: 500 }); }
  const lines = kind === "visits"
    ? [["waktu_wib", "jenis", "halaman", "bahasa", "sumber", "perujuk", "negara", "perangkat", "pengunjung", "proyek"],
      ...(rows as Visit[]).map((x) => [wibTime(x.at), x.kind, x.path, x.lang, x.source, x.referrer, x.country, x.device, x.visitor, x.project])]
    : [["waktu_wib", "ukuran", "nilai", "halaman", "perangkat"],
      ...(rows as Vital[]).map((x) => [wibTime(x.at), x.name, x.value, x.path, x.device])];
  const csv = "﻿" + lines.map((l) => l.map(cell).join(",")).join("\r\n") + "\r\n";
  const name = `${kind === "visits" ? "kunjungan" : "performa"}-${r.from}_${r.to}.csv`;
  return new Response(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${name}"`, "Cache-Control": "private, no-store" },
  });
}
