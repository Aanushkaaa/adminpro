import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import CommandPalette from './components/CommandPalette';
import SettingsModule from './modules/SettingsModule';
import GroupsModule from './modules/GroupsModule';
import AliasesModule from './modules/AliasesModule';
import EmailModule from './modules/EmailModule';
import DriveModule from './modules/DriveModule';
import ChatModule from './modules/ChatModule';
import SignaturesModule from './modules/SignaturesModule';
import GeminiHrModule from './modules/GeminiHrModule';

function DashboardContent() {
  const [activeTab, setActiveTab] = useState('settings');
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const renderModule = () => {
    switch (activeTab) {
      case 'settings': return <SettingsModule />;
      case 'groups': return <GroupsModule />;
      case 'aliases': return <AliasesModule />;
      case 'email': return <EmailModule />;
      case 'drive': return <DriveModule />;
      case 'chat': return <ChatModule />;
      case 'signatures': return <SignaturesModule />;
      case 'gemini': return <GeminiHrModule />;
      default: return <SettingsModule />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar onOpenCommandPalette={() => setIsPaletteOpen(true)} />
      <div className="flex-1 flex w-full">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-8 overflow-y-auto">
          {renderModule()}
        </main>
      </div>

      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}
