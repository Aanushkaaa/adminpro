import React from 'react';
import { Database, KeyRound, ExternalLink, Command, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onOpenCommandPalette }) {
  const { config } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 font-sans">
      <div className="w-full px-4 sm:px-6">
        <div className="flex justify-between h-14 items-center gap-4">
          
          {/* Permanent Econz Logo & Title Branding */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
              <img
                src="/econz-logo.png"
                alt="Econz Digital"
                className="h-7 object-contain"
                title="Econz Digital (Permanent SaaS Provider)"
              />
              
              {config.clientLogoUrl && (
                <>
                  <div className="h-4 w-px bg-slate-300" />
                  <img
                    src={config.clientLogoUrl}
                    alt="Client Organization Logo"
                    className="h-6 max-w-[100px] object-contain"
                    title="Client Organization Branding"
                  />
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-slate-900 tracking-tight font-sans">AdminPro</span>
            </div>
          </div>

          {/* Quick Command Palette Trigger */}
          <button
            onClick={() => onOpenCommandPalette && onOpenCommandPalette()}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-xs text-slate-500 hover:text-slate-900 transition font-sans"
            title="Open Command Palette (Cmd+K)"
          >
            <Command className="w-3.5 h-3.5 text-slate-400" />
            <span>Search commands or modules...</span>
            <kbd className="bg-white border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold shadow-2xs">⌘K</kbd>
          </button>

          {/* Real Domain & Client Audit Sheet State */}
          <div className="flex items-center gap-3 shrink-0">
            {config.sheetId ? (
              <a
                href={`https://docs.google.com/spreadsheets/d/${config.sheetId}`}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded text-xs font-mono font-semibold hover:bg-emerald-100 transition"
                title="Client Audit Google Sheet"
              >
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>SHEET: CONNECTED</span>
                <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
              </a>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded text-xs font-mono font-semibold">
                <Database className="w-3.5 h-3.5 text-amber-600" />
                <span>SHEET: UNCONNECTED</span>
              </span>
            )}

            <div className="flex items-center gap-2 border-l pl-3 border-slate-200 text-right">
              <KeyRound className="w-3.5 h-3.5 text-slate-500" />
              <div>
                <div className="text-xs font-mono font-bold text-slate-900 leading-tight">
                  {config.adminEmail || 'anushka.p@demo.econz.net'}
                </div>
                <div className="text-[10px] font-mono text-slate-500 leading-tight">
                  {config.domain || 'demo.econz.net'}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
