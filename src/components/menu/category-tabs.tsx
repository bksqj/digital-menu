"use client";

import { useState } from "react";

export type PublicMenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  currency: string;
  imageUrl: string | null;
};
export type PublicMenuCategory = { id: string; name: string; items: PublicMenuItem[] };

export function MenuCategoryTabs({ categories }: { categories: PublicMenuCategory[] }) {
  const [activeId, setActiveId] = useState(categories[0]?.id);
  const active = categories.find((c) => c.id === activeId) ?? categories[0];

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-5 mb-6 flex gap-2 overflow-x-auto bg-[var(--color-canvas)] px-5 py-2">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setActiveId(category.id)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition ${
              category.id === active.id
                ? "bg-[var(--color-accent)] text-[var(--color-ink)]"
                : "text-[var(--color-subtle)] hover:text-[var(--color-ink)]"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-widest text-[var(--color-subtle)] uppercase">
          <span className="h-2.5 w-1 rounded-full bg-[var(--color-accent)]" />
          {active.name}
        </h2>
        <ul className="flex flex-col divide-y divide-[var(--color-line)]">
          {active.items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-4 py-3 first:pt-0">
              <div className="flex items-start gap-3">
                {item.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element -- OCR-extracted crop, not worth next/image config for an MVP
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-lg border border-[var(--color-line)] object-cover"
                  />
                )}
                <div>
                  <p className="font-medium text-[var(--color-ink)]">{item.name}</p>
                  {item.description && (
                    <p className="mt-0.5 text-sm text-[var(--color-subtle)]">{item.description}</p>
                  )}
                </div>
              </div>
              {item.price !== null && (
                <p className="shrink-0 font-semibold whitespace-nowrap text-[var(--color-ink)]">
                  {item.price} {item.currency}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
