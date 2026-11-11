import React from 'react';
import { 
  Key, Users, AtSign, Mail, HardDrive, MessageSquare, FileSignature, Bot, Settings
} from 'lucide-react';

const navItems = [
  { id: 'settings', label: 'Auth & Settings', icon: Settings, key: '1' },
  { id: 'groups', label: 'Groups', icon: Users, key: '2' },
  { id: 'aliases', label: 'Aliases', icon: AtSign, key: '3' },
  { id: 'email', label: 'Email Control', icon: Mail, key: '4' },
  { id: 'drive', label: 'Drive Management', icon: HardDrive, key: '5' },
  { id: 'chat', label: 'Chat Audit', icon: MessageSquare, key: '6' },
  { id: 'signatures', label: 'Signatures', icon: FileSignature, key: '7' },
  { id: 'gemini', label: 'Gemini HR', icon: Bot, key: '8' },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="w-64 bg-slate-50/50 border-r border-slate-200/80 min-h-[calc(100vh-4rem)] p-3.5 flex flex-col justify-between shrink-0 font-sans">
      <div className="space-y-1">
        <div className="px-3 py-1.5 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>WORKSPACE MODULES</span>
          <span className="font-mono text-[9px] text-slate-400">8 ACTIVE</span>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-100' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* High-Density System State Footer */}
      <div className="p-3 bg-white border border-slate-200/80 rounded-lg text-xs space-y-1.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] font-bold text-slate-900 uppercase tracking-wide">CLIENT-SIDE ASSERTION</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <p className="text-[11px] text-slate-500 leading-snug">
          Zero external database storage. Session key assertions run directly against Google REST APIs.
        </p>
      </div>
    </aside>
  );
}
