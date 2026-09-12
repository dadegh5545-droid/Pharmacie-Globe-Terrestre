import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetail } from '@/components/product-detail';
import { getProduct, products } from '@/data/catalog';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { isLocale, locales } from '@/lib/i18n/config';
import { productJsonLd } from '@/lib/seo';

type Params = { locale: string; slug: string };

/** Toutes les fiches produit sont pre-generees : rendu statique, SEO optimal. */
export function generateStaticParams() {
  return locales.flatMap((locale) =>
    products
      .filter((product) => product.published)
      .map((product) => ({ locale, slug: product.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = getProduct(slug);
  if (!product || !isLocale(locale)) return {};
  const dict = getDictionary(locale);

  const description =
    [product.name, product.strength, product.form?.[locale], product.packageSize?.[locale]]
      .filter(Boolean)
      .join(' — ') || dict['product.unknown'];

  return {
    title: product.name,
    description,
    alternates: {
      canonical: `/${locale}/products/${product.slug}`,
      languages: Object.fromEntries(
        locales.map((code) => [code, `/${code}/products/${product.slug}`]),
      ),
    },
    openGraph: {
      type: 'website',
      title: product.name,
      description,
      ...(product.image && { images: [{ url: product.image }] }),
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params;
  const product = getProduct(slug);
  if (!product || !product.published) notFound();

  const related = products
    .filter((item) => item.published && item.categoryId === product.categoryId && item.id !== product.id)
    .slice(0, 4);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd(product, isLocale(locale) ? locale : 'fr')),
        }}
      />
      <ProductDetail product={product} related={related} />
    </>
  );
}
