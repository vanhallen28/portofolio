import path from "node:path";

/** Where local-mode uploads live (next to the local content file). */
export function localMediaDir(): string {
  const data = process.env.PORTO_DATA_FILE ? path.dirname(process.env.PORTO_DATA_FILE) : path.join(process.cwd(), ".data");
  return path.join(data, "uploads");
}
