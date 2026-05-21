# ACD MMI 2026

[![wakatime](https://wakatime.com/badge/user/655aa6eb-7c71-402f-b161-4ab28498501a/project/ab92d7f2-ca6d-4e4f-ad6a-c17de95aa1f6.svg)](https://wakatime.com/badge/user/655aa6eb-7c71-402f-b161-4ab28498501a/project/ab92d7f2-ca6d-4e4f-ad6a-c17de95aa1f6)
[![Nuxt](https://img.shields.io/badge/Nuxt-4.x-00DC82?logo=nuxt.js)](https://nuxt.com)
[![Vue](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vue.js)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748?logo=prisma)](https://www.prisma.io)

Plateforme de gestion d'événement pour l'**Assemblée des Chefs de Départements MMI 2026**, organisée à l'IUT de Troyes du 15 au 17 juin 2026. L'application permet la gestion complète des inscriptions, repas, activités, hébergements et du programme de l'événement.

---

## 🧪 Démo

Une instance de démo avec données fictives est disponible pour le **Festival MMI 2026** :

- **URL** : <https://demo-acd-mmi.mmi23f03.fr>
- **Compte admin** :
  - Email : `admin@demo-acd.com`
  - Mot de passe : `DemoMMI2026!`

La démo contient 45 inscriptions fictives, 34 IUTs, 6 hôtels, 6 activités et 6 repas pour permettre au jury de tester l'ensemble des fonctionnalités (côté participant et côté administration).

> ⚠️ Environnement de démo — données fictives, données régulièrement réinitialisées. Toute inscription ou modification effectuée sur cette instance n'a aucune valeur réelle.

---

## Sommaire

- [Démo](#-démo)
- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Développement](#développement)
- [Pages & Routes](#pages--routes)
- [API](#api)
- [Base de données](#base-de-données)
- [Tests](#tests)
- [Structure du projet](#structure-du-projet)

---

## Fonctionnalités

### Côté participant
- **Inscription multi-étapes** — informations personnelles, choix des repas (entrée / plat / dessert) et des activités, avec récapitulatif en temps réel
- **Authentification** — email/mot de passe, GitHub OAuth, lien magique (magic link)
- **Email de confirmation** — envoyé automatiquement à l'inscription avec une facture PDF en pièce jointe
- **Profil** — consultation et modification de ses informations personnelles
- **Programme** — consultation du programme de l'événement
- **Hôtels** — liste des hôtels partenaires avec carte interactive
- **Transport** — informations d'accès et de transport

### Côté administration
- **Dashboard** — vue d'ensemble des inscriptions et statistiques
- **Gestion des inscriptions** — liste, détail, changement de statut (en attente / confirmé / annulé)
- **Gestion des commandes** — suivi des paiements (en attente / payé / échoué / remboursé)
- **Gestion des repas** — création/modification/suppression avec options par catégorie (entrée, plat, dessert) et informations sur les allergènes
- **Gestion des activités** — création/modification/suppression avec capacité et tarif
- **Gestion des hôtels** — liste des hôtels partenaires avec géolocalisation
- **Gestion du programme** — création/modification/suppression des événements
- **Gestion des utilisateurs** — liste, modification, bannissement
- **Gestion des IUTs** — import CSV de la liste des IUTs
- **Gestion du contenu** — édition en base des textes de toutes les pages (accueil, inscription, programme, hôtels, accès)
- **Paramètres** — ouverture/fermeture des inscriptions, dates et lieu de l'événement
- **Export** — export des données d'inscriptions et de commandes

---

## Stack technique

| Catégorie | Technologie |
|-----------|-------------|
| Framework | [Nuxt 4](https://nuxt.com) + [Vue 3](https://vuejs.org) |
| Langage | TypeScript 5 |
| Base de données | PostgreSQL 16 via [Prisma 7](https://www.prisma.io) |
| Authentification | [Better-Auth](https://www.better-auth.com) |
| UI | [Shadcn-nuxt](https://www.shadcn-vue.com) + [Tailwind CSS 4](https://tailwindcss.com) |
| Composants headless | [Reka UI](https://reka-ui.com) |
| Animations | [Motion-v](https://motion.dev/vue) |
| Cartes | [Leaflet](https://leafletjs.com) via vue-leaflet |
| Graphiques | [Unovis](https://unovis.dev) |
| Tables | [TanStack Table](https://tanstack.com/table) |
| Emails | [Vue Email](https://vuemail.net) + [Nodemailer](https://nodemailer.com) |
| PDF | [Gotenberg](https://gotenberg.dev) |
| Notifications | [vue-sonner](https://vue-sonner.vercel.app) |
| Tests unitaires | [Vitest](https://vitest.dev) + [Vue Test Utils](https://test-utils.vuejs.org) |
| Tests E2E | [Playwright](https://playwright.dev) |

---

## Prérequis

- **Node.js** ≥ 20
- **pnpm** (recommandé) ou npm
- **Docker & Docker Compose** — pour la base de données, les emails et la génération de PDF

---

## Installation

```bash
# Cloner le dépôt
git clone <repo-url>
cd acd-nuxt

# Installer les dépendances
pnpm install

# Démarrer les services Docker (PostgreSQL, Mailpit, Gotenberg, Adminer)
docker compose up -d

# Copier et configurer les variables d'environnement
cp .env.example .env

# Appliquer les migrations et générer le client Prisma
pnpm prisma migrate dev

# (Optionnel) Peupler la base de données avec des données de test
pnpm prisma db seed
```

---

## Configuration

Copier `.env.example` en `.env` et renseigner les variables :

```env
# Base de données
DATABASE_URL=postgres://admin:password@localhost:5432/acd_db

# Better-Auth
BETTER_AUTH_SECRET=votre_secret_ici
BETTER_AUTH_URL=http://localhost:3000

# GitHub OAuth (optionnel)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# SMTP (par défaut : Mailpit en local via Docker)
SMTP_HOST=localhost
SMTP_PORT=1025
MAIL_FROM="ACD <noreply@acd.local>"

# URL publique de l'application
APP_URL=http://localhost:3000
```

### Services Docker

| Service | URL | Description |
|---------|-----|-------------|
| PostgreSQL | `localhost:5432` | Base de données principale |
| Adminer | [localhost:8081](http://localhost:8081) | Interface d'admin de la BDD |
| Mailpit | [localhost:8025](http://localhost:8025) | Boîte mail de test |
| Gotenberg | `localhost:3001` | Génération de PDF |

---

## Développement

```bash
# Lancer le serveur de développement
pnpm dev
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000).

```bash
# Build de production
pnpm build

# Prévisualiser le build de production
pnpm preview
```

---

## Pages & Routes

### Pages publiques

| Route | Description |
|-------|-------------|
| `/` | Page d'accueil |
| `/programme` | Programme de l'événement |
| `/hotels` | Hôtels partenaires avec carte |
| `/acces` | Informations d'accès et de transport |
| `/inscription` | Formulaire d'inscription (multi-étapes) |
| `/inscription/confirmation` | Confirmation d'inscription |

### Authentification

| Route | Description |
|-------|-------------|
| `/auth/signin` | Connexion |
| `/auth/signup` | Création de compte |
| `/auth/reset-password` | Réinitialisation du mot de passe |

### Espace utilisateur

| Route | Description |
|-------|-------------|
| `/profil` | Profil de l'utilisateur connecté |

### Administration (`/admin/*`)

> Toutes les routes `/admin` nécessitent le rôle **admin**.

| Route | Description |
|-------|-------------|
| `/admin` | Dashboard général |
| `/admin/inscriptions` | Liste des inscriptions |
| `/admin/inscriptions/[id]` | Détail d'une inscription |
| `/admin/orders` | Liste des commandes |
| `/admin/orders/[id]` | Détail d'une commande |
| `/admin/repas` | Gestion des repas |
| `/admin/repas/[id]` | Détail d'un repas et ses options |
| `/admin/activites` | Gestion des activités |
| `/admin/hotels` | Gestion des hôtels |
| `/admin/programme` | Gestion du programme |
| `/admin/users` | Gestion des utilisateurs |
| `/admin/iuts` | Gestion des IUTs |
| `/admin/export` | Export des données |
| `/admin/parametres` | Paramètres du site |
| `/admin/contenu/accueil` | Édition du contenu — Accueil |
| `/admin/contenu/inscription` | Édition du contenu — Inscription |
| `/admin/contenu/programme` | Édition du contenu — Programme |
| `/admin/contenu/hotels` | Édition du contenu — Hôtels |
| `/admin/contenu/acces` | Édition du contenu — Accès |

---

## API

### Inscriptions

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/registrations` | Liste toutes les inscriptions |
| `POST` | `/api/registrations` | Crée une inscription |
| `GET` | `/api/registrations/me` | Inscription de l'utilisateur connecté |
| `GET` | `/api/registrations/[id]` | Détail d'une inscription |
| `PUT` | `/api/registrations/[id]` | Modifie une inscription |
| `PATCH` | `/api/registrations/[id]/status` | Met à jour le statut |

### Commandes

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/orders` | Liste toutes les commandes |
| `GET` | `/api/orders/[id]` | Détail d'une commande |
| `PATCH` | `/api/orders/[id]/status` | Met à jour le statut de paiement |

### Repas

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/meals` | Liste tous les repas |
| `POST` | `/api/meals` | Crée un repas |
| `GET` | `/api/meals/[id]` | Détail d'un repas |
| `PUT` | `/api/meals/[id]` | Modifie un repas |
| `DELETE` | `/api/meals/[id]` | Supprime un repas |
| `POST` | `/api/meals/[id]/options` | Ajoute une option (entrée/plat/dessert) |
| `PUT` | `/api/meals/[id]/options/[optionId]` | Modifie une option |
| `DELETE` | `/api/meals/[id]/options/[optionId]` | Supprime une option |

### Activités

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/activities` | Liste toutes les activités |
| `POST` | `/api/activities` | Crée une activité |
| `PUT` | `/api/activities/[id]` | Modifie une activité |
| `DELETE` | `/api/activities/[id]` | Supprime une activité |

### Programme

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/events` | Liste tous les événements |
| `POST` | `/api/events` | Crée un événement |
| `PUT` | `/api/events/[id]` | Modifie un événement |
| `DELETE` | `/api/events/[id]` | Supprime un événement |

### Hôtels

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/hotels` | Liste tous les hôtels |
| `POST` | `/api/hotels` | Crée un hôtel |
| `PUT` | `/api/hotels/[id]` | Modifie un hôtel |
| `DELETE` | `/api/hotels/[id]` | Supprime un hôtel |

### Utilisateurs & IUTs

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/users` | Liste tous les utilisateurs |
| `PUT` | `/api/users/[id]` | Modifie un utilisateur |
| `GET` | `/api/iuts` | Liste les IUTs |
| `POST` | `/api/iuts/import` | Import CSV des IUTs |

### Contenu & Paramètres

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET/PUT` | `/api/home-content` | Contenu de la page d'accueil |
| `GET/PUT` | `/api/inscription-content` | Contenu de la page d'inscription |
| `GET/PUT` | `/api/programme-content` | Contenu de la page programme |
| `GET/PUT` | `/api/hotels-content` | Contenu de la page hôtels |
| `GET/PUT` | `/api/access-content` | Contenu de la page accès |
| `GET/PUT` | `/api/settings` | Paramètres du site |

### Export & Statistiques

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/api/export` | Export des données |
| `GET` | `/api/export/counts` | Compteurs d'inscriptions |
| `GET` | `/api/stats/chart` | Données pour les graphiques |

---

## Base de données

### Modèles principaux

```
User                 → Comptes utilisateurs (firstName, lastName, tel, iut, role)
Registration         → Inscriptions (allergens, isMotorized, totalPrice, status)
Order                → Commandes liées aux inscriptions (paymentStatus, paymentMethod)
Meal                 → Repas (date, type LUNCH/DINNER, price)
MealOption           → Options de repas (STARTER / MAIN / DESSERT, allergens)
RegistrationMeal     → Choix de repas d'un participant
Activity             → Activités (date, capacity, price)
RegistrationActivity → Activités choisies par un participant
Event                → Événements du programme (date, time, location, description)
Hotel                → Hôtels partenaires (address, phone, maps data)
Iut                  → Établissements (name, city)
Setting              → Paramètres du site
*Content             → Contenu éditable des pages (HomeContent, InscriptionContent, …)
```

### Commandes Prisma utiles

```bash
# Créer une migration après modification du schéma
pnpm prisma migrate dev --name nom_de_la_migration

# Appliquer les migrations en production
pnpm prisma migrate deploy

# Ouvrir Prisma Studio (interface graphique)
pnpm prisma studio

# Regénérer le client Prisma
pnpm prisma generate

# Réinitialiser la base de données
pnpm prisma migrate reset
```

---

## Tests

```bash
# Lancer tous les tests
pnpm test

# Tests en mode watch
pnpm test:watch

# Tests unitaires uniquement
pnpm test:unit

# Tests Nuxt (intégration)
pnpm test:nuxt

# Tests E2E (Playwright)
pnpm test:e2e

# Tests E2E avec interface graphique
pnpm test:e2e:ui
```

---

## Structure du projet

```
acd-nuxt/
├── app/
│   ├── assets/              # CSS globaux et assets
│   ├── components/
│   │   ├── ui/              # Composants Shadcn (45+)
│   │   ├── registration/    # Étapes du formulaire d'inscription
│   │   ├── auth/            # Composants d'authentification
│   │   ├── inscriptions/    # Composants admin — inscriptions
│   │   ├── repas/           # Composants admin — repas
│   │   ├── activities/      # Composants admin — activités
│   │   ├── hotels/          # Composants admin — hôtels
│   │   ├── programme/       # Composants admin — programme
│   │   ├── users/           # Composants admin — utilisateurs
│   │   └── iuts/            # Composants admin — IUTs
│   ├── layouts/             # Layouts (default, admin, auth)
│   ├── pages/               # Pages / Routes
│   ├── middleware/          # Middleware (protection admin)
│   ├── lib/                 # Auth client, utilitaires
│   └── utils/               # Helpers (allergènes, etc.)
├── server/
│   ├── api/                 # Endpoints API (51 routes)
│   ├── emails/              # Templates d'emails (Vue Email)
│   └── utils/               # Auth, DB, Mail, PDF
├── prisma/
│   ├── schema.prisma        # Schéma de la base de données
│   └── seed.ts              # Script de seed
├── tests/                   # Tests unitaires et E2E
├── docker-compose.yml       # Services Docker
├── nuxt.config.ts           # Configuration Nuxt
└── .env.example             # Variables d'environnement exemple
```
