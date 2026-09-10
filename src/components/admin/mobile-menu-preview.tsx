import { EmptyState } from "./empty-state";
import { DocumentListIcon } from "@/components/ui/icons";

export type PreviewItem = { id: string; name: string; description: string | null; price: number | null; currency: string };
export type PreviewCategory = { id: string; name: string; items: PreviewItem[] };

export function MobileMenuPreview({
  businessName,
  logoUrl,
  categories,
}: {
  businessName: string;
  logoUrl: string | null;
  categories: PreviewCategory[];
}) {
  const categoriesWithItems = categories.filter((c) => c.items.length > 0);

  return (
    <div className="mx-auto w-full max-w-[300px] overflow-hidden rounded-[28px] border-4 border-[var(--admin-dark)] bg-[#fafaf7]">
      <div className="max-h-[520px] overflow-y-auto px-4 py-6">
        <div className="mb-5 flex flex-col items-center gap-2 text-center">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- preview of a real uploaded logo
            <img src={logoUrl} alt="" className="h-14 w-14 rounded-full object-cover" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ecfccb] text-lg font-semibold text-[#4d7c0f]">
              {businessName.charAt(0).toUpperCase()}
            </div>
          )}
          <p className="text-base font-bold text-[#0a0a0a]">{businessName}</p>
        </div>

        {categoriesWithItems.length === 0 ? (
          <EmptyState icon={DocumentListIcon} title="Меню пока пустое" />
        ) : (
          <div className="flex flex-col gap-5">
            {categoriesWithItems.map((category) => (
              <section key={category.id}>
                <h3 className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold tracking-widest text-[#6b6b62] uppercase">
                  <span className="h-2 w-0.5 rounded-full bg-[#a3e635]" />
                  {category.name}
                </h3>
                <ul className="flex flex-col divide-y divide-[#eae9e2]">
                  {category.items.map((item) => (
                    <li key={item.id} className="flex items-start justify-between gap-2 py-2 first:pt-0">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-[#0a0a0a]">{item.name}</p>
                        {item.description && (
                          <p className="truncate text-[10px] text-[#6b6b62]">{item.description}</p>
                        )}
                      </div>
                      {item.price !== null && (
                        <p className="shrink-0 text-xs font-semibold whitespace-nowrap text-[#0a0a0a]">
                          {item.price} {item.currency}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
