'use client';

import Link from 'next/link';

export type Crumb = {
    label: string;
    href?: string;
};

export default function Breadcrumb({ items }: { items: Crumb[] }){
    return (
        <nav className="text-sm text-slate-600 mb-4">
            {items.map((item, idx) => (
                <span key={idx} className="inline-flex item-center">
                    {idx > 0 && <span className="mx-2 text-slate-400">/</span>}
                    {item.href ? (
                        <Link href={item.href} className="hover:text-blue-600 underline">
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-slate-800 font-medium">{item.label}</span>
                    )}
                </span> 
            ))}
        </nav>
    )
}