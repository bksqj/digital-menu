import { SparkleIcon, PencilIcon, LinkQrIcon, PhoneIcon, BoltIcon, LinkIcon } from "@/components/ui/icons";

const FEATURES = [
  {
    icon: SparkleIcon,
    title: "AI распознавание",
    body: "Загрузите фото — AI создаст структуру меню.",
  },
  {
    icon: PencilIcon,
    title: "Простое редактирование",
    body: "Меняйте блюда, категории и цены.",
  },
  {
    icon: LinkQrIcon,
    title: "QR с вашим брендом",
    body: "Добавьте логотип прямо в QR-код.",
  },
  {
    icon: PhoneIcon,
    title: "Мобильная страница",
    body: "Отлично выглядит на любом телефоне.",
  },
  {
    icon: BoltIcon,
    title: "Мгновенные обновления",
    body: "Гости всегда видят актуальную версию.",
  },
  {
    icon: LinkIcon,
    title: "Собственная ссылка",
    body: "У каждого бизнеса свой красивый адрес меню.",
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-16 px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold tracking-tight text-[var(--color-ink)] sm:text-4xl">
          Всё, что нужно
          <br />
          для цифрового меню.
        </h2>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col gap-3.5 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 transition-all hover:-translate-y-0.5 hover:border-[var(--color-accent)]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-canvas)] text-[var(--color-ink)]">
                <feature.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold text-[var(--color-ink)]">{feature.title}</h3>
                <p className="mt-1 text-sm text-[var(--color-subtle)]">{feature.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
