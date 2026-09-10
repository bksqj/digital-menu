"use client";

import { useState, type DragEvent } from "react";
import { createItemAction, deleteCategoryAction, renameCategoryAction } from "@/lib/actions/menu";
import { ItemRow, type ItemDTO } from "./item-row";

export type CategoryDTO = { id: string; name: string; items: ItemDTO[] };

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
      className="rounded-xl border border-neutral-200 p-4"
    >
      <div className="mb-3 flex items-center gap-3">
        <span className="cursor-grab text-neutral-300" aria-hidden>
          ⠿
        </span>
        <form action={renameCategoryAction} className="flex-1">
          <input type="hidden" name="categoryId" value={category.id} />
          <input
            type="text"
            name="name"
            defaultValue={category.name}
            onBlur={(e) => e.currentTarget.form?.requestSubmit()}
            className="w-full bg-transparent text-base font-semibold tracking-wide uppercase outline-none focus:underline"
          />
        </form>
        <form action={deleteCategoryAction}>
          <input type="hidden" name="categoryId" value={category.id} />
          <button type="submit" className="text-xs text-red-600 underline">
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
          <p className="px-2 py-2 text-sm text-neutral-400">Пока нет позиций.</p>
        )}
      </div>

      {addingItem ? (
        <form
          action={async (formData) => {
            await createItemAction(formData);
            setAddingItem(false);
          }}
          className="mt-3 flex flex-col gap-2 rounded-lg bg-neutral-50 p-3"
        >
          <input type="hidden" name="categoryId" value={category.id} />
          <input
            type="text"
            name="name"
            required
            placeholder="Название позиции"
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
          />
          <input
            type="text"
            name="description"
            placeholder="Описание (необязательно)"
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
          />
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="number"
              step="0.01"
              min="0"
              name="price"
              placeholder="Цена"
              className="w-24 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
            />
            <input
              type="text"
              name="currency"
              defaultValue="EUR"
              maxLength={3}
              className="w-16 rounded-lg border border-neutral-300 px-3 py-2 text-sm uppercase outline-none focus:border-neutral-900"
            />
            <button
              type="submit"
              className="ml-auto rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
            >
              Добавить
            </button>
            <button
              type="button"
              onClick={() => setAddingItem(false)}
              className="rounded-full border border-neutral-300 px-4 py-2 text-sm"
            >
              Отмена
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setAddingItem(true)}
          className="mt-3 text-sm text-neutral-500 underline"
        >
          + Добавить позицию
        </button>
      )}
    </div>
  );
}
