"use client";

import { useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { href: "#how-it-works", label: "Как это работает" },
  { href: "#features", label: "Возможности" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-line)] bg-[var(--color-canvas)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-ink)]">
            <span className="h-2 w-2 rounded-[2px] bg-[var(--color-accent)]" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-[var(--color-ink)]">
            Digital Menu
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-[var(--color-subtle)] transition-colors hover:text-[var(--color-ink)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-5 md:flex">
          <Link
            href="/login"
            className="text-sm font-medium text-[var(--color-subtle)] transition-colors hover:text-[var(--color-ink)]"
          >
            Войти
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-accent-strong)] hover:text-white"
          >
            Создать меню →
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-ink)] md:hidden"
        >
          <span className="relative block h-3.5 w-4.5">
            <span
              className={`absolute left-0 top-0 h-[1.6px] w-4.5 bg-current transition-transform ${open ? "translate-y-[6.5px] rotate-45" : ""}`}
            />
            <span
              className={`absolute left-0 top-[6.5px] h-[1.6px] w-4.5 bg-current transition-opacity ${open ? "opacity-0" : ""}`}
            />
            <span
              className={`absolute left-0 top-[13px] h-[1.6px] w-4.5 bg-current transition-transform ${open ? "-translate-y-[6.5px] -rotate-45" : ""}`}
            />
          </span>
        </button>
      </div>

      {open && (
        <div className="border-t border-[var(--color-line)] bg-[var(--color-canvas)] px-5 pt-2 pb-5 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2.5 text-[15px] text-[var(--color-subtle)] hover:bg-black/[0.03] hover:text-[var(--color-ink)]"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2.5 border-t border-[var(--color-line)] pt-4">
            <Link
              href="/login"
              className="rounded-full border border-[var(--color-line)] px-4 py-2.5 text-center text-sm font-medium text-[var(--color-ink)]"
            >
              Войти
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-[var(--color-accent)] px-4 py-2.5 text-center text-sm font-semibold text-[var(--color-ink)]"
            >
              Создать меню →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
