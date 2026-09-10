"use client";

import { useState, useTransition, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createCategoryAction,
  reorderCategoriesAction,
  reorderItemsAction,
  setMenuStatusAction,
} from "@/lib/actions/menu";
import { CategoryBlock, type CategoryDTO } from "./category-block";

export function MenuEditor({
  businessId,
  menuId,
  menuStatus,
  categories: initialCategories,
}: {
  businessId: string;
  menuId: string;
  menuStatus: "DRAFT" | "PUBLISHED";
  categories: CategoryDTO[];
}) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [dragCategoryId, setDragCategoryId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Re-sync when the server sends fresh props (after router.refresh() below)
  // — a render-time reset instead of an effect, per React's guidance on
  // adjusting state from props without an extra render pass.
  const [prevInitialCategories, setPrevInitialCategories] = useState(initialCategories);
  if (initialCategories !== prevInitialCategories) {
    setPrevInitialCategories(initialCategories);
    setCategories(initialCategories);
  }

  function moveCategory(fromId: string, toId: string) {
    if (fromId === toId) return;
    const next = [...categories];
    const fromIndex = next.findIndex((c) => c.id === fromId);
    const toIndex = next.findIndex((c) => c.id === toId);
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setCategories(next);
    startTransition(async () => {
      await reorderCategoriesAction(businessId, next.map((c) => c.id));
      router.refresh();
    });
  }

  function moveItem(categoryId: string, fromId: string, toId: string) {
    if (fromId === toId) return;
    let reorderedIds: string[] = [];
    const next = categories.map((category) => {
      if (category.id !== categoryId) return category;
      const items = [...category.items];
      const fromIndex = items.findIndex((i) => i.id === fromId);
      const toIndex = items.findIndex((i) => i.id === toId);
      const [moved] = items.splice(fromIndex, 1);
      items.splice(toIndex, 0, moved);
      reorderedIds = items.map((i) => i.id);
      return { ...category, items };
    });
    setCategories(next);
    startTransition(async () => {
      await reorderItemsAction(businessId, reorderedIds);
      router.refresh();
    });
  }

  function togglePublish() {
    const next = menuStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    startTransition(async () => {
      await setMenuStatusAction(menuId, next);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between rounded-lg border border-neutral-200 px-4 py-3">
        <span className="text-sm text-neutral-600">
          Статус: <strong>{menuStatus === "PUBLISHED" ? "Опубликовано" : "Черновик"}</strong>
        </span>
        <button
          type="button"
          onClick={togglePublish}
          disabled={isPending}
          className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
        >
          {menuStatus === "PUBLISHED" ? "Снять с публикации" : "Опубликовать"}
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {categories.map((category) => (
          <CategoryBlock
            key={category.id}
            category={category}
            draggable
            onDragStart={() => setDragCategoryId(category.id)}
            onDragOver={(e: DragEvent<HTMLDivElement>) => e.preventDefault()}
            onDrop={() => {
              if (dragCategoryId) moveCategory(dragCategoryId, category.id);
              setDragCategoryId(null);
            }}
            onMoveItem={(fromId, toId) => moveItem(category.id, fromId, toId)}
          />
        ))}
        {categories.length === 0 && (
          <p className="rounded-lg border border-dashed border-neutral-300 px-4 py-6 text-center text-sm text-neutral-500">
            Пока нет категорий — добавьте первую ниже.
          </p>
        )}
      </div>

      <form
        action={createCategoryAction}
        className="flex items-center gap-3 border-t border-neutral-200 pt-6"
      >
        <input type="hidden" name="menuId" value={menuId} />
        <input
          type="text"
          name="name"
          required
          placeholder="Название категории, например «Пицца»"
          className="flex-1 rounded-lg border border-neutral-300 px-3.5 py-2.5 text-base outline-none focus:border-neutral-900"
        />
        <button
          type="submit"
          className="whitespace-nowrap rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium transition hover:border-neutral-900"
        >
          + Категория
        </button>
      </form>
    </div>
  );
}
