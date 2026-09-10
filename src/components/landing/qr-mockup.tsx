// Decorative QR-code pattern — not a real scannable code, just three finder
// corners plus noise so it reads as "QR code" at a glance. Hand-picked
// pattern, rendered as a CSS grid (no image asset, no library).
const PATTERN = [
  "11111011111",
  "10001010001",
  "10101010101",
  "10001010001",
  "11111011111",
  "01010110010",
  "11111011010",
  "10001001101",
  "10101010110",
  "10001001011",
  "11111011001",
];

export function QrMockup({ className }: { className?: string }) {
  return (
    <div
      className={`grid aspect-square w-16 shrink-0 grid-cols-11 gap-[1px] rounded-lg bg-[var(--color-surface)] p-1.5 ${className ?? ""}`}
    >
      {PATTERN.flatMap((row, y) =>
        row.split("").map((cell, x) => (
          <span
            key={`${y}-${x}`}
            className={cell === "1" ? "bg-[var(--color-ink)]" : "bg-transparent"}
          />
        )),
      )}
    </div>
  );
}
