import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Fusionne des classes Tailwind en resolvant les conflits. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Retire les caracteres de controle et borne la longueur d'une saisie libre. */
export function sanitizeText(value: string, maxLength = 1000): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, maxLength);
}

/** Normalise pour la recherche : minuscules, sans accents latins ni diacritiques arabes. */
export function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036F]/g, '')
    .replace(/[\u064B-\u0652\u0670]/g, '');
}
