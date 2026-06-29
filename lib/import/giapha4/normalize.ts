export function normalizeGiaPha4Text(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeGiaPha4Gender(
  value: unknown,
): "male" | "female" | "other" | "unknown" {
  const normalized = normalizeGiaPha4Text(value).toLowerCase();

  if (["nam", "male", "m"].includes(normalized)) return "male";
  if (["nữ", "nu", "female", "f"].includes(normalized)) return "female";
  if (["khác", "khac", "other"].includes(normalized)) return "other";

  return "unknown";
}

export function parseGiaPha4Generation(value: unknown): number | undefined {
  const normalized = normalizeGiaPha4Text(value);
  if (!/^\d+$/.test(normalized)) return undefined;

  const generation = Number.parseInt(normalized, 10);
  return generation > 0 ? generation : undefined;
}

export function normalizeGiaPha4DateText(value: unknown): {
  value?: string;
  warning?: string;
} {
  const normalized = normalizeGiaPha4Text(value);
  if (!normalized) return {};

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return { value: normalized };
  }

  if (/^\d{4}$/.test(normalized)) {
    return {
      value: normalized,
      warning: "Ngày chỉ có năm, cần chủ nhà xác nhận trước khi nhập thật.",
    };
  }

  return {
    value: normalized,
    warning: "Ngày chưa chắc định dạng, giữ nguyên để xem trước và cần rà soát.",
  };
}
