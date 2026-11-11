import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileCode, FileText } from 'lucide-react';
import { exportData } from '../services/exporter';

export default function ExportButton({ data, filename = 'workspace_audit_data' }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!data || (Array.isArray(data) && data.length === 0)) return null;

  return (
    <div className="relative inline-block text-left font-sans">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition shadow-2xs"
      >
        <Download className="w-3.5 h-3.5 text-slate-300" />
        <span>EXPORT AUDIT REPORT</span>
      </button>

      {isOpen && (
        <div 
          className="origin-top-right absolute right-0 mt-1.5 w-48 rounded-md shadow-md bg-white border border-slate-200 divide-y divide-slate-100 z-50"
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="py-1">
            <button
              onClick={() => { exportData(data, filename, 'csv'); setIsOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 transition"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV (.csv)</span>
            </button>
            <button
              onClick={() => { exportData(data, filename, 'xlsx'); setIsOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Excel (.xlsx)</span>
            </button>
            <button
              onClick={() => { exportData(data, filename, 'json'); setIsOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 transition"
            >
              <FileCode className="w-3.5 h-3.5 text-slate-500" />
              <span>Export JSON (.json)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
