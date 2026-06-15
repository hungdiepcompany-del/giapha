export type RevisionAction = "create" | "update" | "delete" | "restore";

export type RevisionEntityType =
  | "people"
  | "families"
  | "family_parents"
  | "family_children"
  | "couple_relationships"
  | "tree_layouts"
  | "tree_layout_nodes";

export type Revision = {
  id: string;
  entity_type: string;
  entity_id: string;
  action: RevisionAction;
  before_json: unknown | null;
  after_json: unknown | null;
  changed_by: string | null;
  changed_at: string;
  change_reason: string | null;
};

export type RevisionItem = {
  id: string;
  revision_id: string;
  field_name: string | null;
  before_json: unknown | null;
  after_json: unknown | null;
  created_at: string;
};

export type RevisionListFilter = {
  entity_type?: string;
  action?: RevisionAction | "all";
  entity_id?: string;
  changed_by?: string;
  changed_from?: string;
  changed_to?: string;
};

export type RevisionDiffField = {
  field_name: string;
  old_value: unknown;
  new_value: unknown;
  changed: boolean;
};

export type RevisionDetail = {
  revision: Revision;
  items: RevisionItem[];
  diff: RevisionDiffField[];
  can_restore: boolean;
};

export type RevisionServiceResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: string;
      reason?: string;
    };
