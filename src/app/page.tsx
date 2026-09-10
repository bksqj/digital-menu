import Link from "next/link";

const STEPS = [
  { n: "1", title: "Загрузите меню", body: "Фото, несколько фото или PDF — как удобнее." },
  { n: "2", title: "Проверьте позиции", body: "Мы распознаём блюда и цены, вы поправляете, если что-то не так." },
  { n: "3", title: "Получите ссылку и QR", body: "Готовая мобильная страница и QR-код для столов и витрины." },
];

export default function LandingPage() {
  return (
    <main className="flex-1">
      <section className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 pt-24 pb-16 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Превратите своё меню в удобное цифровое меню за несколько минут
        </h1>
        <p className="max-w-lg text-lg text-neutral-600">
          Загрузите фото меню — мы превратим его в мобильную страницу и создадим
          QR-код для ваших гостей.
        </p>
        <Link
          href="/register"
          className="rounded-full bg-neutral-900 px-8 py-3.5 text-base font-medium text-white transition hover:bg-neutral-700"
        >
          Создать меню
        </Link>
      </section>

      <section className="mx-auto grid max-w-4xl gap-8 px-6 pb-24 sm:grid-cols-3">
        {STEPS.map((step) => (
          <div key={step.n} className="flex flex-col gap-2">
            <span className="text-sm font-medium text-neutral-400">{step.n}</span>
            <h3 className="text-base font-semibold">{step.title}</h3>
            <p className="text-sm text-neutral-600">{step.body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
