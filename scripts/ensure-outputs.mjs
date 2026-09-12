/**
 * Préparation exécutée avant `next dev` et `next build`.
 *
 * 1. `amplify_outputs.json` est généré par `npx ampx sandbox` (ou par Amplify
 *    Hosting au build) et n'est donc pas versionné. Tant qu'aucun backend n'a
 *    été déployé, le fichier est absent et l'import échouerait à la
 *    compilation : on écrit alors un fichier vide, ce qui bascule le site en
 *    mode démonstration.
 *
 * 2. Les photos produit sont déposées à la main dans `public/products/`.
 *    On génère la liste des fichiers réellement présents, pour que le
 *    catalogue n'affiche jamais une image manquante (404 en console,
 *    pénalité Lighthouse) et bascule sur le visuel neutre à la place.
 *    Déposer une photo puis relancer le build suffit à l'activer.
 */
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, extname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// ── 1. amplify_outputs.json ────────────────────────────────────────────────
const outputs = join(root, 'amplify_outputs.json');
if (!existsSync(outputs)) {
  writeFileSync(outputs, '{}\n', 'utf8');
  console.log('[pgt] amplify_outputs.json absent — mode démonstration activé.');
}

// ── 2. Inventaire des photos produit ───────────────────────────────────────
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);
const imagesDir = join(root, 'public', 'products');
mkdirSync(imagesDir, { recursive: true });

/** { "amoxi-denk-500": "/products/amoxi-denk-500.jpg" } */
const available = {};
for (const file of readdirSync(imagesDir)) {
  const extension = extname(file).toLowerCase();
  if (!IMAGE_EXTENSIONS.has(extension)) continue;
  available[file.slice(0, -extension.length)] = `/products/${file}`;
}

writeFileSync(
  join(root, 'data', 'product-images.generated.json'),
  `${JSON.stringify(available, null, 2)}\n`,
  'utf8',
);

const count = Object.keys(available).length;
console.log(
  count === 0
    ? '[pgt] Aucune photo dans public/products/ — visuels neutres utilisés.'
    : `[pgt] ${count} photo(s) produit détectée(s).`,
);
