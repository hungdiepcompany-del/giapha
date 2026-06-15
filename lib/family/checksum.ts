import "server-only";

import { createHash } from "node:crypto";

export function sha256Hex(input: string | Buffer | Uint8Array) {
  return createHash("sha256").update(input).digest("hex");
}
