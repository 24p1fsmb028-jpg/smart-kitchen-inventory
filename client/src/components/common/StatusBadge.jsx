import React from 'react';

export default function StatusBadge({ status, className = '', size = 'md' }) {
  let label = 'In stock';
  let badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60';
  let dotStyle = 'bg-emerald-500';

  if (status === 'out_of_stock') {
    label = 'Out of stock';
    badgeStyle = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60';
    dotStyle = 'bg-rose-500 animate-pulse';
  } else if (status === 'low') {
    label = 'Low stock';
    badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60';
    dotStyle = 'bg-amber-500';
  }

  const sizeClasses = size === 'sm'
    ? 'text-xs px-2 py-0.5 gap-1.5'
    : 'text-xs font-medium px-2.5 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full border transition-colors ${sizeClasses} ${badgeStyle} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyle}`} />
      <span>{label}</span>
    </span>
  );
}
