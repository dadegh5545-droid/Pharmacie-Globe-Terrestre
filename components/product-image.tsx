'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Pill } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Visuel produit à ratio constant (1:1), `object-contain` pour ne jamais
 * déformer ni recadrer l'emballage — le texte de la boîte reste lisible et
 * intact. Si le fichier n'a pas encore été déposé dans `public/products/`,
 * un visuel neutre le remplace : aucune image cassée n'apparaît.
 */
export function ProductImage({
  src,
  alt,
  priority = false,
  sizes = '(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 240px',
  className,
}: {
  src: string | null;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <div
      className={cn(
        'relative aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-br from-primary-50 to-muted',
        className,
      )}
    >
      {showImage ? (
        <Image
          src={src as string}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : 'lazy'}
          onError={() => setFailed(true)}
          className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="grid size-full place-items-center text-primary-200" aria-hidden="true">
          <Pill className="size-1/3" strokeWidth={1.25} />
        </div>
      )}
    </div>
  );
}
