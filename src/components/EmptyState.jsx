import React from 'react';
import { FileSearch } from 'lucide-react';

export default function EmptyState({ 
  icon: Icon = FileSearch, 
  title = "No Records Found", 
  description = "Get started by executing a search or query using the form above.",
  actionButton = null 
}) {
  return (
    <div className="flex flex-col sm:flex-row items-start gap-4 p-5 bg-white border border-slate-200 hover:border-slate-400 transition-colors duration-150 rounded-md text-left shadow-2xs font-sans">
      <div className="w-9 h-9 rounded bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
        <Icon className="w-4 h-4 text-slate-600" />
      </div>
      <div className="space-y-1 flex-1">
        <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wide">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed max-w-xl">{description}</p>
        {actionButton && <div className="pt-2">{actionButton}</div>}
      </div>
    </div>
  );
}
