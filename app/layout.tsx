import type { ReactNode } from 'react';

/**
 * Layout racine minimal : la vraie balise <html> est produite par
 * `app/[locale]/layout.tsx`, qui seul connaît la langue et la direction.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
