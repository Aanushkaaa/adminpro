import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Key, Database, ShieldAlert, Lock, Cpu, Sparkles, Loader2, Copy, Check, BookOpen, X } from 'lucide-react';
import StatusAlert from '../components/StatusAlert';
import { fetchAccessTokenFromServiceAccount } from '../services/api';

const defaultSaJson = `{
  "type": "service_account",
  "project_id": "your-gcp-project-id",
  "private_key_id": "your-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\\nPASTE_YOUR_SERVICE_ACCOUNT_PRIVATE_KEY_HERE\\n-----END PRIVATE KEY-----\\n",
  "client_email": "your-service-account@your-gcp-project.iam.gserviceaccount.com",
  "client_id": "YOUR_NUMERIC_CLIENT_ID",
  "admin_email": "admin@yourcompany.com"
}`;

export default function SettingsModule() {
  const { config, updateConfig, clearConfig } = useAuth();
  const [showDwdGuide, setShowDwdGuide] = useState(false);
  const [copiedScopes, setCopiedScopes] = useState(false);
  const [formData, setFormData] = useState({
    adminEmail: config.adminEmail || '',
    domain: config.domain || '',
    sheetId: config.sheetId || '',
    accessToken: config.accessToken || '',
    serviceAccountJson: config.serviceAccountJson || '',
    clientLogoUrl: config.clientLogoUrl || '',
  });

  const [status, setStatus] = useState(null);
  const [loadingToken, setLoadingToken] = useState(false);

  const handleGenerateTokenFromSA = async () => {
    if (!formData.serviceAccountJson) {
      setStatus({ type: 'error', message: 'Please paste your Service Account JSON credentials first.' });
      return;
    }
    setLoadingToken(true);
    setStatus({ type: 'info', message: 'Exchanging Service Account Private Key for live Google OAuth Access Token...' });
    try {
      const token = await fetchAccessTokenFromServiceAccount(formData.serviceAccountJson, formData.adminEmail);
      const newConfig = { ...formData, accessToken: token };
      setFormData(newConfig);
      updateConfig(newConfig);
      setStatus({ type: 'success', message: `Token generated successfully! Access Token starting with "${token.substring(0, 10)}..." is active for live Google REST APIs.` });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoadingToken(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.adminEmail || !formData.domain) {
      setStatus({ type: 'error', message: 'Admin Super Email and Domain Name are required.' });
      return;
    }

    if (!formData.accessToken && formData.serviceAccountJson) {
      await handleGenerateTokenFromSA();
    } else {
      updateConfig(formData);
      setStatus({ type: 'success', message: 'Configuration saved in browser session memory!' });
    }
  };

  return (
    <div className="max-w-4xl space-y-6 font-sans">
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Authorization & API Configuration</h1>
        <p className="text-xs text-slate-500 mt-0.5">Service Account Domain-Wide Delegation (DWD), RSA Key assertion, and audit sheet integration.</p>
      </div>

      <StatusAlert status={status} onClose={() => setStatus(null)} />

      <div className="bg-white border border-slate-200 border-l-4 border-l-amber-500 rounded-md p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-slate-800 text-xs leading-relaxed shadow-2xs">
        <div className="flex gap-3">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-mono font-bold text-slate-900 uppercase tracking-wide">AUTOMATIC OAUTH TOKEN EXCHANGE:</span> Service Account JSON automatically signs RSA-256 assertions to generate live Google REST tokens.
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowDwdGuide(true)}
          className="bg-slate-50 hover:bg-slate-100 text-slate-900 font-mono font-semibold px-3 py-1 rounded text-[11px] whitespace-nowrap transition border border-slate-300 shrink-0"
        >
          DWD SETUP GUIDE
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 hover:border-slate-400 transition-colors duration-150 rounded-md p-5 shadow-2xs space-y-6">
        
        {/* Workspace Admin Credentials */}
        <div className="space-y-4">
          <h2 className="text-sm font-mono font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
            <Key className="w-4 h-4 text-slate-600" />
            <span>Workspace Domain & Admin Credentials</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1">Super Admin Email</label>
              <input
                type="email"
                placeholder="admin@yourcompany.com"
                value={formData.adminEmail}
                onChange={e => setFormData({ ...formData, adminEmail: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-slate-300 text-xs font-mono focus:border-slate-900 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Workspace Domain</label>
              <input
                type="text"
                placeholder="yourcompany.com"
                value={formData.domain}
                onChange={e => setFormData({ ...formData, domain: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Service Account JSON */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-600" />
              <span>Service Account JSON Credentials</span>
            </h2>
            <button
              type="button"
              onClick={handleGenerateTokenFromSA}
              disabled={loadingToken}
              className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition shadow-sm disabled:opacity-50"
            >
              {loadingToken ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{loadingToken ? 'Generating Token...' : 'Auto-Generate Access Token'}</span>
            </button>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Service Account Key JSON</label>
            <textarea
              rows={6}
              placeholder="Paste Service Account JSON containing PRIVATE_KEY, CLIENT_EMAIL, ADMIN_EMAIL..."
              value={formData.serviceAccountJson}
              onChange={e => setFormData({ ...formData, serviceAccountJson: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Live OAuth Access Token */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-600" />
            <span>Active OAuth Access Token</span>
          </h2>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">OAuth Access Token</label>
            <input
              type="text"
              placeholder="Auto-generated upon clicking 'Auto-Generate Access Token'..."
              value={formData.accessToken}
              onChange={e => setFormData({ ...formData, accessToken: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-mono text-indigo-700 font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Client Co-Branding & Organization Logo */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              <span>SaaS Provider & Client Co-Branding</span>
            </h2>
            <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
              Econz Logo Unchangeable
            </span>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-700">Permanent Provider Logo:</span>
              <img src="/econz-logo.png" alt="Econz Digital" className="h-7 object-contain bg-white px-2 py-0.5 rounded border border-gray-200" />
            </div>
            
            <div className="space-y-1 pt-2 border-t border-gray-200">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">Client Custom Organization Logo (URL or Upload)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://client-company.com/logo.png or data:image/..."
                  value={formData.clientLogoUrl || ''}
                  onChange={e => setFormData({ ...formData, clientLogoUrl: e.target.value })}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <label className="cursor-pointer bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 font-semibold px-3 py-2.5 rounded-xl text-xs flex items-center gap-1 transition shrink-0">
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setFormData({ ...formData, clientLogoUrl: event.target.result });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
              <p className="text-[11px] text-gray-500">Your custom client logo will appear side-by-side with Econz in the main header.</p>
            </div>
          </div>
        </div>

        {/* Client Audit Google Sheet */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-600" />
            <span>Audit Log Google Sheet ID</span>
          </h2>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Google Sheet ID</label>
            <input
              type="text"
              placeholder="1WXt7PFd94nDjKcbNc2LWHoq-F2D47DQ_vAZCh8F9dI"
              value={formData.sheetId}
              onChange={e => {
                let val = e.target.value;
                if (val.includes('/d/')) val = val.split('/d/')[1].split('/')[0];
                setFormData({ ...formData, sheetId: val });
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition shadow-sm"
          >
            Connect Google APIs & Save Config
          </button>
          <button
            type="button"
            onClick={() => {
              clearConfig();
              setFormData({ adminEmail: '', domain: '', sheetId: '', accessToken: '', serviceAccountJson: '' });
              setStatus({ type: 'info', message: 'Cleared session credentials.' });
            }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2.5 rounded-xl text-sm transition"
          >
            Clear Credentials
          </button>
        </div>

      </form>

      {/* DWD Onboarding Slide-Over Drawer Modal */}
      {showDwdGuide && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <span>Domain-Wide Delegation (DWD) Guide</span>
                </div>
                <button
                  onClick={() => setShowDwdGuide(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs text-gray-600 leading-relaxed">
                <p>
                  To allow `AdminPro` to manage email signatures, aliases, groups, and drive storage across your organization, your Service Account Client ID must be authorized in Google Workspace Admin Console.
                </p>

                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl space-y-1">
                  <div className="font-semibold text-indigo-900">Service Account Unique Client ID</div>
                  <code className="block font-mono text-indigo-700 font-bold bg-white p-2 rounded border border-indigo-200 text-[11px] select-all">
                    100592473160928860535
                  </code>
                </div>

                <div className="space-y-2">
                  <div className="font-bold text-gray-900">Step-by-step Setup Instructions:</div>
                  <ol className="list-decimal list-inside space-y-1.5 pl-1">
                    <li>Go to <a href="https://admin.google.com" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-semibold">admin.google.com</a> and sign in as Super Admin.</li>
                    <li>Navigate to <strong>Security &gt; API Controls &gt; Domain-Wide Delegation</strong>.</li>
                    <li>Click <strong>Add New</strong>.</li>
                    <li>Paste Client ID: <code className="font-bold">100592473160928860535</code></li>
                    <li>Paste all required OAuth scopes (copied below) into OAuth Scopes field.</li>
                    <li>Click <strong>Authorize</strong>.</li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">Required OAuth Scopes</span>
                    <button
                      type="button"
                      onClick={() => {
                        const scopes = [
                          'https://www.googleapis.com/auth/admin.directory.user',
                          'https://www.googleapis.com/auth/admin.directory.group',
                          'https://www.googleapis.com/auth/admin.directory.user.alias',
                          'https://www.googleapis.com/auth/gmail.settings.basic',
                          'https://www.googleapis.com/auth/gmail.settings.sharing',
                          'https://www.googleapis.com/auth/gmail.readonly',
                          'https://www.googleapis.com/auth/gmail.modify',
                          'https://www.googleapis.com/auth/drive.readonly',
                          'https://www.googleapis.com/auth/chat.spaces.readonly',
                          'https://www.googleapis.com/auth/spreadsheets'
                        ].join(',');
                        navigator.clipboard.writeText(scopes);
                        setCopiedScopes(true);
                        setTimeout(() => setCopiedScopes(false), 2000);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      {copiedScopes ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedScopes ? 'Scopes Copied!' : 'Copy All Scopes'}</span>
                    </button>
                  </div>
                  <div className="bg-gray-900 text-emerald-400 p-3 rounded-xl font-mono text-[10px] space-y-1 max-h-48 overflow-y-auto">
                    <div>https://www.googleapis.com/auth/admin.directory.user</div>
                    <div>https://www.googleapis.com/auth/admin.directory.group</div>
                    <div>https://www.googleapis.com/auth/admin.directory.user.alias</div>
                    <div>https://www.googleapis.com/auth/gmail.settings.basic</div>
                    <div>https://www.googleapis.com/auth/gmail.settings.sharing</div>
                    <div>https://www.googleapis.com/auth/gmail.readonly</div>
                    <div>https://www.googleapis.com/auth/gmail.modify</div>
                    <div>https://www.googleapis.com/auth/drive.readonly</div>
                    <div>https://www.googleapis.com/auth/chat.spaces.readonly</div>
                    <div>https://www.googleapis.com/auth/spreadsheets</div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowDwdGuide(false)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl transition"
            >
              Done / Close Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
