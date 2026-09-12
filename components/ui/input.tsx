import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const fieldClasses =
  'flex w-full rounded-xl border border-input bg-white px-3.5 py-2.5 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50';

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = 'text', ...props }, ref) => (
    <input type={type} ref={ref} className={cn(fieldClasses, 'h-11', className)} {...props} />
  ),
);
Input.displayName = 'Input';

const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(fieldClasses, 'min-h-[110px] resize-y', className)} {...props} />
  ),
);
Textarea.displayName = 'Textarea';

const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select ref={ref} className={cn(fieldClasses, 'h-11 pe-8', className)} {...props} />
  ),
);
Select.displayName = 'Select';

function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn('mb-1.5 block text-sm font-medium text-foreground', className)}
      {...props}
    />
  );
}

export { Input, Textarea, Select, Label, fieldClasses };
