import { getPlatformSettings } from "@/lib/admin/settings";
import { updatePlatformSettingsAction } from "@/lib/actions/admin";
import {
  ALLOWED_MENU_FILE_TYPES,
  MAX_MENU_FILES,
  MAX_MENU_FILE_SIZE_BYTES,
  MAX_UPLOADS_PER_HOUR,
} from "@/lib/upload-constraints";
import { ALLOWED_LOGO_FILE_TYPES, MAX_LOGO_FILE_SIZE_BYTES } from "@/lib/upload-constraints";

export default async function AdminSettingsPage() {
  const settings = await getPlatformSettings();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--admin-ink)]">Настройки</h1>
        <p className="mt-1 text-sm text-[var(--admin-muted)]">Параметры платформы Digital Menu.</p>
      </div>

      <form action={updatePlatformSettingsAction} className="flex flex-col gap-4">
        <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4 sm:p-5">
          <h2 className="mb-3 text-sm font-semibold text-[var(--admin-ink)]">Общее</h2>
          <div className="flex flex-col gap-3 sm:max-w-md">
            <label className="flex flex-col gap-1.5 text-sm text-[var(--admin-ink)]">
              Название платформы
              <input
                type="text"
                name="platformName"
                defaultValue={settings.platformName}
                className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--admin-ink)]"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-[var(--admin-ink)]">
              Email поддержки
              <input
                type="email"
                name="supportEmail"
                defaultValue={settings.supportEmail ?? ""}
                placeholder="support@digital-menu.app"
                className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--admin-ink)]"
              />
            </label>
            <p className="text-xs text-[var(--admin-muted)]">
              Сохраняются, но пока нигде в приложении не используются — не выводятся ни в письмах, ни на страницах.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4 sm:p-5">
          <h2 className="mb-3 text-sm font-semibold text-[var(--admin-ink)]">Лимиты (текущие, не редактируются)</h2>
          <dl className="grid grid-cols-1 gap-x-10 gap-y-2 text-sm sm:grid-cols-2">
            <div className="flex justify-between border-b border-[var(--admin-border)] py-1.5">
              <dt className="text-[var(--admin-muted)]">Макс. размер файла меню</dt>
              <dd className="text-[var(--admin-ink)]">{Math.round(MAX_MENU_FILE_SIZE_BYTES / 1024 / 1024)} МБ</dd>
            </div>
            <div className="flex justify-between border-b border-[var(--admin-border)] py-1.5">
              <dt className="text-[var(--admin-muted)]">Макс. файлов за раз</dt>
              <dd className="text-[var(--admin-ink)]">{MAX_MENU_FILES}</dd>
            </div>
            <div className="flex justify-between border-b border-[var(--admin-border)] py-1.5">
              <dt className="text-[var(--admin-muted)]">Макс. размер логотипа</dt>
              <dd className="text-[var(--admin-ink)]">{Math.round(MAX_LOGO_FILE_SIZE_BYTES / 1024 / 1024)} МБ</dd>
            </div>
            <div className="flex justify-between border-b border-[var(--admin-border)] py-1.5">
              <dt className="text-[var(--admin-muted)]">Лимит загрузок AI / час</dt>
              <dd className="text-[var(--admin-ink)]">{MAX_UPLOADS_PER_HOUR}</dd>
            </div>
            <div className="flex justify-between border-b border-[var(--admin-border)] py-1.5 sm:col-span-2">
              <dt className="text-[var(--admin-muted)]">Форматы меню / логотипа</dt>
              <dd className="text-[var(--admin-ink)]">
                {ALLOWED_MENU_FILE_TYPES.map((t) => t.split("/")[1]).join(", ")} /{" "}
                {ALLOWED_LOGO_FILE_TYPES.map((t) => t.split("/")[1]).join(", ")}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-[var(--admin-muted)]">
            Заданы в коде (upload-constraints.ts) — изменение потребует деплоя, не вынесено в БД сознательно, чтобы
            не трогать уже проверенный путь валидации загрузок.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4 sm:p-5">
          <h2 className="mb-3 text-sm font-semibold text-[var(--admin-ink)]">Функции</h2>
          <div className="flex flex-col gap-3">
            <label className="flex items-center justify-between gap-3">
              <span>
                <span className="block text-sm font-medium text-[var(--admin-ink)]">Регистрация новых пользователей</span>
                <span className="block text-xs text-[var(--admin-muted)]">
                  Выключение сразу блокирует форму регистрации.
                </span>
              </span>
              <input
                type="checkbox"
                name="registrationEnabled"
                defaultChecked={settings.registrationEnabled}
                className="h-5 w-5 accent-[var(--admin-accent)]"
              />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span>
                <span className="block text-sm font-medium text-[var(--admin-ink)]">Распознавание меню через AI</span>
                <span className="block text-xs text-[var(--admin-muted)]">
                  Выключение блокирует загрузку фото меню (ручное добавление позиций остаётся доступно).
                </span>
              </span>
              <input
                type="checkbox"
                name="aiEnabled"
                defaultChecked={settings.aiEnabled}
                className="h-5 w-5 accent-[var(--admin-accent)]"
              />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span>
                <span className="block text-sm font-medium text-[var(--admin-ink)]">Сбор аналитики</span>
                <span className="block text-xs text-[var(--admin-muted)]">
                  Выключение останавливает запись просмотров и сканирований QR на публичных страницах.
                </span>
              </span>
              <input
                type="checkbox"
                name="analyticsEnabled"
                defaultChecked={settings.analyticsEnabled}
                className="h-5 w-5 accent-[var(--admin-accent)]"
              />
            </label>
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="rounded-lg bg-[var(--admin-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--admin-dark)] transition hover:brightness-95"
          >
            Сохранить настройки
          </button>
        </div>
      </form>
    </div>
  );
}
