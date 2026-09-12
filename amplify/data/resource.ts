import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/**
 * ────────────────────────────────────────────────────────────────────────────
 *  MODÈLE DE DONNÉES — Pharmacie Globe Terrestre
 * ────────────────────────────────────────────────────────────────────────────
 *
 *  Politique d'accès, site de santé :
 *   • Catalogue (Category, Product, Inventory) : lecture publique, écriture
 *     réservée au groupe Cognito `admin`.
 *   • Demandes et messages : création possible par un visiteur, mais AUCUNE
 *     lecture publique — seul `admin` peut les relire.
 *   • Ordonnances (PrescriptionRequest) : le fichier lui-même vit dans S3 sous
 *     un chemin privé (voir `amplify/storage/resource.ts`). L'enregistrement
 *     n'est lisible que par `admin`.
 */
const schema = a.schema({
  Availability: a.enum([
    'IN_STOCK',
    'LOW_STOCK',
    'OUT_OF_STOCK',
    'ON_ORDER',
    'CONTACT_PHARMACY',
  ]),

  RequestStatus: a.enum(['NEW', 'IN_PROGRESS', 'ANSWERED', 'CLOSED', 'CANCELLED']),

  PharmacistValidation: a.enum(['MAY_BE_REQUIRED', 'NONE']),

  // ── Catalogue ─────────────────────────────────────────────────────────────

  Category: a
    .model({
      slug: a.string().required(),
      nameFr: a.string().required(),
      nameAr: a.string().required(),
      nameEn: a.string().required(),
      icon: a.string(),
      sortOrder: a.integer().default(0),
      published: a.boolean().default(true),
      products: a.hasMany('Product', 'categoryId'),
    })
    .secondaryIndexes((index) => [index('slug')])
    .authorization((allow) => [
      allow.publicApiKey().to(['read']),
      allow.authenticated().to(['read']),
      allow.group('admin'),
    ]),

  Product: a
    .model({
      slug: a.string().required(),
      name: a.string().required(),
      nameFr: a.string(),
      nameAr: a.string(),
      nameEn: a.string(),
      descriptionFr: a.string(),
      descriptionAr: a.string(),
      descriptionEn: a.string(),
      /** Renseigné uniquement s'il figure sur l'emballage. */
      activeIngredient: a.string(),
      strength: a.string(),
      formFr: a.string(),
      formAr: a.string(),
      formEn: a.string(),
      packageSizeFr: a.string(),
      packageSizeAr: a.string(),
      packageSizeEn: a.string(),
      manufacturer: a.string(),
      sku: a.string(),
      barcode: a.string(),
      imageUrl: a.string(),
      gallery: a.string().array(),
      price: a.float(),
      promoPrice: a.float(),
      currency: a.string(),
      pharmacistValidation: a.ref('PharmacistValidation'),
      availability: a.ref('Availability'),
      stockQuantity: a.integer(),
      minimumStock: a.integer(),
      featured: a.boolean().default(false),
      published: a.boolean().default(true),
      categoryId: a.id(),
      category: a.belongsTo('Category', 'categoryId'),
      requestItems: a.hasMany('OrderItem', 'productId'),
    })
    .secondaryIndexes((index) => [index('slug'), index('categoryId')])
    .authorization((allow) => [
      allow.publicApiKey().to(['read']),
      allow.authenticated().to(['read']),
      allow.group('admin'),
    ]),

  // ── Demandes clients ──────────────────────────────────────────────────────

  /**
   * Une demande de disponibilité (« Ma demande »).
   * Un visiteur peut la créer mais jamais la relire : `create` seulement.
   */
  OrderRequest: a
    .model({
      reference: a.string().required(),
      customerName: a.string().required(),
      phone: a.string().required(),
      email: a.string(),
      note: a.string(),
      channel: a.string(),
      locale: a.string(),
      status: a.ref('RequestStatus'),
      /** Réponse interne de l'équipe, jamais exposée publiquement. */
      internalNote: a.string(),
      items: a.hasMany('OrderItem', 'orderRequestId'),
    })
    .secondaryIndexes((index) => [index('reference')])
    .authorization((allow) => [allow.publicApiKey().to(['create']), allow.group('admin')]),

  OrderItem: a
    .model({
      orderRequestId: a.id().required(),
      orderRequest: a.belongsTo('OrderRequest', 'orderRequestId'),
      productId: a.id(),
      product: a.belongsTo('Product', 'productId'),
      productName: a.string().required(),
      strength: a.string(),
      quantity: a.integer().required(),
    })
    .authorization((allow) => [allow.publicApiKey().to(['create']), allow.group('admin')]),

  /**
   * Demande d'ordonnance. `fileKey` pointe vers un objet S3 privé ; le fichier
   * n'est JAMAIS servi publiquement, l'équipe y accède via une URL signée
   * de courte durée depuis le back-office.
   */
  PrescriptionRequest: a
    .model({
      reference: a.string().required(),
      customerName: a.string().required(),
      phone: a.string().required(),
      message: a.string(),
      fileKey: a.string().required(),
      fileType: a.string(),
      fileSize: a.integer(),
      locale: a.string(),
      status: a.ref('RequestStatus'),
      internalNote: a.string(),
    })
    .secondaryIndexes((index) => [index('reference')])
    .authorization((allow) => [allow.authenticated().to(['create']), allow.group('admin')]),

  ContactMessage: a
    .model({
      name: a.string().required(),
      phone: a.string(),
      email: a.string(),
      message: a.string().required(),
      locale: a.string(),
      status: a.ref('RequestStatus'),
    })
    .authorization((allow) => [allow.publicApiKey().to(['create']), allow.group('admin')]),

  // ── Paramétrage de l'établissement ────────────────────────────────────────

  /**
   * Écrase les valeurs de `config/site.ts` lorsqu'elles sont renseignées ici.
   * Un seul enregistrement est attendu (`id: 'default'`).
   */
  BusinessSettings: a
    .model({
      businessName: a.string(),
      phones: a.string().array(),
      countryCode: a.string(),
      whatsappPhone: a.string(),
      email: a.string(),
      address: a.string(),
      city: a.string(),
      country: a.string(),
      mapsUrl: a.string(),
      mapsEmbedUrl: a.string(),
      /** JSON sérialisé : [{ day, open, close }] */
      openingHours: a.string(),
      facebook: a.string(),
      instagram: a.string(),
      currencyCode: a.string(),
      currencySymbol: a.string(),
      currencyName: a.string(),
      showPrices: a.boolean().default(false),
      lowStockThreshold: a.integer().default(10),
    })
    .authorization((allow) => [
      allow.publicApiKey().to(['read']),
      allow.authenticated().to(['read']),
      allow.group('admin'),
    ]),

  /** Blocs de contenu éditoriaux modifiables depuis l'admin. */
  ContentSection: a
    .model({
      key: a.string().required(),
      titleFr: a.string(),
      titleAr: a.string(),
      titleEn: a.string(),
      bodyFr: a.string(),
      bodyAr: a.string(),
      bodyEn: a.string(),
      published: a.boolean().default(true),
    })
    .secondaryIndexes((index) => [index('key')])
    .authorization((allow) => [
      allow.publicApiKey().to(['read']),
      allow.authenticated().to(['read']),
      allow.group('admin'),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: {
      // Clé publique : lecture du catalogue + dépôt de demandes uniquement.
      expiresInDays: 365,
    },
  },
});
