import Link from "next/link";

export function FinalCta() {
  return (
    <section className="px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-4xl rounded-3xl bg-[var(--color-ink)] px-6 py-16 text-center sm:px-14 sm:py-20">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
          Ваше меню уже готово
          <br />
          стать цифровым.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base text-white/60 sm:text-lg">
          Загрузите первое фото и посмотрите, как AI превратит его в удобное меню.
        </p>
        <Link
          href="/register"
          className="mt-8 inline-block rounded-full bg-[var(--color-accent)] px-7 py-3.5 text-base font-semibold text-[var(--color-ink)] transition hover:bg-white"
        >
          Создать цифровое меню →
        </Link>
      </div>
    </section>
  );
}
