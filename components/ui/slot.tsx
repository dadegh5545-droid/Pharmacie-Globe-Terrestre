'use client';

import { Children, cloneElement, isValidElement, forwardRef, type ReactElement } from 'react';
import { cn } from '@/lib/utils';

/**
 * Equivalent minimal de `@radix-ui/react-slot` : fusionne les props du parent
 * dans son unique enfant, ce qui permet `<Button asChild><Link/></Button>`.
 */
type SlotProps = React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode };

export const Slot = forwardRef<HTMLElement, SlotProps>(({ children, className, ...props }, ref) => {
  const child = Children.only(children) as ReactElement<Record<string, unknown>>;
  if (!isValidElement(child)) return null;

  return cloneElement(child, {
    ...props,
    ...(child.props as Record<string, unknown>),
    className: cn(className, (child.props as { className?: string }).className),
    ref,
  } as Record<string, unknown>);
});
Slot.displayName = 'Slot';
