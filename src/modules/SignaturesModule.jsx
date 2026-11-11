import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileSignature, Send, Save, RefreshCw, Plus, CheckCircle2, Loader2, Users } from 'lucide-react';
import StatusAlert from '../components/StatusAlert';
import ExportButton from '../components/ExportButton';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import { 
  apiSaveSignatureTemplate, apiDeploySignatureToGmail, 
  apiFetchSignatureUsersFromSheet, apiSyncSignaturesToSheet 
} from '../services/api';

const DEFAULT_TEMPLATE = `<div style="font-family: system-ui, -apple-system, sans-serif; color: #333; font-size: 14px; line-height: 1.4;">
  <p style="margin: 0; font-weight: bold; font-size: 16px; color: #1a73e8;"><?=name?></p>
  <p style="margin: 0; color: #5f6368; font-weight: 500;"><?=position?> | <?=dept_name?></p>
  <p style="margin: 0; color: #5f6368; font-weight: bold;"><?=company?></p>
  <p style="margin: 4px 0 0 0; color: #1a73e8; font-size: 13px;">
    Email: <?=email?> &nbsp;|&nbsp; Phone: <?=pin?>
  </p>
</div>`;

export default function SignaturesModule() {
  const { config } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('editor');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // Master Template State
  const [templateHtml, setTemplateHtml] = useState(
    localStorage.getItem('master_signature_template') || DEFAULT_TEMPLATE
  );

  // Typography font state
  const [selectedFont, setSelectedFont] = useState("Inter, system-ui, -apple-system, sans-serif");

  const fontOptions = [
    { name: 'Inter / System Sans', value: 'Inter, system-ui, -apple-system, sans-serif' },
    { name: 'Segoe UI / Modern Sans', value: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
    { name: 'Georgia / Executive Serif', value: 'Georgia, Cambria, "Times New Roman", Times, serif' },
    { name: 'Trebuchet MS / Dynamic', value: "'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', sans-serif" },
    { name: 'Monospace / Technical', value: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace" }
  ];

  const handleFontChange = (newFont) => {
    setSelectedFont(newFont);
    // Replace font-family in templateHtml
    const updated = templateHtml.replace(/font-family:[^;]+;/i, `font-family: ${newFont};`);
    setTemplateHtml(updated);
  };

  // Editable Users List (Synced with Google Sheet)
  const [users, setUsers] = useState([]);
  const [deployingRow, setDeployingRow] = useState(null);

  // Load signature users from Google Sheet or Directory on mount
  useEffect(() => {
    loadUsers();
  }, [config]);

  const loadUsers = async () => {
    try {
      const data = await apiFetchSignatureUsersFromSheet(config);
      setUsers(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveTemplate = async () => {
    setLoading(true);
    try {
      const res = await apiSaveSignatureTemplate(config, templateHtml);
      setStatus({ type: 'success', message: res.message });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleUserChange = (id, field, value) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, [field]: value } : u));
  };

  const handleAddUserRow = () => {
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    setUsers([...users, {
      id: newId,
      name: 'New User',
      email: `user${newId}@demo.econz.net`,
      position: 'Team Member',
      dept: 'General',
      company: 'Econz Digital',
      pin: '+91 9876543210',
      status: 'Draft'
    }]);
  };

  const handleSyncToSheet = async () => {
    setLoading(true);
    try {
      const res = await apiSyncSignaturesToSheet(config, users);
      setStatus({ type: 'success', message: res.message });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeploySignatureRow = async (userData) => {
    setDeployingRow(userData.id);
    setStatus(null);
    try {
      const res = await apiDeploySignatureToGmail(config, userData, templateHtml);
      setStatus({ type: 'success', message: res.message });
      setUsers(prev => prev.map(u => u.id === userData.id ? { ...u, status: 'Deployed Live to Gmail' } : u));
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setDeployingRow(null);
    }
  };

  // Preview replacement using first user's values or fallback
  const previewSample = users[0] || {
    name: 'Anushka P',
    position: 'Super Admin',
    dept: 'IT Admin',
    company: 'Econz Digital',
    email: 'anushka.p@demo.econz.net',
    pin: '+91 98765 43210'
  };

  const previewHtml = templateHtml
    .replace(/<\?=name\?>/g, previewSample.name)
    .replace(/<\?=position\?>/g, previewSample.position)
    .replace(/<\?=dept_name\?>/g, previewSample.dept)
    .replace(/<\?=company\?>/g, previewSample.company)
    .replace(/<\?=email\?>/g, previewSample.email)
    .replace(/<\?=pin\?>/g, previewSample.pin);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Email Signature Management</h1>
          <p className="text-sm text-gray-500 mt-1">Design HTML master signature templates, sync editable records with Google Sheet, and deploy directly to user Gmail accounts.</p>
        </div>
        <ExportButton data={users} filename="email_signatures_deployments" />
      </div>

      <StatusAlert status={status} onClose={() => setStatus(null)} />

      {/* Subtabs Bar */}
      <div className="flex border-b border-gray-200 gap-2">
        <button
          onClick={() => setActiveSubTab('editor')}
          className={`flex items-center gap-2 px-4 py-2.5 font-medium text-sm border-b-2 transition ${
            activeSubTab === 'editor'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileSignature className="w-4 h-4" />
          <span>Master Template Editor</span>
        </button>
        <button
          onClick={() => setActiveSubTab('deployment')}
          className={`flex items-center gap-2 px-4 py-2.5 font-medium text-sm border-b-2 transition ${
            activeSubTab === 'deployment'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Sheet & User Deployment</span>
        </button>
      </div>

      {/* SUBTAB 1: Master Template Editor */}
      {activeSubTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="space-y-3 pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-gray-900 whitespace-nowrap">HTML Master Template</h2>
                <button
                  onClick={handleSaveTemplate}
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm shrink-0 whitespace-nowrap"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{loading ? 'Saving...' : 'Save Master Template'}</span>
                </button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-xs text-gray-500">Configure global typography stack and HTML structure.</p>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Font Stack:</span>
                  <select
                    value={selectedFont}
                    onChange={(e) => handleFontChange(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-xl text-xs bg-white text-gray-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none shrink-0"
                    title="Select Template Font Family"
                  >
                    {fontOptions.map((f, i) => (
                      <option key={i} value={f.value}>{f.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <textarea
              rows={12}
              value={templateHtml}
              onChange={e => setTemplateHtml(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-200">
              <strong>Supported Placeholders:</strong> <code>&lt;?=name?&gt;</code>, <code>&lt;?=position?&gt;</code>, <code>&lt;?=dept_name?&gt;</code>, <code>&lt;?=company?&gt;</code>, <code>&lt;?=email?&gt;</code>, <code>&lt;?=pin?&gt;</code>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Live Preview ({previewSample.name})</h2>
            <div className="p-6 border border-gray-200 rounded-xl bg-gray-50 min-h-[220px]">
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: Sheet & User Deployment (Fully Editable & Synced) */}
      {activeSubTab === 'deployment' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-gray-900">Editable Signature Signers & Sheet Sync</h2>
              <p className="text-xs text-gray-500">Edit fields inline below. Changes sync with your Google Sheet and deploy live to user Gmail accounts.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddUserRow}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Signer Entry</span>
              </button>
              <button
                onClick={handleSyncToSheet}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                <span>{loading ? 'Syncing...' : 'Sync Signatures with Google Sheet'}</span>
              </button>
            </div>
          </div>

          {users.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No Signature Signers Registered"
              description="Click 'Add Signer Entry' above or sync with your Google Sheet to add users."
            />
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50 font-semibold uppercase text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-3">Name</th>
                    <th className="px-3 py-3">Email Address</th>
                    <th className="px-3 py-3">Position</th>
                    <th className="px-3 py-3">Department</th>
                    <th className="px-3 py-3">Company</th>
                    <th className="px-3 py-3">Phone / PIN</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          value={u.name}
                          onChange={e => handleUserChange(u.id, 'name', e.target.value)}
                          className="w-28 px-2 py-1 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="email"
                          value={u.email}
                          onChange={e => handleUserChange(u.id, 'email', e.target.value)}
                          className="w-40 px-2 py-1 border border-gray-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          value={u.position}
                          onChange={e => handleUserChange(u.id, 'position', e.target.value)}
                          className="w-28 px-2 py-1 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          value={u.dept}
                          onChange={e => handleUserChange(u.id, 'dept', e.target.value)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          value={u.company}
                          onChange={e => handleUserChange(u.id, 'company', e.target.value)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          value={u.pin}
                          onChange={e => handleUserChange(u.id, 'pin', e.target.value)}
                          className="w-28 px-2 py-1 border border-gray-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          u.status.includes('Deployed') ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {u.status.includes('Deployed') && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          <span>{u.status}</span>
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={() => handleDeploySignatureRow(u)}
                          disabled={deployingRow === u.id}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-3 py-1.5 rounded-lg text-xs transition disabled:opacity-50 inline-flex items-center gap-1"
                        >
                          {deployingRow === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                          <span>{deployingRow === u.id ? 'Deploying...' : 'Deploy Live Signature'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
