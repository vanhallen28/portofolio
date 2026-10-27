import type { z } from "zod";
import { StoreError } from "./store";

export function zodIssues(e: z.ZodError): string[] {
  return e.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`);
}

/** Parse or throw a StoreError carrying readable issues (shown in the admin). */
export function parseOrThrow<T>(schema: z.ZodType<T>, v: unknown, what: string): T {
  const r = schema.safeParse(v);
  if (!r.success) throw new StoreError(`Data ${what} tidak valid`, zodIssues(r.error));
  return r.data;
}
