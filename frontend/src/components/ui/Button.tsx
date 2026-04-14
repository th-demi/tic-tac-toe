import type { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

export function Button({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(
        'w-full rounded-lg bg-cyan-500 py-3 font-medium transition hover:opacity-90',
        className
      )}
      {...props}
    />
  );
}