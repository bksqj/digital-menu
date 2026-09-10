const NUMBER_FORMATTER = new Intl.NumberFormat("ru");

export function formatNumber(value: number) {
  return NUMBER_FORMATTER.format(value);
}

export function formatRelativeTime(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes < 1) return "только что";
  if (diffMinutes < 60) return `${diffMinutes} ${pluralize(diffMinutes, "минуту", "минуты", "минут")} назад`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} ${pluralize(diffHours, "час", "часа", "часов")} назад`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 30) return `${diffDays} ${pluralize(diffDays, "день", "дня", "дней")} назад`;

  return new Intl.DateTimeFormat("ru", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function pluralize(count: number, one: string, few: string, many: string) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}
