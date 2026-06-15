import "server-only";

import { maybeCreateAdminSupabaseClient } from "@/lib/supabase/admin";

export type RevisionAction = "create" | "update" | "delete" | "restore";

export async function logRevision(params: {
  entityType: string;
  entityId: string;
  action: RevisionAction;
  before: unknown | null;
  after: unknown | null;
  changedBy: string | null;
  reason?: string | null;
}) {
  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return;
  }

  await supabase.from("revisions").insert({
    entity_type: params.entityType,
    entity_id: params.entityId,
    action: params.action,
    before_json: params.before,
    after_json: params.after,
    changed_by: params.changedBy,
    change_reason: params.reason ?? null,
  });
}
