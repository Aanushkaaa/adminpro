import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = "Querying live Google Workspace API..." }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-md text-slate-900 text-left shadow-2xs font-sans">
      <Loader2 className="w-4 h-4 animate-spin text-slate-900 shrink-0" />
      <div>
        <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">PROCESSING REQUEST</div>
        <div className="text-xs font-mono text-slate-800">{message}</div>
      </div>
    </div>
  );
}
