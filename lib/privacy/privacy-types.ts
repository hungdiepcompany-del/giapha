export type PrivacyLevel = "public" | "family" | "private";

export type LivingPrivacyRule = {
  livingStatus: "living" | "deceased" | "unknown";
  defaultPrivacyLevel: PrivacyLevel;
};
