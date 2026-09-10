const MENU = [
  {
    category: "PIZZA",
    items: [
      { name: "Margherita", desc: "Tomato, mozzarella, basil", price: "€10.50" },
      { name: "Pepperoni", desc: "Tomato, mozzarella, pepperoni", price: "€12.50" },
    ],
  },
  {
    category: "PASTA",
    items: [{ name: "Carbonara", desc: "Egg, parmesan, guanciale", price: "€13.00" }],
  },
];

export function PhoneMockup({ className }: { className?: string }) {
  return (
    <div
      className={`w-[220px] shrink-0 rounded-[2.2rem] border-[6px] border-[var(--color-ink)] bg-[var(--color-ink)] shadow-xl sm:w-[250px] ${className ?? ""}`}
    >
      <div className="relative overflow-hidden rounded-[1.7rem] bg-[var(--color-surface)]">
        <div className="absolute top-0 left-1/2 z-10 h-4 w-20 -translate-x-1/2 rounded-b-xl bg-[var(--color-ink)]" />

        <div className="flex flex-col items-center gap-1.5 px-4 pt-7 pb-3 text-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-xs font-bold text-[var(--color-accent-strong)]">
            B
          </div>
          <p className="text-[11px] font-bold tracking-tight text-[var(--color-ink)]">
            BELLA ROMA
          </p>
          <p className="text-[8px] text-[var(--color-subtle)]">Italian Restaurant</p>
        </div>

        <div className="flex flex-col gap-3 px-4 pb-6">
          {MENU.map((section) => (
            <div key={section.category}>
              <p className="mb-1 text-[8px] font-semibold tracking-widest text-[var(--color-subtle)]">
                {section.category}
              </p>
              <div className="flex flex-col gap-1.5">
                {section.items.map((item) => (
                  <div key={item.name} className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[10px] font-semibold text-[var(--color-ink)]">
                        {item.name}
                      </p>
                      <p className="truncate text-[7.5px] text-[var(--color-subtle)]">{item.desc}</p>
                    </div>
                    <p className="shrink-0 text-[9px] font-semibold text-[var(--color-ink)]">
                      {item.price}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
