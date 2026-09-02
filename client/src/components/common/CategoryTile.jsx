import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight } from 'lucide-react';
import DynamicIcon from './DynamicIcon';

export default function CategoryTile({ category, isAddTile, onAddClick }) {
  const navigate = useNavigate();

  if (isAddTile) {
    return (
      <button
        onClick={onAddClick}
        className="group flex flex-col items-center justify-center p-5 rounded-card border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 bg-white/50 dark:bg-slate-900/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all duration-200 min-h-[130px]"
      >
        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40 text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex items-center justify-center transition-colors">
          <Plus className="w-5 h-5" />
        </div>
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 mt-2">
          Add category
        </span>
      </button>
    );
  }

  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400',
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
  };

  const badgeColor = colorMap[category.color] || colorMap.emerald;

  return (
    <div
      onClick={() => navigate(`/category/${category.id}`)}
      className="group relative flex flex-col justify-between p-5 rounded-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle hover:shadow-card hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 cursor-pointer min-h-[130px]"
    >
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${badgeColor}`}>
          <DynamicIcon name={category.icon} className="w-5 h-5" />
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
      </div>

      <div className="mt-3">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {category.name}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {category.item_count || 0} {category.item_count === 1 ? 'item' : 'items'}
        </p>
      </div>
    </div>
  );
}
