import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`bg-white border border-[var(--border-color)] rounded-2xl shadow-sm p-4 ${className}`}
    >
      {children}
    </div>
  );
}
