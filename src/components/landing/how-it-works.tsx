import { UploadIcon, SparkleIcon, LinkQrIcon } from "./icons";

const STEPS = [
  {
    n: "01",
    icon: UploadIcon,
    title: "Загрузите меню",
    body: "Фото, несколько фотографий или PDF — как удобнее.",
  },
  {
    n: "02",
    icon: SparkleIcon,
    title: "AI всё распознает",
    body: "Категории, блюда и цены автоматически превращаются в цифровое меню.",
  },
  {
    n: "03",
    icon: LinkQrIcon,
    title: "Получите ссылку и QR",
    body: "Готовая мобильная страница и QR-код для столов и витрины.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-16 px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold tracking-tight text-[var(--color-ink)] sm:text-4xl">
          Как это работает
        </h2>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div
              key={step.n}
              className="group flex flex-col gap-4 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)]"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)] transition-colors group-hover:bg-[var(--color-accent)] group-hover:text-[var(--color-ink)]">
                  <step.icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold text-[var(--color-line)]">{step.n}</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-ink)]">{step.title}</h3>
                <p className="mt-1.5 text-sm text-[var(--color-subtle)]">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
