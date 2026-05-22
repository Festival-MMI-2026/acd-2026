import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { computeVat } from "../../shared/utils/vat";

let cachedLogoDataUri: string | null = null;
function getLogoDataUri(): string {
  if (cachedLogoDataUri) return cachedLogoDataUri;
  const candidates = [
    resolve(process.cwd(), ".output/public/logo.svg"),
    resolve(process.cwd(), "public/logo.svg"),
  ];
  for (const path of candidates) {
    try {
      const buf = readFileSync(path);
      cachedLogoDataUri = `data:image/svg+xml;base64,${buf.toString("base64")}`;
      return cachedLogoDataUri;
    } catch {
      // try next
    }
  }
  cachedLogoDataUri = "";
  return cachedLogoDataUri;
}

export function generateInvoiceHtml(data: any) {
  const {
    registration,
    settings,
    iutName,
    totalPrice,
    paymentStatus,
    paymentMethod,
    paidAt,
  } = data;

  const dateStr = new Date().toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const paidAtStr = paidAt
    ? new Date(paidAt).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Non payé";

  const isPaid = paymentStatus === "PAID";

  // TVA extraite du total (les prix sont TTC) — taux configurable dans les paramètres
  const vat = computeVat(Number(totalPrice), Number(settings?.vatRate) || 0);

  // Libellé FR de la méthode de paiement (l'enum est stocké en anglais)
  const paymentMethodLabels: Record<string, string> = {
    CARD: "Carte bancaire",
    TRANSFER: "Virement",
    CASH: "Espèces",
    FREE: "Gratuit",
  };
  // Par défaut, les paiements sont des virements
  const paymentMethodLabel =
    paymentMethodLabels[paymentMethod || "TRANSFER"] || "Virement";

  // Build rows for meals
  let mealsHtml = "";
  if (registration.meals && registration.meals.length > 0) {
    mealsHtml = registration.meals
      .map((m: any) => {
        return `
        <tr>
          <td><div class="item-name">${m.meal.name}</div></td>
          <td class="center">${m.quantity}</td>
          <td class="right">${Number(m.meal.price).toFixed(2)} €</td>
          <td class="right item-name">${(Number(m.meal.price) * m.quantity).toFixed(2)} €</td>
        </tr>
      `;
      })
      .join("");
  }

  // Build rows for activities
  let activitiesHtml = "";
  if (registration.activities && registration.activities.length > 0) {
    activitiesHtml = registration.activities
      .map((a: any) => {
        const price = Number(a.activity.price) || 0;
        return `
        <tr>
          <td>
            <div class="item-name">${a.activity.name}</div>
          </td>
          <td class="center">1</td>
          <td class="right">${price > 0 ? price.toFixed(2) + " €" : "Gratuit"}</td>
          <td class="right item-name">${price > 0 ? price.toFixed(2) + " €" : "0.00 €"}</td>
        </tr>
      `;
      })
      .join("");
  }

  // Fallback if nothing
  const emptyHtml =
    !mealsHtml && !activitiesHtml
      ? `<tr><td colspan="4" class="center item-options" style="padding: 30px;">Aucun repas ou activité payante</td></tr>`
      : "";

  const address = (settings?.locationAddress || "IUT de Troyes").replace(
    /\n/g,
    "<br>",
  );

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Facture ${registration.order?.orderNumber || registration.id}</title>
      <style>
        :root {
          --text-main: #111827;
          --text-muted: #6b7280;
          --border: #e9e7ee;
          --brand: #4d2465;
          --paid: #047857;
          --paid-bg: rgba(4, 120, 87, 0.09);
          --pending: #b45309;
          --pending-bg: rgba(180, 83, 9, 0.10);
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: var(--text-main);
          background: white;
          font-size: 13px;
          line-height: 1.5;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        @page {
          size: A4;
          margin: 0;
        }

        .top-accent {
          height: 5px;
          background: var(--brand);
        }

        .invoice-box {
          padding: 40px 56px 32px;
          max-width: 800px;
          margin: auto;
          min-height: calc(100vh - 5px);
          display: flex;
          flex-direction: column;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
        }

        .logo {
          height: 50px;
          max-width: 250px;
          object-fit: contain;
        }

        .invoice-title {
          text-align: right;
        }

        .invoice-title h1 {
          font-size: 32px;
          font-weight: 300;
          letter-spacing: 0.04em;
          margin-bottom: 5px;
          text-transform: uppercase;
          color: var(--brand);
        }

        .invoice-title p {
          font-size: 13px;
          color: var(--text-muted);
        }

        .info-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 32px;
        }

        .info-block {
          width: 45%;
        }

        .info-label {
          font-size: 10px;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.05em;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .info-text {
          font-size: 13px;
          color: var(--text-main);
          line-height: 1.6;
        }

        .info-text strong {
          font-weight: 600;
          font-size: 14px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 28px;
        }

        th {
          text-align: left;
          font-size: 10px;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.05em;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border);
          font-weight: 600;
        }

        th.right, td.right {
          text-align: right;
        }

        th.center, td.center {
          text-align: center;
        }

        td {
          padding: 12px 0;
          border-bottom: 1px solid #f4f3f6;
          vertical-align: middle;
        }

        .item-name {
          font-weight: 500;
          color: var(--text-main);
        }

        .item-options {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .summary {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 40px;
        }

        .payment .info-label {
          margin-bottom: 10px;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 13px 6px 11px;
          border-radius: 999px;
          font-weight: 600;
          font-size: 13px;
          line-height: 1;
        }

        .status-pill.paid { background: var(--paid-bg); color: var(--paid); }
        .status-pill.pending { background: var(--pending-bg); color: var(--pending); }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: currentColor;
        }

        .payment-meta {
          margin-top: 10px;
          color: var(--text-muted);
          font-size: 12px;
          line-height: 1.7;
        }

        .totals {
          width: 260px;
          flex-shrink: 0;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 7px 0;
          color: var(--text-muted);
        }

        .total-row.final {
          border-top: 1px solid var(--border);
          margin-top: 6px;
          padding-top: 14px;
          color: var(--text-main);
          font-weight: 700;
          font-size: 17px;
        }

        .total-row.final .amount { color: var(--brand); }

        .footer {
          margin-top: auto;
          padding-top: 18px;
          border-top: 1px solid var(--border);
          text-align: center;
          color: var(--text-muted);
          font-size: 11px;
          line-height: 1.7;
        }
      </style>
    </head>
    <body>
      <div class="top-accent"></div>
      <div class="invoice-box">
        <div class="header">
          <img src="${getLogoDataUri()}" alt="Logo" class="logo" />
          <div class="invoice-title">
            <h1>Facture</h1>
            <p>Réf: ${registration.order?.orderNumber || registration.id.substring(0, 8).toUpperCase()}</p>
            <p>${dateStr}</p>
          </div>
        </div>

        <div class="info-section">
          <div class="info-block">
            <div class="info-label">Émetteur</div>
            <div class="info-text">
              <strong>${settings?.siteName || "ACD MMI"}</strong><br>
              ${address}
            </div>
          </div>
          <div class="info-block" style="text-align: right;">
            <div class="info-label">Adressé à</div>
            <div class="info-text">
              <strong>${registration.firstName} ${registration.lastName}</strong><br>
              ${registration.email}<br>
              ${registration.phone}<br>
              ${iutName ? `${iutName}` : ""}
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th class="center" style="width: 80px;">Qté</th>
              <th class="right" style="width: 100px;">Prix Unitaire</th>
              <th class="right" style="width: 100px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${mealsHtml}
            ${activitiesHtml}
            ${emptyHtml}
          </tbody>
        </table>

        <div class="summary">
          <div class="payment">
            <div class="info-label">Statut du paiement</div>
            <div class="status-pill ${isPaid ? "paid" : "pending"}">
              <span class="status-dot"></span>
              ${isPaid ? "Acquittée" : "En attente de paiement"}
            </div>
            <div class="payment-meta">
              ${isPaid ? `Réglée le ${paidAtStr}` : "À régler à réception de la facture"}<br>Méthode : ${paymentMethodLabel}
            </div>
          </div>

          <div class="totals">
            <div class="total-row">
              <span>Sous-total HT</span>
              <span>${vat.ht.toFixed(2)} €</span>
            </div>
            <div class="total-row">
              <span>TVA (${vat.rate}%)</span>
              <span>${vat.tva.toFixed(2)} €</span>
            </div>
            <div class="total-row final">
              <span>Total TTC</span>
              <span class="amount">${vat.ttc.toFixed(2)} €</span>
            </div>
          </div>
        </div>

        <div class="footer">
          Merci de votre participation ! Pour toute question, veuillez nous contacter.<br>
          Généré automatiquement le ${new Date().toLocaleDateString("fr-FR")}
        </div>
      </div>
    </body>
    </html>
  `;
}
