export const parseDateInputValue = (value: string): Date | null => {
  const normalized = value.trim();
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
};

export const buildIsoDateRange = (startValue: string, endValue: string) => {
  const parsedStart = parseDateInputValue(startValue);
  const parsedEnd = parseDateInputValue(endValue);

  if (!parsedStart || !parsedEnd) {
    return {
      start_date: null,
      end_date: null,
      daysCount: 0,
    };
  }

  const start = new Date(
    Date.UTC(parsedStart.getFullYear(), parsedStart.getMonth(), parsedStart.getDate(), 0, 0, 0, 0)
  );
  const end = new Date(
    Date.UTC(parsedEnd.getFullYear(), parsedEnd.getMonth(), parsedEnd.getDate(), 0, 0, 0, 0)
  );

  if (end < start) {
    return {
      start_date: null,
      end_date: null,
      daysCount: 0,
    };
  }

  const diffMs = end.getTime() - start.getTime();
  const daysCount = Math.floor(diffMs / (24 * 60 * 60 * 1000)) + 1;

  return {
    start_date: start.toISOString(),
    end_date: end.toISOString(),
    daysCount,
  };
};
