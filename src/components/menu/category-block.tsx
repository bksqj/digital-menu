"use client";

import { useState, type DragEvent } from "react";
import { createItemAction, deleteCategoryAction, renameCategoryAction } from "@/lib/actions/menu";
import { ItemRow, type ItemDTO } from "./item-row";
import { SubmitButton } from "@/components/ui/submit-button";

export type CategoryDTO = { id: string; name: string; items: ItemDTO[] };

const fieldClass =
  "rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]";

export function CategoryBlock({
  category,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
  onMoveItem,
}: {
  category: CategoryDTO;
  draggable?: boolean;
  onDragStart?: () => void;
  onDragOver?: (e: DragEvent<HTMLDivElement>) => void;
  onDrop?: () => void;
  onMoveItem: (fromId: string, toId: string) => void;
}) {
  const [dragItemId, setDragItemId] = useState<string | null>(null);
  const [addingItem, setAddingItem] = useState(false);

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4"
    >
      <div className="mb-3 flex items-center gap-3">
        <span className="cursor-grab text-[var(--color-line)]" aria-hidden>
          ⠿
        </span>
        <form action={renameCategoryAction} className="flex-1">
          <input type="hidden" name="categoryId" value={category.id} />
          <input
            type="text"
            name="name"
            defaultValue={category.name}
            onBlur={(e) => e.currentTarget.form?.requestSubmit()}
            className="w-full bg-transparent text-base font-semibold tracking-wide text-[var(--color-ink)] uppercase outline-none focus:underline"
          />
        </form>
        <form action={deleteCategoryAction}>
          <input type="hidden" name="categoryId" value={category.id} />
          <button
            type="submit"
            className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition hover:border-red-300 hover:bg-red-50"
          >
            Удалить
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-1">
        {category.items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            draggable
            onDragStart={() => setDragItemId(item.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragItemId) onMoveItem(dragItemId, item.id);
              setDragItemId(null);
            }}
          />
        ))}
        {category.items.length === 0 && (
          <p className="px-2 py-2 text-sm text-[var(--color-subtle)]">Пока нет позиций.</p>
        )}
      </div>

      {addingItem ? (
        <form
          action={async (formData) => {
            await createItemAction(formData);
            setAddingItem(false);
          }}
          className="mt-3 flex flex-col gap-2 rounded-lg bg-[var(--color-canvas)] p-3"
        >
          <input type="hidden" name="categoryId" value={category.id} />
          <input type="text" name="name" required placeholder="Название позиции" className={fieldClass} />
          <input
            type="text"
            name="description"
            placeholder="Описание (необязательно)"
            className={fieldClass}
          />
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="number"
              step="0.01"
              min="0"
              name="price"
              placeholder="Цена"
              className={`w-24 ${fieldClass}`}
            />
            <input
              type="text"
              name="currency"
              defaultValue="EUR"
              maxLength={3}
              className={`w-16 uppercase ${fieldClass}`}
            />
            <SubmitButton
              pendingLabel="Добавляем…"
              className="ml-auto rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-accent-strong)] hover:text-white"
            >
              Добавить
            </SubmitButton>
            <button
              type="button"
              onClick={() => setAddingItem(false)}
              className="rounded-full border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-ink)]"
            >
              Отмена
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setAddingItem(true)}
          className="mt-3 w-full rounded-lg border border-dashed border-[var(--color-line)] px-4 py-2 text-sm font-medium text-[var(--color-subtle)] transition hover:border-[var(--color-ink)] hover:text-[var(--color-ink)]"
        >
          + Добавить позицию
        </button>
      )}
    </div>
  );
}
