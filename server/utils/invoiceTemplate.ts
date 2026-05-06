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

  // Build rows for meals
  let mealsHtml = "";
  if (registration.meals && registration.meals.length > 0) {
    mealsHtml = registration.meals
      .map((m: any) => {
        let optionsHtml = "";
        const options = [];
        if (m.starterOption) options.push(m.starterOption.name);
        if (m.mainOption) options.push(m.mainOption.name);
        if (m.cheeseOption) options.push(m.cheeseOption.name);
        if (m.dessertOption) options.push(m.dessertOption.name);
        if (options.length > 0) {
          optionsHtml = options.join(" • ");
        }

        return `
        <tr>
          <td>
            <div class="item-name">${m.meal.name}</div>
            ${optionsHtml ? `<div class="item-options">${optionsHtml}</div>` : ""}
          </td>
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
          --border: #e5e7eb;
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

        .invoice-box {
          padding: 60px 70px;
          max-width: 800px;
          margin: auto;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 50px;
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
          letter-spacing: -0.02em;
          margin-bottom: 5px;
          text-transform: uppercase;
          color: var(--text-main);
        }

        .invoice-title p {
          font-size: 13px;
          color: var(--text-muted);
        }

        .info-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 50px;
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
          margin-bottom: 40px;
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
          padding: 16px 0;
          border-bottom: 1px solid #f9fafb;
          vertical-align: top;
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

        .totals {
          width: 280px;
          margin-left: auto;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          color: var(--text-muted);
        }

        .total-row.final {
          border-top: 1px solid var(--border);
          margin-top: 8px;
          padding-top: 16px;
          color: var(--text-main);
          font-weight: 600;
          font-size: 16px;
        }

        .status-box {
          margin-top: 40px;
          padding: 16px;
          background-color: #f9fafb;
          border-radius: 6px;
          display: inline-block;
          min-width: 250px;
        }

        .footer {
          margin-top: 80px;
          padding-top: 20px;
          border-top: 1px solid var(--border);
          text-align: center;
          color: var(--text-muted);
          font-size: 11px;
        }
      </style>
    </head>
    <body>
      <div class="invoice-box">
        <div class="header">
          <img src="https://butmmi.fr/wp-content/themes/blitz-starter-kit/assets/img/logo.svg" alt="Logo" class="logo" />
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

        <div class="totals">
          <div class="total-row">
            <span>Sous-total HT</span>
            <span>${Number(totalPrice).toFixed(2)} €</span>
          </div>
          <div class="total-row">
            <span>TVA (0%)</span>
            <span>0.00 €</span>
          </div>
          <div class="total-row final">
            <span>Total TTC</span>
            <span>${Number(totalPrice).toFixed(2)} €</span>
          </div>
        </div>

        <div class="status-box">
          <div class="info-label">Statut du paiement</div>
          <div class="info-text">
            ${
              isPaid
                ? `<span style="color: #059669; font-weight: 600;">Acquittée</span> le ${paidAtStr}`
                : `<span style="color: #dc2626; font-weight: 600;">En attente de paiement</span>`
            }
            ${paymentMethod ? `<br><span style="color: var(--text-muted); font-size: 12px; margin-top: 4px; display: inline-block;">Méthode : ${paymentMethod}</span>` : ""}
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
