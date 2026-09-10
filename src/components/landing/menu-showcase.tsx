import { PhoneMockup } from "./phone-mockup";

const POINTS = [
  {
    title: "Обновляйте меню в любое время",
    body: "Меняйте блюда и цены за секунды.",
  },
  {
    title: "Один QR — всегда актуальное меню",
    body: "После изменения меню QR-код остаётся прежним.",
  },
  {
    title: "Без приложений",
    body: "Гости просто сканируют QR и меню открывается в браузере.",
  },
];

export function MenuShowcase() {
  return (
    <section className="px-5 py-20 sm:py-28">
      <div className="mx-auto grid max-w-5xl items-center gap-14 md:grid-cols-2 md:gap-10">
        <div className="order-2 flex justify-center md:order-1">
          <PhoneMockup className="sm:w-[280px]" />
        </div>

        <div className="order-1 md:order-2">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-ink)] sm:text-4xl">
            Выглядит отлично
            <br />
            на любом телефоне.
          </h2>

          <ul className="mt-8 flex flex-col gap-6">
            {POINTS.map((point) => (
              <li key={point.title} className="flex gap-3.5">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-[10px] font-bold text-[var(--color-ink)]">
                  ✓
                </span>
                <div>
                  <p className="font-semibold text-[var(--color-ink)]">{point.title}</p>
                  <p className="mt-0.5 text-sm text-[var(--color-subtle)]">{point.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
