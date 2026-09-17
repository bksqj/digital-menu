# Digital Menu

SaaS для ресторанов и кафе: фото меню → цифровая страница + QR-код.

Владелец заведения загружает фотографию (или PDF) обычного бумажного
меню — Gemini Vision сам распознаёт категории, блюда, цены и даже
вырезает фото блюд. На выходе — готовая мобильная страница меню и
QR-код, который можно распечатать и поставить на стол.

## Стек

- Next.js 16 (App Router, Server Actions)
- PostgreSQL (Neon) + Prisma
- Auth.js (email/пароль, сессии на JWT)
- Google Gemini Vision — распознавание меню
- Netlify Blobs — хранение загруженных файлов
- Resend — транзакционные письма

## Разработка

```bash
cp .env.example .env   # и заполнить переменные
npm install
npx prisma migrate dev
npm run dev
```

Подробности по переменным окружения — в `.env.example`.

## Лицензия

Проприетарный код, см. [LICENSE](./LICENSE).
