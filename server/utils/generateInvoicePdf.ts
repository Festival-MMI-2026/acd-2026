import { generateInvoiceHtml } from "./invoiceTemplate";

export async function generateInvoicePdf(data: any): Promise<Buffer> {
  const htmlContent = generateInvoiceHtml(data);

  const formData = new FormData();
  formData.append(
    "files",
    new Blob([htmlContent], { type: "text/html" }),
    "index.html",
  );
  formData.append("paperWidth", "8.27"); // A4 (210mm)
  formData.append("paperHeight", "11.69"); // A4 (297mm)
  // Marges à 0 : le gabarit gère ses propres marges via .invoice-box,
  // et la barre d'accent doit atteindre le bord du document.
  formData.append("marginTop", "0");
  formData.append("marginBottom", "0");
  formData.append("marginLeft", "0");
  formData.append("marginRight", "0");

  const gotenbergUrl = process.env.GOTENBERG_URL || "http://localhost:3001";

  const response = await fetch(
    `${gotenbergUrl}/forms/chromium/convert/html`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error(
      `Erreur Gotenberg (${response.status}): ${await response.text()}`,
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
