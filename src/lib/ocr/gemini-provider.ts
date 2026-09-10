import { getStorageAdapter } from "@/lib/storage";
import { menuParseResultSchema, type MenuParseResult } from "@/lib/validation/menu";
import type { OcrInputFile, OcrProvider } from "./types";

const MODEL = "gemini-3.6-flash";

const PROMPT = `Ты распознаёшь меню ресторана/кафе по фото или PDF для цифрового каталога.

Извлеки все категории и позиции меню, которые видишь на изображениях. Для каждой категории укажи название (например "Пицца", "Напитки"). Для каждой позиции укажи:
- name — название блюда/товара
- description — состав/описание, если есть на фото (иначе null)
- price — цена числом без валюты (иначе null)
- currency — ТОЛЬКО трёхбуквенный ISO 4217 код латиницей (RUB, EUR, USD, ...), никогда не текстом на языке оригинала ("руб", "€" и т.п.); если не можешь определить — null
- confidence — число от 0 до 1: насколько ты уверен в правильности распознавания ИМЕННО ЭТОЙ позиции (низкое значение — если текст нечёткий, обрезан, неразборчив от руки и т.п.)

Если часть фото нечитаема или ты не уверен в целой секции — всё равно включи то, что смог разобрать, с низким confidence, и опиши проблему в warnings.
Не выдумывай позиции, которых нет на фото. Если меню вообще не распознаётся — верни пустой список categories и объясни это в warnings.`;

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    categories: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          items: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                name: { type: "STRING" },
                description: { type: "STRING", nullable: true },
                price: { type: "NUMBER", nullable: true },
                currency: { type: "STRING", nullable: true, pattern: "^[A-Z]{3}$" },
                confidence: { type: "NUMBER" },
              },
              required: ["name", "confidence"],
            },
          },
        },
        required: ["name", "items"],
      },
    },
    warnings: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: ["categories"],
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 503 here means "model temporarily overloaded", not "this request is bad" —
// observed in practice (Google's own message says spikes are usually
// temporary), so a couple of short retries clears most of them without
// making the owner re-click upload themselves.
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

/**
 * Real OCR/AI backend: Gemini vision reads the uploaded menu photos/PDFs
 * directly (no separate OCR step) and returns structured JSON matching
 * menuParseResultSchema. Swapped in via lib/ocr/index.ts behind GOOGLE_API_KEY
 * — MockOcrProvider stays available for local dev without a key.
 */
export class GeminiOcrProvider implements OcrProvider {
  async parseMenu(files: OcrInputFile[]): Promise<MenuParseResult> {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_API_KEY is not set");

    const storage = getStorageAdapter();
    const imageParts = await Promise.all(
      files.map(async (file) => {
        const bytes = await storage.get(file.key);
        return { inlineData: { mimeType: file.mimeType, data: bytes.toString("base64") } };
      }),
    );

    let lastError: Error = new Error("Gemini request never ran");
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 0) await sleep(RETRY_DELAY_MS);

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: PROMPT }, ...imageParts] }],
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: RESPONSE_SCHEMA,
            },
          }),
        },
      );

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("Gemini returned no content");
        return menuParseResultSchema.parse(JSON.parse(text));
      }

      lastError = new Error(`Gemini API error ${res.status}: ${(await res.text()).slice(0, 500)}`);
      if (res.status !== 503) throw lastError;
    }

    throw lastError;
  }
}
