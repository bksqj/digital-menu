// Business owners type a name (often Cyrillic), not a slug — transliterate
// so "Белла Рома" still produces a usable /m/:slug URL instead of failing
// the [a-z0-9-]+ validation.
const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

export function slugify(input: string): string {
  const transliterated = input
    .toLowerCase()
    .split("")
    .map((ch) => CYRILLIC_TO_LATIN[ch] ?? ch)
    .join("");

  return transliterated
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents left over from NFKD
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
