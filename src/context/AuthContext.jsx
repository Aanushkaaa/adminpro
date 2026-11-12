import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // All configuration credentials are held in browser memory / sessionStorage ONLY.
  // NO data is stored on external developer databases.
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('gws_admin_config') || sessionStorage.getItem('gws_admin_config');
    return saved ? JSON.parse(saved) : {
      adminEmail: '',
      domain: '',
      sheetId: '',
      serviceAccountJson: '',
      apiKey: '',
      isAuthorized: false,
    };
  });

  useEffect(() => {
    localStorage.setItem('gws_admin_config', JSON.stringify(config));
  }, [config]);

  const updateConfig = (newSettings) => {
    setConfig(prev => ({
      ...prev,
      ...newSettings,
      isAuthorized: !!(newSettings.adminEmail && newSettings.sheetId)
    }));
  };

  const clearConfig = () => {
    localStorage.removeItem('gws_admin_config');
    sessionStorage.removeItem('gws_admin_config');
    setConfig({
      adminEmail: '',
      domain: '',
      sheetId: '',
      serviceAccountJson: '',
      apiKey: '',
      isAuthorized: false,
    });
  };

  return (
    <AuthContext.Provider value={{ config, updateConfig, clearConfig }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
