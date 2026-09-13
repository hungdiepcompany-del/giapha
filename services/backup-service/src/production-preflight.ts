export const PRODUCTION_PREFLIGHT_MARKER = "BACKUP_SERVICE_PRODUCTION_PREFLIGHT_ONLY" as const;
export const PRODUCTION_PREFLIGHT_SUCCESS_CODE = "BACKUP_SERVICE_PRODUCTION_PREFLIGHT_OK" as const;

export type ProductionPreflightEnv = {
  BACKUP_SERVICE_MODE?: string;
  BACKUP_ACTIVE_KEY_VERSION?: string;
  BACKUP_BUCKET?: R2Bucket;
  BACKUP_DATA_KEY_V1_B64?: string;
  BACKUP_OBJECT_KEY_HMAC_V1_B64?: string;
};

export type ProductionPreflightResult = {
  marker: typeof PRODUCTION_PREFLIGHT_MARKER;
  mode: "production";
  r2Binding: "BACKUP_BUCKET";
  activeKeyVersion: "v1";
};

function assertNonEmptySecret(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateProductionPreflight(env: ProductionPreflightEnv): ProductionPreflightResult {
  if (env.BACKUP_SERVICE_MODE !== "production") throw new Error("PRODUCTION_MODE_REQUIRED");
  if (!env.BACKUP_BUCKET) throw new Error("PRODUCTION_R2_BINDING_REQUIRED");
  if (!assertNonEmptySecret(env.BACKUP_DATA_KEY_V1_B64)) throw new Error("PRODUCTION_DATA_KEY_REQUIRED");
  if (!assertNonEmptySecret(env.BACKUP_OBJECT_KEY_HMAC_V1_B64)) throw new Error("PRODUCTION_OBJECT_KEY_HMAC_REQUIRED");
  if (env.BACKUP_ACTIVE_KEY_VERSION !== "v1") throw new Error("PRODUCTION_ACTIVE_KEY_VERSION_REQUIRED");
  canonicalBase64To32Bytes(env.BACKUP_DATA_KEY_V1_B64, "PRODUCTION_DATA_KEY_INVALID");
  canonicalBase64To32Bytes(env.BACKUP_OBJECT_KEY_HMAC_V1_B64, "PRODUCTION_OBJECT_KEY_HMAC_INVALID");

  return {
    marker: PRODUCTION_PREFLIGHT_MARKER,
    mode: "production",
    r2Binding: "BACKUP_BUCKET",
    activeKeyVersion: "v1",
  };
}
import { canonicalBase64To32Bytes } from "./production-crypto";
