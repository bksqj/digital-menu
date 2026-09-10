"use client";

import { useRef, useState, type DragEvent } from "react";
import { useFormStatus } from "react-dom";
import { uploadMenuFilesAction } from "@/lib/actions/upload";
import { ALLOWED_MENU_FILE_TYPES, MAX_MENU_FILES } from "@/lib/upload-constraints";

function formatSize(bytes: number) {
  return bytes > 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
    : `${Math.max(1, Math.round(bytes / 1024))} КБ`;
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="rounded-full bg-[var(--color-accent)] px-6 py-3 text-base font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-accent-strong)] hover:text-white disabled:opacity-50 disabled:hover:bg-[var(--color-accent)] disabled:hover:text-[var(--color-ink)]"
    >
      {pending ? "Распознаём ваше меню…" : "Загрузить и распознать"}
    </button>
  );
}

export function UploadMenuForm({ businessId }: { businessId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  function syncInput(next: File[]) {
    const dt = new DataTransfer();
    next.forEach((file) => dt.items.add(file));
    if (inputRef.current) inputRef.current.files = dt.files;
  }

  function addFiles(list: FileList | File[]) {
    const next = [...files, ...Array.from(list)].slice(0, MAX_MENU_FILES);
    setFiles(next);
    syncInput(next);
  }

  function removeFile(index: number) {
    const next = files.filter((_, i) => i !== index);
    setFiles(next);
    syncInput(next);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }

  return (
    <form action={uploadMenuFilesAction} className="flex flex-col gap-4">
      <input type="hidden" name="businessId" value={businessId} />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition ${
          isDragging
            ? "border-[var(--color-accent-strong)] bg-[var(--color-accent-soft)]"
            : "border-[var(--color-line)] bg-[var(--color-surface)] hover:border-[var(--color-ink)]/30"
        }`}
      >
        <p className="font-medium text-[var(--color-ink)]">Перетащите фото меню сюда</p>
        <p className="text-sm text-[var(--color-subtle)]">
          или нажмите, чтобы выбрать файлы — JPG, PNG, WEBP или PDF, до {MAX_MENU_FILES} шт.
        </p>
        <input
          ref={inputRef}
          type="file"
          name="files"
          multiple
          accept={ALLOWED_MENU_FILE_TYPES.join(",")}
          onChange={(e) => e.target.files && addFiles(e.target.files)}
          onClick={(e) => e.stopPropagation()}
          className="hidden"
        />
      </div>

      {files.length > 0 && (
        <ul className="flex flex-col gap-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm"
            >
              <span className="truncate text-[var(--color-ink)]">{file.name}</span>
              <span className="flex items-center gap-3 text-[var(--color-subtle)]">
                {formatSize(file.size)}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-red-600 underline"
                >
                  Убрать
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <SubmitButton disabled={files.length === 0} />
    </form>
  );
}
