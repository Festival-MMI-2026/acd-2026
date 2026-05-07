import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";

let cachedLogoPng: Buffer | null = null;

async function getLogoPngBuffer(): Promise<Buffer | null> {
  if (cachedLogoPng) return cachedLogoPng;
  const candidates = [
    resolve(process.cwd(), ".output/public/logo.svg"),
    resolve(process.cwd(), "public/logo.svg"),
  ];
  for (const path of candidates) {
    try {
      const svg = await readFile(path);
      cachedLogoPng = await sharp(svg, { density: 300 })
        .resize({ width: 360, withoutEnlargement: false })
        .png()
        .toBuffer();
      return cachedLogoPng;
    } catch {
      // try next
    }
  }
  return null;
}

async function fetchQrBuffer(data: string): Promise<Buffer | null> {
  try {
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(data)}&bgcolor=ffffff&color=111827&margin=8&format=png`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

export const LOGO_CID = "acd-logo";
export const QR_CID = "acd-qr";

export async function buildLogoAttachment() {
  const logo = await getLogoPngBuffer();
  if (!logo) return null;
  return {
    filename: "logo.png",
    content: logo,
    contentType: "image/png",
    cid: LOGO_CID,
    contentDisposition: "inline" as const,
  };
}

export async function buildQrAttachment(data: string) {
  const qr = await fetchQrBuffer(data);
  if (!qr) return null;
  return {
    filename: "qrcode.png",
    content: qr,
    contentType: "image/png",
    cid: QR_CID,
    contentDisposition: "inline" as const,
  };
}
