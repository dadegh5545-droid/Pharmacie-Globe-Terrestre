'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Authenticator, translations, useAuthenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession, signOut as amplifySignOut } from 'aws-amplify/auth';
import { I18n } from 'aws-amplify/utils';
import { ShieldX } from 'lucide-react';
import '@aws-amplify/ui-react/styles.css';
import { Button } from '@/components/ui/button';
import { backendReady } from '@/lib/amplify-client';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { defaultLocale } from '@/lib/i18n/config';

I18n.putVocabularies(translations);
I18n.setLanguage('fr');

const dict = getDictionary(defaultLocale);

/**
 * Vérifie que l'utilisateur connecté appartient bien au groupe Cognito
 * `admin`. L'authentification seule ne suffit pas : n'importe quel client
 * peut créer un compte, seul le groupe donne accès au back-office.
 *
 * Cette vérification est doublée côté serveur par les règles d'autorisation
 * du schéma AppSync — une requête d'un compte hors groupe échoue même si
 * l'interface était contournée.
 */
function GroupGate({ children }: { children: ReactNode }) {
  const { user } = useAuthenticator((context) => [context.user]);
  const [state, setState] = useState<'checking' | 'allowed' | 'denied'>('checking');

  useEffect(() => {
    let cancelled = false;

    fetchAuthSession()
      .then((session) => {
        const groups = session.tokens?.accessToken?.payload['cognito:groups'];
        const isAdmin = Array.isArray(groups) && groups.includes('admin');
        if (!cancelled) setState(isAdmin ? 'allowed' : 'denied');
      })
      .catch(() => {
        if (!cancelled) setState('denied');
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (state === 'checking') {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        {dict['state.loading']}
      </div>
    );
  }

  if (state === 'denied') {
    return (
      <div className="grid min-h-screen place-items-center px-6 text-center">
        <div>
          <ShieldX className="mx-auto size-12 text-destructive" aria-hidden="true" />
          <h1 className="mt-5 text-xl font-bold">{dict['admin.restricted']}</h1>
          <Button variant="outline" className="mt-6" onClick={() => amplifySignOut()}>
            {dict['admin.signOut']}
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function AdminGuard({ children }: { children: ReactNode }) {
  if (!backendReady) {
    return (
      <div className="grid min-h-screen place-items-center px-6 text-center">
        <div className="max-w-md">
          <ShieldX className="mx-auto size-12 text-amber-500" aria-hidden="true" />
          <h1 className="mt-5 text-xl font-bold">{dict['admin.title']}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {dict['state.demoMode']}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Lancez <code className="rounded bg-muted px-1.5 py-0.5">npx ampx sandbox</code> pour
            activer le back-office.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Authenticator hideSignUp className="min-h-screen">
      <GroupGate>{children}</GroupGate>
    </Authenticator>
  );
}
