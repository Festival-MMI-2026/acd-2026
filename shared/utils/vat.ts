export interface VatBreakdown {
  /** Taux de TVA en pourcentage, ex: 10 = 10% */
  rate: number;
  /** Total toutes taxes comprises (inchangé : les prix sont saisis TTC) */
  ttc: number;
  /** Montant hors taxes, extrait du TTC */
  ht: number;
  /** Montant de la TVA, extrait du TTC */
  tva: number;
}

/**
 * Décompose un total TTC en HT + TVA, sans modifier le total.
 * Les prix de l'application sont saisis TTC : changer le taux ne change donc
 * pas le montant payé, on extrait seulement la part de TVA pour l'affichage.
 *
 * @param totalTtc total toutes taxes comprises
 * @param ratePercent taux de TVA en pourcentage (ex: 10 pour 10%)
 */
export function computeVat(totalTtc: number, ratePercent: number): VatBreakdown {
  const rate = Number(ratePercent) || 0;
  const ttc = Number(totalTtc) || 0;
  const ht = rate > 0 ? ttc / (1 + rate / 100) : ttc;
  return { rate, ttc, ht, tva: ttc - ht };
}
