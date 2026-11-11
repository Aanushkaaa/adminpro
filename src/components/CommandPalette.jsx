import React, { useState, useEffect } from 'react';
import { 
  Search, 
  PenTool, 
  AtSign, 
  Mail, 
  Users, 
  MessageSquare, 
  HardDrive, 
  Bot, 
  Settings, 
  Command, 
  X 
} from 'lucide-react';

const MODULE_OPTIONS = [
  { id: 'signatures', label: 'Signatures & Master Templates', icon: PenTool, key: '1', desc: 'Manage enterprise email signatures & live Gmail deployment' },
  { id: 'aliases', label: 'User Email Aliases', icon: AtSign, key: '2', desc: 'List, assign, and manage domain user email aliases' },
  { id: 'email', label: 'Email Inspection & Recall', icon: Mail, key: '3', desc: 'Recall emails across domain mailboxes and audit message counts' },
  { id: 'groups', label: 'Google Groups Management', icon: Users, key: '4', desc: 'Create groups, add members, and configure access policies' },
  { id: 'chat', label: 'Domain Chat Spaces', icon: MessageSquare, key: '5', desc: 'List and manage Google Chat spaces and memberships' },
  { id: 'drive', label: 'Drive Files & Storage', icon: HardDrive, key: '6', desc: 'Search domain files and analyze storage consumption' },
  { id: 'gemini', label: 'Gemini HR Candidate Evaluation', icon: Bot, key: '7', desc: 'AI-assisted resume screening and candidate evaluation' },
  { id: 'settings', label: 'Auth & API Settings', icon: Settings, key: '8', desc: 'Manage Service Account JSON, OAuth tokens, and Audit Sheets' },
];

export default function CommandPalette({ isOpen, onClose, setActiveTab }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredModules = MODULE_OPTIONS.filter(m => 
    m.label.toLowerCase().includes(query.toLowerCase()) || 
    m.desc.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filteredModules.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredModules.length) % (filteredModules.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredModules[selectedIndex]) {
          setActiveTab(filteredModules[selectedIndex].id);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredModules, selectedIndex, setActiveTab, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/50 backdrop-blur-sm flex items-start justify-center pt-16 px-4">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden transform transition-all">
        
        {/* Search Header */}
        <div className="flex items-center px-4 border-b border-gray-200 bg-gray-50/50">
          <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
          <input
            type="text"
            className="w-full py-3.5 bg-transparent border-none text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-0"
            placeholder="Type to search modules or actions... (Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modules List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filteredModules.length > 0 ? (
            filteredModules.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition ${
                    isSelected ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{item.label}</div>
                      <div className={`text-xs ${isSelected ? 'text-indigo-100' : 'text-gray-500'}`}>{item.desc}</div>
                    </div>
                  </div>

                  <span className={`text-xs px-2 py-1 rounded font-mono font-bold ${
                    isSelected ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {item.key}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center text-sm text-gray-500">
              No matching modules found for "{query}".
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-[11px] text-gray-400 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span><strong className="text-gray-600">↑↓</strong> Navigate</span>
            <span><strong className="text-gray-600">↵</strong> Select</span>
            <span><strong className="text-gray-600">Esc</strong> Dismiss</span>
          </div>
          <span className="font-mono">GWS Admin Pro Palette</span>
        </div>

      </div>
    </div>
  );
}
