const BR_DATE_ONLY_REGEX = /^(\d{2})\/(\d{2})\/(\d{4})$/;

export const parseBrDate = (value: string, fieldName = "date"): Date => {
  const raw = value.trim();
  const match = raw.match(BR_DATE_ONLY_REGEX);

  if (!match) {
    throw new Error(`${fieldName} inválida. Use o formato dd/mm/aaaa`);
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  const parsed = new Date(Date.UTC(year, month - 1, day));
  const isValid =
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day;

  if (!isValid) {
    throw new Error(`${fieldName} inválida. Use o formato dd/mm/aaaa`);
  }

  return parsed;
};
