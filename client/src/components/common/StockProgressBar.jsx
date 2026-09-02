import React from 'react';

export default function StockProgressBar({ currentQuantity, threshold, weeklyUsage, status, className = '' }) {
  const qty = Math.max(0, Number(currentQuantity) || 0);
  const thresh = Math.max(0.1, Number(threshold) || 1);
  const usage = Math.max(0, Number(weeklyUsage) || 1);

  // Target standard stock capacity (approx 2-3 weeks of usage or 2.5x threshold)
  const maxCapacity = Math.max(thresh * 2.5, usage * 2, qty, 1);
  const percentage = Math.min(100, Math.max(0, (qty / maxCapacity) * 100));
  const thresholdPercentage = Math.min(95, Math.max(5, (thresh / maxCapacity) * 100));

  let barColor = 'bg-emerald-500';
  if (status === 'out_of_stock' || qty <= 0) {
    barColor = 'bg-rose-500';
  } else if (status === 'low' || qty <= thresh) {
    barColor = 'bg-amber-500';
  }

  return (
    <div className={`w-full relative ${className}`}>
      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {/* Threshold marker tick */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-slate-400 dark:bg-slate-500 opacity-40 pointer-events-none"
        style={{ left: `${thresholdPercentage}%` }}
        title={`Threshold: ${thresh}`}
      />
    </div>
  );
}
