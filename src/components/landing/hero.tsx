import Link from "next/link";

export function Hero() {
  return (
    <section className="mx-auto flex max-w-4xl flex-col items-center px-5 pt-16 pb-4 text-center sm:pt-24 sm:pb-6">
      <span
        className="animate-landing-fade-up inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--color-subtle)]"
        style={{ animationDelay: "0ms" }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
        AI DIGITAL MENU
      </span>

      <h1
        className="animate-landing-fade-up mt-5 text-4xl leading-[1.1] font-bold tracking-tight text-[var(--color-ink)] sm:text-6xl lg:text-[68px]"
        style={{ animationDelay: "80ms" }}
      >
        Ваше меню.
        <br />
        <mark className="box-decoration-clone rounded-lg bg-[var(--color-accent)] px-2 text-[var(--color-ink)]">
          Теперь в телефоне.
        </mark>
      </h1>

      <p
        className="animate-landing-fade-up mt-5 max-w-xl text-base text-[var(--color-subtle)] sm:text-lg"
        style={{ animationDelay: "160ms" }}
      >
        Загрузите фотографию меню. AI распознает блюда и цены, создаст красивую
        мобильную страницу и QR-код для ваших гостей.
      </p>

      <div
        className="animate-landing-fade-up mt-8 flex flex-col items-center gap-3"
        style={{ animationDelay: "240ms" }}
      >
        <Link
          href="/register"
          className="rounded-full bg-[var(--color-ink)] px-7 py-3.5 text-base font-semibold text-white transition hover:bg-black"
        >
          Создать меню бесплатно →
        </Link>
        <p className="text-xs text-[var(--color-subtle)]">Без карты · Готово за несколько минут</p>
      </div>
    </section>
  );
}
