import type { PermissionCode, RoleCode } from "./permission-types";

export const ROLE_CODES: RoleCode[] = [
  "OWNER",
  "ADMIN",
  "EDITOR",
  "CONTRIBUTOR",
  "FAMILY_VIEWER",
  "PUBLIC_VIEWER",
];

export const PERMISSION_CODES: PermissionCode[] = [
  "people.view",
  "people.create",
  "people.update",
  "people.delete",
  "people.restore",
  "relationships.view",
  "relationships.create",
  "relationships.update",
  "relationships.delete",
  "tree.view",
  "tree.edit_layout",
  "media.view",
  "media.upload",
  "media.delete",
  "revisions.view",
  "revisions.restore",
  "exports.create",
  "exports.download",
  "imports.create",
  "settings.manage",
  "permissions.manage",
];
