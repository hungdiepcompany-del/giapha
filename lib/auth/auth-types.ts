export type AuthSessionStatus =
  | "anonymous"
  | "authenticated"
  | "expired"
  | "unknown";

export type AppProfile = {
  id: string;
  authUserId: string;
  displayName: string | null;
  email: string | null;
  status: "active" | "disabled";
};
