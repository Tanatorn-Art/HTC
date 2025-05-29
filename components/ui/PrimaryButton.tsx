'use client';

import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function PrimaryButton({ children, className, ...props }: PrimaryButtonProps) {
  return (
    <button
      {...props}
      className={clsx(
        'bg-[var(--primary-color)] hover:bg-[var(--primary-color-light)] text-white px-4 py-2 rounded-xl font-semibold shadow-sm transition-all',
        className
      )}
    >
      {children}
    </button>
  );
}
