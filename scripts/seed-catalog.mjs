/**
 * Insère le catalogue initial (`data/catalog.ts`) dans la base du backend.
 *
 *   npm run seed -- --profile salawat
 *
 * Pourquoi une écriture directe en DynamoDB plutôt que par AppSync : la clé
 * d'API publique n'autorise QUE la lecture sur Product et Category — c'est
 * précisément la protection voulue. Le seeding est une opération
 * d'administration ponctuelle ; il emprunte donc les identifiants AWS de
 * l'exploitant plutôt que d'affaiblir les règles de l'API.
 *
 * Idempotent : une entrée dont le `slug` existe déjà est laissée intacte, si
 * bien qu'une modification faite depuis /admin n'est jamais écrasée.
 */
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const args = process.argv.slice(2);
const profile = args[args.indexOf('--profile') + 1];
const hasProfile = args.includes('--profile') && profile && !profile.startsWith('--');

const outputs = JSON.parse(readFileSync(join(root, 'amplify_outputs.json'), 'utf8'));
const region = outputs?.data?.aws_region;
if (!region) {
  console.error('Backend non déployé : lancez d’abord `npx ampx sandbox`.');
  process.exit(1);
}

/** Appelle l'AWS CLI et renvoie la réponse JSON. */
function aws(service, command, extra = []) {
  const argv = [service, command, '--region', region, '--output', 'json', ...extra];
  if (hasProfile) argv.push('--profile', profile);
  const stdout = execFileSync('aws', argv, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  return stdout.trim() ? JSON.parse(stdout) : null;
}

/** Retrouve la table d'un modèle : `<Modele>-<apiId>-<branche>`. */
function findTable(model) {
  const { TableNames } = aws('dynamodb', 'list-tables');
  const match = TableNames.find((name) => new RegExp(`^${model}-`).test(name));
  if (!match) throw new Error(`Table introuvable pour le modèle ${model}.`);
  return match;
}

/** Conversion en types DynamoDB ; les valeurs nulles sont simplement omises. */
function attr(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value === '' ? null : { S: value };
  if (typeof value === 'number') return { N: String(value) };
  if (typeof value === 'boolean') return { BOOL: value };
  return null;
}

function item(fields) {
  const out = {};
  for (const [key, value] of Object.entries(fields)) {
    const converted = attr(value);
    if (converted) out[key] = converted;
  }
  return out;
}

const { categories, products } = await import('../data/catalog.ts');

const categoryTable = findTable('Category');
const productTable = findTable('Product');

function existingSlugs(table) {
  const rows = aws('dynamodb', 'scan', [
    '--table-name',
    table,
    '--projection-expression',
    '#s,#i',
    '--expression-attribute-names',
    JSON.stringify({ '#s': 'slug', '#i': 'id' }),
  ]);
  return new Map((rows.Items ?? []).map((row) => [row.slug?.S, row.id?.S]));
}

function putItem(table, fields) {
  const argv = ['dynamodb', 'put-item', '--table-name', table, '--item', JSON.stringify(item(fields))];
  aws(argv[0], argv[1], argv.slice(2));
}

const now = new Date().toISOString();
const knownCategories = existingSlugs(categoryTable);
const knownProducts = existingSlugs(productTable);

let createdCategories = 0;
const categoryIdBySlug = new Map(knownCategories);

for (const [index, category] of categories.entries()) {
  if (categoryIdBySlug.has(category.slug)) continue;
  const id = randomUUID();
  putItem(categoryTable, {
    id,
    __typename: 'Category',
    slug: category.slug,
    nameFr: category.name.fr,
    nameAr: category.name.ar,
    nameEn: category.name.en,
    icon: category.icon,
    sortOrder: index,
    published: true,
    createdAt: now,
    updatedAt: now,
  });
  categoryIdBySlug.set(category.slug, id);
  createdCategories += 1;
}

let createdProducts = 0;

for (const product of products) {
  if (knownProducts.has(product.slug)) continue;
  putItem(productTable, {
    id: randomUUID(),
    __typename: 'Product',
    slug: product.slug,
    name: product.name,
    activeIngredient: product.activeIngredient,
    strength: product.strength,
    formFr: product.form?.fr ?? null,
    formAr: product.form?.ar ?? null,
    formEn: product.form?.en ?? null,
    packageSizeFr: product.packageSize?.fr ?? null,
    packageSizeAr: product.packageSize?.ar ?? null,
    packageSizeEn: product.packageSize?.en ?? null,
    manufacturer: product.manufacturer,
    sku: product.sku,
    barcode: product.barcode,
    imageUrl: product.image,
    price: product.price,
    promoPrice: product.promoPrice,
    stockQuantity: product.stockQuantity,
    availability: product.availability,
    pharmacistValidation: product.pharmacistValidation,
    categoryId: categoryIdBySlug.get(product.categoryId) ?? null,
    featured: product.featured,
    published: product.published,
    createdAt: now,
    updatedAt: now,
  });
  createdProducts += 1;
}

console.log(
  `[pgt] ${createdCategories} catégorie(s) et ${createdProducts} produit(s) créés ; ` +
    `${knownProducts.size} produit(s) déjà en base, laissés intacts.`,
);
