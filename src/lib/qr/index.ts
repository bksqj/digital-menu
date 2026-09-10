import QRCode from "qrcode";
import sharp from "sharp";

export interface GenerateQrOptions {
  /** Absolute URL the QR code should resolve to, e.g. https://domain.com/m/bella-roma */
  url: string;
  /** Raw logo bytes (PNG/JPG). Omitted → falls back to a plain badge. */
  logo?: Buffer;
}

export interface GeneratedQr {
  png: Buffer;
  svg: string;
}

const QR_SIZE = 1024;
// Logo must stay small enough relative to the code that error correction
// level H (30% recoverable) can still reconstruct the covered modules.
const LOGO_RATIO = 0.22;

/**
 * Renders a scannable QR code with a logo (or business-initial fallback)
 * composited in the center. Always uses error-correction level H — required
 * whenever the center is obscured — and leaves the standard quiet zone.
 */
export async function generateQr({ url, logo }: GenerateQrOptions): Promise<GeneratedQr> {
  const pngBase = await QRCode.toBuffer(url, {
    type: "png",
    errorCorrectionLevel: "H",
    width: QR_SIZE,
    margin: 4, // quiet zone, in modules
  });

  const svg = await QRCode.toString(url, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 4,
  });

  const logoBuffer = logo ?? (await renderPlainBadge());
  const logoSize = Math.round(QR_SIZE * LOGO_RATIO);

  const resizedLogo = await sharp(logoBuffer)
    .resize(logoSize, logoSize, { fit: "contain", background: "#ffffff" })
    .extend({
      top: 16,
      bottom: 16,
      left: 16,
      right: 16,
      background: "#ffffff",
    })
    .png()
    .toBuffer();

  const png = await sharp(pngBase)
    .composite([{ input: resizedLogo, gravity: "center" }])
    .png()
    .toBuffer();

  return { png, svg };
}

/**
 * Plain dark circle — used when there's no logo yet. Deliberately no text:
 * serverless runtimes (Netlify Functions included) generally ship with no
 * system fonts, so sharp/librsvg silently renders SVG <text> as empty boxes
 * there even though it looks fine locally. A shape needs no font at all.
 */
async function renderPlainBadge(): Promise<Buffer> {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
      <rect width="200" height="200" fill="#ffffff"/>
      <circle cx="100" cy="100" r="90" fill="#111111"/>
    </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}
