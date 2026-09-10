"use client";

import { useState, useTransition, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { deleteItemAction, toggleItemAvailableAction, updateItemAction } from "@/lib/actions/menu";

export type ItemDTO = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  currency: string;
  available: boolean;
  needsReview: boolean;
};

const fieldClass =
  "rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]";

export function ItemRow({
  item,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  item: ItemDTO;
  draggable?: boolean;
  onDragStart?: () => void;
  onDragOver?: (e: DragEvent<HTMLDivElement>) => void;
  onDrop?: () => void;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  function toggleAvailable() {
    startTransition(async () => {
      await toggleItemAvailableAction(item.id, !item.available);
      router.refresh();
    });
  }

  if (editing) {
    return (
      <form
        action={async (formData) => {
          await updateItemAction(formData);
          setEditing(false);
        }}
        className="flex flex-col gap-2 rounded-lg bg-[var(--color-canvas)] p-3"
      >
        <input type="hidden" name="itemId" value={item.id} />
        <input type="text" name="name" defaultValue={item.name} required className={fieldClass} />
        <input
          type="text"
          name="description"
          defaultValue={item.description ?? ""}
          placeholder="Описание"
          className={fieldClass}
        />
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="number"
            step="0.01"
            min="0"
            name="price"
            defaultValue={item.price ?? ""}
            placeholder="Цена"
            className={`w-24 ${fieldClass}`}
          />
          <input
            type="text"
            name="currency"
            defaultValue={item.currency}
            maxLength={3}
            className={`w-16 uppercase ${fieldClass}`}
          />
          <label className="flex items-center gap-1.5 text-sm text-[var(--color-subtle)]">
            <input type="checkbox" name="available" defaultChecked={item.available} /> в наличии
          </label>
          <button
            type="submit"
            className="ml-auto rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-accent-strong)] hover:text-white"
          >
            Сохранить
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-full border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-ink)]"
          >
            Отмена
          </button>
        </div>
      </form>
    );
  }

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg border border-transparent px-2 py-2 hover:border-[var(--color-line)] ${
        !item.available ? "opacity-50" : ""
      }`}
    >
      <span className="cursor-grab text-[var(--color-line)]" aria-hidden>
        ⠿
      </span>
      <div className="min-w-[140px] flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[var(--color-ink)]">{item.name}</span>
          {item.needsReview && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
              проверить
            </span>
          )}
        </div>
        {item.description && <p className="text-sm text-[var(--color-subtle)]">{item.description}</p>}
      </div>
      {/* Wraps to its own line as a unit on narrow screens instead of each
          button clipping individually against the viewport edge. */}
      <div className="ml-auto flex flex-wrap items-center gap-x-3 gap-y-1.5">
        {item.price !== null && (
          <span className="text-sm font-medium text-[var(--color-ink)] whitespace-nowrap">
            {item.price} {item.currency}
          </span>
        )}
        <button
          type="button"
          onClick={toggleAvailable}
          disabled={isPending}
          className="text-xs text-[var(--color-subtle)] underline hover:text-[var(--color-ink)] disabled:opacity-50"
        >
          {item.available ? "Скрыть" : "Показать"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-xs text-[var(--color-subtle)] underline hover:text-[var(--color-ink)]"
        >
          Изменить
        </button>
        <form action={deleteItemAction}>
          <input type="hidden" name="itemId" value={item.id} />
          <button type="submit" className="text-xs text-red-600 underline">
            Удалить
          </button>
        </form>
      </div>
    </div>
  );
}
