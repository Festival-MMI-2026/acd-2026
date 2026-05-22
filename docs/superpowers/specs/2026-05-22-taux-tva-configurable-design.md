# Taux de TVA configurable

**Date :** 2026-05-22
**Statut :** Validé (design)

## Objectif

Rendre le taux de TVA configurable depuis l'admin au lieu d'être codé en dur à `0%`.
Par défaut le taux reste à `0` (comportement actuel inchangé) ; un admin peut le passer
à `10%`, `20%`, `5,5%`, etc.

## Décision business

Les prix saisis (repas, activités) sont considérés **TTC (TVA incluse)**.
Changer le taux **ne modifie pas** le montant payé par l'inscrit : on **extrait** la TVA
du total TTC pour l'afficher (mention légale sur la facture). Aucun impact sur les
paiements existants ni sur Stripe.

Formule (taux exprimé en %, ex : `10`) :

```
ht  = ttc / (1 + taux/100)
tva = ttc - ht
ttc = total actuel (inchangé)
```

Cas `taux = 0` ⇒ `ht = ttc`, `tva = 0` ⇒ identique à aujourd'hui.

## Périmètre

### Inclus
1. Nouveau champ `vatRate` sur le modèle `Setting` (BDD).
2. Helper de calcul partagé app + serveur.
3. Champ éditable « Taux de TVA » dans la page Paramètres (carte dédiée « Facturation »).
4. Mise à jour des 3 affichages qui montrent `TVA (0%)`.

### Hors scope
- Aucune modification des montants facturés / payés.
- Aucune modification de Stripe ou de la logique de paiement.
- Pas de gestion de taux multiples (un seul taux global).

## Détail technique

### 1. Base de données — `prisma/schema.prisma` (modèle `Setting`)

Ajout :

```prisma
vatRate  Float  @default(0)   // taux de TVA en %, ex: 10 = 10%
```

- `Float` (pas `Decimal`) : suffisant pour un pourcentage arrondi à l'affichage.
- `@default(0)` : préserve le comportement actuel.
- Générer une migration Prisma.

### 2. Helper de calcul — `shared/utils/vat.ts`

Nuxt 4 auto-importe `shared/` côté app **et** serveur → une seule source de vérité.

```ts
export interface VatBreakdown {
  rate: number; // %
  ttc: number;
  ht: number;
  tva: number;
}

export function computeVat(totalTtc: number, ratePercent: number): VatBreakdown {
  const rate = Number(ratePercent) || 0;
  const ttc = Number(totalTtc) || 0;
  const ht = rate > 0 ? ttc / (1 + rate / 100) : ttc;
  return { rate, ttc, ht, tva: ttc - ht };
}
```

L'arrondi à 2 décimales se fait à l'affichage (`.toFixed(2)`), pas dans le helper.

### 3. API settings — `server/api/settings/index.put.ts`

- Ajouter `vatRate` dans les blocs `update` et `create`.
- Validation : nombre, `0 ≤ vatRate ≤ 100`. Valeur hors bornes ou non numérique ⇒
  fallback à la valeur existante / `0` (ne pas casser la sauvegarde des autres champs).
- `server/api/settings/index.get.ts` : aucun changement (retourne déjà tout l'objet).

### 4. Page Paramètres — `app/pages/admin/parametres/index.vue`

- Ajouter `vatRate: 0` au `ref settings`.
- Synchroniser depuis la BDD dans le `watchEffect` : `settings.value.vatRate = dbSettings.value.vatRate ?? 0`.
- Inclure `vatRate` dans le `body` de `save()`.
- Nouvelle **carte « Facturation »** (icône type `lucide:receipt` / `lucide:percent`)
  contenant un champ « Taux de TVA (%) » :
  - `Input` `type="number"`, `step="0.1"`, `min="0"`, `max="100"`.
  - Texte d'aide : « Les prix sont TTC ; ce taux sert à afficher la TVA sur les factures. »

### 5. Les 3 affichages

Remplacer le `TVA (0%)` / `0.00 €` codé en dur par le calcul via `computeVat`.

| Fichier | Note |
|---|---|
| `server/utils/invoiceTemplate.ts` (~L344-354) | Reçoit déjà `settings` → utiliser `settings.vatRate`. Recalculer `Sous-total HT` = `ht`, ligne `TVA (X%)` = `tva`, `Total TTC` = `ttc` (inchangé). |
| `app/pages/admin/orders/[id].vue` (~L322-339) | Ne fetch pas encore les settings → ajouter `useFetch("/api/settings")`. Total TTC = somme actuelle des items (inchangé). |
| `app/pages/admin/inscriptions/[id].vue` (~L420-435) | Idem : ajouter le fetch settings, recalculer HT/TVA, garder le total. |

Dans les 3 cas : le libellé devient dynamique `TVA (${rate}%)` et le total final reste
égal à la somme actuelle des items.

## Tests / vérification

- `taux = 0` : HT = total, TVA = 0, Total = total (régression : identique à avant).
- `taux = 10`, total `110 €` : HT = `100,00 €`, TVA = `10,00 €`, Total = `110,00 €`.
- Cohérence des 3 affichages (2 pages + PDF) pour une même inscription.
- Sauvegarde des paramètres avec un taux décimal (`5,5`) puis rechargement.
- Validation : un taux `> 100` ou non numérique ne casse pas la sauvegarde.

## Fichiers touchés

- `prisma/schema.prisma` (+ migration)
- `shared/utils/vat.ts` *(nouveau)*
- `server/api/settings/index.put.ts`
- `app/pages/admin/parametres/index.vue`
- `server/utils/invoiceTemplate.ts`
- `app/pages/admin/orders/[id].vue`
- `app/pages/admin/inscriptions/[id].vue`
