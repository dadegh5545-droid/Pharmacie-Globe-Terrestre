# Pharmacie Globe Terrestre

Plateforme pharmaceutique trilingue (français par défaut, arabe RTL, anglais).
Catalogue produits, recherche par substance active, envoi d'ordonnance sécurisé,
demandes de disponibilité par WhatsApp et back-office complet.

**Ce site n'est pas une boutique de vente en ligne.** Aucun paiement n'y est
effectué : le client constitue une demande, la pharmacie confirme disponibilité
et prix. Les produits soumis à validation pharmaceutique n'ont volontairement
aucun parcours d'achat direct.

---

## Démarrer

```bash
npm install
npm run dev          # http://localhost:3000 → redirige vers /fr
```

Le site fonctionne immédiatement **sans compte AWS**, en mode démonstration :
le catalogue vient de `data/catalog.ts`, et les fonctions nécessitant le
backend (envoi d'ordonnance, back-office) affichent un message explicite.

```bash
npm run build        # build de production
npm run typecheck    # tsc --noEmit
npm run lint
npm run sandbox      # npx ampx sandbox — déploie le backend AWS de dev
```

---

## Structure

```
app/
  [locale]/                  # site public, une langue par préfixe d'URL
    page.tsx                 # accueil (hero, recherche, catégories, …)
    medicaments/             # produits à validation pharmaceutique
    produits/                # catalogue complet + filtres
    products/[slug]/         # fiche produit (pré-générée, SEO)
    ordonnance/              # envoi d'ordonnance
    demande/                 # « Ma demande » (liste + WhatsApp)
    services/  a-propos/  contact/
    confidentialite/  conditions/  informations-medicales/
    layout.tsx               # <html lang dir>, polices, JSON-LD, providers
    error.tsx  loading.tsx  not-found.tsx
  admin/                     # back-office (hors i18n, non indexé)
    page.tsx                 # tableau de bord
    produits/ categories/ inventaire/
    demandes/ ordonnances/ clients/ messages/ parametres/
  globals.css  robots.ts  sitemap.ts

components/
  ui/                        # primitives style shadcn (Button, Card, Badge…)
  admin/                     # coquille, garde d'accès, formulaires admin
  site-header  site-footer  search-bar  product-card  product-detail  …

config/site.ts               # ← FICHIER DE CONFIGURATION UNIQUE
data/catalog.ts              # catalogue initial (8 produits)
data/legal.ts                # textes légaux FR/AR/EN
lib/
  i18n/                      # config, dictionnaires, contexte
  request-store.tsx          # « Ma demande » (localStorage)
  whatsapp.ts                # rédaction des messages
  search.ts  seo.ts  admin-data.ts  amplify-client.ts  utils.ts
amplify/                     # backend Gen 2 : auth, data, storage
middleware.ts                # redirection de langue
```

---

## Fonctionnalités livrées

**Site public**

- Trois langues, français par défaut, arabe en RTL complet (propriétés logiques
  CSS partout : aucun `left`/`right` codé en dur).
- Recherche avec autocomplétion sur nom, marque, substance active, dosage,
  forme, conditionnement, SKU et catégorie. Taper `Amoxi` propose les deux
  Amoxi-Denk.
- Catalogue filtrable, état reflété dans l'URL (`?q=`, `?categorie=`).
- Fiches produit pré-générées statiquement, une URL par langue,
  `hreflang` croisés, JSON-LD `Product`.
- « Ma demande » persistée dans le navigateur, envoyée par WhatsApp avec un
  message structuré, et enregistrée en base pour le back-office.
- Envoi d'ordonnance : validation du type et de la taille côté client,
  téléversement dans un espace S3 privé.
- Bouton de contact flottant, hamburger mobile, header collant.
- États vides, chargement, erreur et succès traités partout.
- Avertissement médical sur toutes les pages + page dédiée.

**Back-office `/admin`**

- Authentification Cognito **+ contrôle du groupe `admin`** ; les règles
  AppSync appliquent la même restriction côté serveur.
- Tableau de bord : compteurs, alertes de stock faible, rappel de
  configuration WhatsApp.
- Produits : création, édition, suppression, téléversement de photo,
  publication/masquage, mise en avant, tous les champs du modèle.
- Catégories, inventaire (stock + seuil + disponibilité, ligne par ligne).
- Demandes avec détail des lignes, ordonnances avec lien signé temporaire,
  clients déduits, messages de contact.
- Paramètres : coordonnées, horaires, devise, indicatif, réseaux sociaux.

---

## Comment faire

### Ajouter ou modifier un produit

**Avec le backend déployé** — `/admin/produits` → « Ajouter un produit ».
Renseignez uniquement ce qui figure sur l'emballage : les champs laissés vides
affichent « Informations détaillées disponibles auprès du pharmacien. »
N'y saisissez ni posologie, ni indication, ni contre-indication.

**Sans backend** — éditez `data/catalog.ts`. Chaque produit suit le type
`Product` ; mettez `null` pour toute donnée non vérifiée.

### Ajouter une photo produit

Déposez le fichier dans `public/products/`, nommé d'après le slug du produit
(`amoxi-denk-500.jpg`, `nexium-40.jpg`…), puis relancez `npm run dev`.
Voir `public/products/LISEZ-MOI.md` pour la table complète. Sans fichier, un
visuel neutre s'affiche — jamais d'image cassée.

### Changer les numéros de téléphone

`config/site.ts` → `contact.phones`. Ou, backend déployé, `/admin/parametres`.

### Configurer WhatsApp ⚠

**WhatsApp est actuellement désactivé** : `wa.me` exige un numéro international
complet et l'indicatif du pays n'a pas été communiqué. Les boutons basculent
automatiquement sur l'appel téléphonique en attendant.

Pour l'activer, renseignez l'indicatif (sans `+`) :

```bash
# .env.local
NEXT_PUBLIC_COUNTRY_CODE=216      # exemple : 216 Tunisie, 212 Maroc, 213 Algérie, 33 France
```

ou `config/site.ts` → `contact.countryCode`, ou `/admin/parametres`.

### Configurer la devise et les prix

Aucune devise n'a été communiquée : **les prix sont masqués** et les fiches
affichent « Prix sur demande ». Pour les activer :

```bash
NEXT_PUBLIC_CURRENCY_CODE=TND
NEXT_PUBLIC_CURRENCY_SYMBOL=DT
NEXT_PUBLIC_CURRENCY_NAME=Dinar tunisien
NEXT_PUBLIC_SHOW_PRICES=true
```

### Renseigner l'adresse et les horaires

`config/site.ts` → `contact.address`, `city`, `country`, `mapsUrl`,
`mapsEmbedUrl`, et `openingHours`. Tant qu'ils sont vides, les sections
correspondantes affichent « sera publiée prochainement » plutôt qu'une valeur
inventée. Le balisage `LocalBusiness` les omet également.

### Créer un compte administrateur

```bash
npx ampx sandbox                      # déploie le backend
```

Puis dans la console AWS Cognito → User pool du projet :
créez l'utilisateur, puis **ajoutez-le au groupe `admin`**. Sans ce groupe,
la connexion réussit mais `/admin` refuse l'accès (et AppSync aussi).

---

## Déploiement

**AWS Amplify Hosting** (recommandé, `amplify.yml` est déjà présent) :
connectez le dépôt Git dans la console Amplify. Le build déploie le backend
(`ampx pipeline-deploy`) puis le frontend, et génère `amplify_outputs.json`.

**Vercel / autre hébergeur Node** : `npm run build` puis `npm start`.
Déployez le backend séparément avec `npx ampx pipeline-deploy` et committez ou
injectez `amplify_outputs.json` au build.

### Variables d'environnement

| Variable | Requise | Rôle |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | recommandée | URLs canoniques, sitemap, Open Graph |
| `NEXT_PUBLIC_COUNTRY_CODE` | **pour WhatsApp** | Indicatif international, sans `+` |
| `NEXT_PUBLIC_CURRENCY_CODE` | pour les prix | Code ISO (TND, MAD, DZD, EUR…) |
| `NEXT_PUBLIC_CURRENCY_SYMBOL` | pour les prix | Symbole affiché |
| `NEXT_PUBLIC_CURRENCY_NAME` | pour les prix | Nom de la devise |
| `NEXT_PUBLIC_SHOW_PRICES` | pour les prix | `true` pour afficher les prix |

Aucun secret n'est exposé côté client : les identifiants AWS vivent dans
`amplify_outputs.json` (clés publiques par conception) et les autorisations
sont appliquées par AppSync et S3, pas par l'interface.

---

## Sécurité

- Routes `/admin` protégées par Cognito **et** par appartenance au groupe
  `admin`, vérifiée côté serveur par les règles AppSync.
- Ordonnances : préfixe S3 privé `ordonnances/{identity}/`, aucun accès invité,
  lecture réservée au groupe `admin` via URL signée de 120 secondes.
- Validation du type MIME et de la taille des fichiers avant tout envoi,
  noms de fichiers assainis (`[^\w.\-]` remplacé).
- Toutes les saisies libres passent par `sanitizeText` (caractères de contrôle
  retirés, longueur bornée).
- En-têtes de sécurité dans `next.config.mjs` : CSP, HSTS, `X-Frame-Options`,
  `nosniff`, `Referrer-Policy`, `Permissions-Policy`.
- `/admin` en `noindex, nofollow` et exclu de `robots.txt`.

---

## Informations encore attendues

Ces éléments ne sont **pas inventés** ; le site les masque proprement en
attendant.

1. **Indicatif international** — bloque WhatsApp (le reste fonctionne).
2. **Devise** — code, symbole, nom ; puis les prix produit.
3. **Adresse, ville, pays** et lien Google Maps.
4. **Horaires d'ouverture.**
5. **E-mail** de contact et pages Facebook / Instagram.
6. **Photos produit** pour les 8 références (voir `public/products/`).
7. **Données produit manquantes** : substance active, forme, conditionnement
   et fabricant de Rabetok D, Amaday, Ibumol, Nuravit et Litacol.
8. **Mentions légales** : raison sociale, numéro d'enregistrement, autorité de
   tutelle, responsable de la publication.
9. **Logo définitif** — l'actuel (`components/logo.tsx`) est un placeholder
   professionnel, croix pharmaceutique sur globe.
