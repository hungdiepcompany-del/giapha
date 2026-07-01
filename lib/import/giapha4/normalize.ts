export function normalizeGiaPha4Text(value: unknown): string {
  if (typeof value !== "string" && typeof value !== "number") return "";
  return String(value).trim().replace(/\s+/g, " ");
}

const GIAPHA4_NULL_PLACEHOLDERS = new Set([
  "0",
  "5",
  "0/0/0",
  "00/00/0000",
  "null",
  "undefined",
  "n/a",
  "na",
  "-",
  "--",
]);

function normalizeComparable(value: unknown) {
  return normalizeGiaPha4Text(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .trim();
}

export function isGiaPha4NullPlaceholder(value: unknown): boolean {
  const normalized = normalizeComparable(value);
  return !normalized || GIAPHA4_NULL_PLACEHOLDERS.has(normalized);
}

export function normalizeGiaPha4NullableText(value: unknown): string {
  if (isGiaPha4NullPlaceholder(value)) return "";
  return normalizeGiaPha4Text(value);
}

export function normalizeGiaPha4Gender(
  value: unknown,
): "male" | "female" | "other" | "unknown" {
  const normalized = normalizeComparable(value);

  if (["nam", "male", "m"].includes(normalized)) return "male";
  if (["nu", "female", "f"].includes(normalized)) return "female";
  if (["khac", "other"].includes(normalized)) return "other";

  return "unknown";
}

export function parseGiaPha4Generation(value: unknown): number | undefined {
  const normalized = normalizeGiaPha4NullableText(value);
  if (!/^\d+$/.test(normalized)) return undefined;

  const generation = Number.parseInt(normalized, 10);
  return generation > 0 ? generation : undefined;
}

export function parseGiaPha4PositiveNumber(value: unknown): number | undefined {
  const normalized = normalizeGiaPha4NullableText(value);
  const match = normalized.match(/\d+/);
  if (!match) return undefined;
  const parsed = Number.parseInt(match[0], 10);
  return parsed > 0 ? parsed : undefined;
}

function excelSerialDateToIso(serial: number) {
  if (!Number.isFinite(serial) || serial < 1 || serial > 2958465) return null;
  const excelEpoch = Date.UTC(1899, 11, 30);
  const date = new Date(excelEpoch + Math.floor(serial) * 86_400_000);
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function normalizeGiaPha4DateText(value: unknown): {
  value?: string;
  warning?: string;
} {
  if (isGiaPha4NullPlaceholder(value)) return {};

  const normalized = normalizeGiaPha4Text(value);
  if (!normalized) return {};

  if (/^\d+(\.\d+)?$/.test(normalized)) {
    const serialDate = excelSerialDateToIso(Number(normalized));
    if (serialDate) return { value: serialDate };
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return { value: normalized };
  }

  if (/^\d{4}$/.test(normalized)) {
    return {
      value: normalized,
      warning:
        "Ngày chỉ có năm, cần chủ nhà xác nhận trước khi nhập thật.",
    };
  }

  const slashYear = /^\/(\d{4})$/.exec(normalized);
  if (slashYear) {
    return {
      value: slashYear[1],
      warning:
        "Ngày chỉ có năm, cần chủ nhà xác nhận trước khi nhập thật.",
    };
  }

  const dayMonthYear = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(normalized);
  if (dayMonthYear) {
    const day = Number(dayMonthYear[1]);
    const month = Number(dayMonthYear[2]);
    const year = Number(dayMonthYear[3]);
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      return {
        value: `${year}-${`${month}`.padStart(2, "0")}-${`${day}`.padStart(2, "0")}`,
      };
    }
  }

  return {
    warning: "Ngày chưa chắc định dạng, đã để trống và cần rà soát.",
  };
}
