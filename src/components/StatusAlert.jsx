import React from 'react';
import { 
  CheckCircle2, AlertTriangle, Info, X 
} from 'lucide-react';

export default function StatusAlert({ status, onClose }) {
  if (!status || !status.message) return null;

  const isSuccess = status.type === 'success';
  const isInfo = status.type === 'info';

  const borderClass = isSuccess 
    ? 'border-l-4 border-l-emerald-600 border-slate-200 text-slate-900' 
    : isInfo 
    ? 'border-l-4 border-l-slate-900 border-slate-200 text-slate-900' 
    : 'border-l-4 border-l-rose-600 border-slate-200 text-slate-900';

  const iconClass = isSuccess ? 'text-emerald-600' : isInfo ? 'text-slate-900' : 'text-rose-600';
  const Icon = isSuccess ? CheckCircle2 : isInfo ? Info : AlertTriangle;

  return (
    <div className={`p-3.5 bg-white rounded-md border mb-5 flex items-start justify-between shadow-2xs font-sans ${borderClass}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${iconClass}`} />
        <div className="text-xs font-mono font-medium whitespace-pre-wrap leading-relaxed">
          {status.message}
        </div>
      </div>
      {onClose && (
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-900 transition">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
