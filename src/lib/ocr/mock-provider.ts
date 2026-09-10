import type { MenuParseResult } from "@/lib/validation/menu";
import type { OcrInputFile, OcrProvider } from "./types";

/**
 * Deterministic stand-in for a real vision/OCR call. Lets us build and test
 * the upload → review → publish flow end to end without an AI provider key.
 * Swap for a real implementation (see lib/ocr/index.ts) once one is wired up.
 */
export class MockOcrProvider implements OcrProvider {
  async parseMenu(_files: OcrInputFile[]): Promise<MenuParseResult> {
    return {
      categories: [
        {
          name: "Pizza",
          items: [
            {
              name: "Margherita",
              description: "Tomato, mozzarella, basil",
              price: 10.5,
              currency: "EUR",
              confidence: 0.96,
            },
            {
              name: "Pepperoni",
              description: "Tomato, mozzarella, pepperoni",
              price: 12.5,
              currency: "EUR",
              confidence: 0.94,
            },
          ],
        },
        {
          name: "Pasta",
          items: [
            {
              name: "Carbonara",
              description: "Egg, parmesan, guanciale",
              price: 13.0,
              currency: "EUR",
              confidence: 0.6, // deliberately low — exercises the review-flag path
            },
          ],
        },
      ],
      warnings: [
        "Часть меню на фото была нечитаема — сумма по секции «Паста» требует проверки.",
      ],
    };
  }
}
