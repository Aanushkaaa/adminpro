import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AtSign, Plus, Trash2, List, FileSpreadsheet, Loader2, Search } from 'lucide-react';
import StatusAlert from '../components/StatusAlert';
import ExportButton from '../components/ExportButton';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import { apiListAliases, apiAddAlias, apiDeleteAlias } from '../services/api';

export default function AliasesModule() {
  const { config } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('list_user');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const [domain, setDomain] = useState(config.domain || 'demo.econz.net');
  const [primaryEmail, setPrimaryEmail] = useState('');
  const [aliasInput, setAliasInput] = useState('');
  const [aliases, setAliases] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);

  const toggleSelectRow = (email) => {
    setSelectedEmails(prev => 
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
  };

  const setSelectAll = (shouldSelectAll) => {
    if (shouldSelectAll) {
      setSelectedEmails(aliases.map(a => a.email));
    } else {
      setSelectedEmails([]);
    }
  };

  const handleFetchAliases = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const data = await apiListAliases(config, domain);
      setAliases(data);
      setStatus({ type: 'success', message: `Retrieved alias configurations for ${domain}. Action recorded in audit sheet.` });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAlias = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiAddAlias(config, primaryEmail, aliasInput);
      setStatus({ type: 'success', message: res.message });
      setAliasInput('');
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlias = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiDeleteAlias(config, primaryEmail, aliasInput);
      setStatus({ type: 'success', message: res.message });
      setAliasInput('');
      handleFetchAliases();
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const subTabs = [
    { id: 'list_user', label: 'List User Aliases', icon: List },
    { id: 'add_user', label: 'Add User Aliases', icon: Plus },
    { id: 'delete_user', label: 'Delete User Aliases', icon: Trash2 },
    { id: 'list_domain', label: 'List Domain Aliases', icon: List },
    { id: 'add_domain', label: 'Add Domain Aliases', icon: Plus },
    { id: 'delete_domain', label: 'Delete Domain Aliases', icon: Trash2 },
    { id: 'report', label: 'Group & Alias Report', icon: FileSpreadsheet },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">User & Domain Aliases Management</h1>
          <p className="text-sm text-gray-500 mt-1">Configure email routing aliases, add user aliases, and export domain reports.</p>
        </div>
        <ExportButton data={aliases} filename="user_aliases_report" />
      </div>

      <StatusAlert status={status} onClose={() => setStatus(null)} />

      {/* Subtab Navigation Bar */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-1">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          const isDelete = tab.id.includes('delete');
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 font-medium text-xs border-b-2 transition whitespace-nowrap ${
                isActive 
                  ? (isDelete ? 'border-red-600 text-red-600 font-semibold' : 'border-indigo-600 text-indigo-600 font-semibold') 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
        
        {/* LIST ALIASES */}
        {(activeSubTab.startsWith('list_') || activeSubTab === 'report') && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-gray-900">Lookup Alias Records</h2>
              <p className="text-xs text-gray-500">Enter a target user email address or domain name to inspect active routing aliases.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
              <input
                type="text"
                value={domain}
                onChange={e => setDomain(e.target.value)}
                placeholder="user@demo.econz.net or demo.econz.net"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                onClick={handleFetchAliases}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition shadow-sm disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>{loading ? 'Searching...' : 'Load Domain & User Aliases'}</span>
              </button>
            </div>

            {loading && <LoadingState message="Fetching user alias configurations from Directory API..." />}

            {!loading && aliases.length === 0 && (
              <EmptyState
                icon={AtSign}
                title="No User Aliases Retrieved"
                description="Enter a primary email (e.g. anushka.p@demo.econz.net) or domain name above and click 'Load Domain & User Aliases'."
              />
            )}

            {!loading && aliases.length > 0 && (
              <div className="space-y-4">
                {/* Table with Selection */}
                <div className="overflow-x-auto border border-gray-200 rounded-xl relative">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 w-10">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            checked={aliases.length > 0 && selectedEmails.length === aliases.length}
                            onChange={(e) => {
                              if (e.target.checked) setSelectAll(true);
                              else setSelectedEmails([]);
                            }}
                          />
                        </th>
                        <th className="px-4 py-3">Primary Email</th>
                        <th className="px-4 py-3">Configured Aliases</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {aliases.map((a, idx) => {
                        const isSelected = selectedEmails.includes(a.email);
                        return (
                          <tr key={idx} className={`hover:bg-gray-50 transition ${isSelected ? 'bg-indigo-50/50' : ''}`}>
                            <td className="px-4 py-3.5">
                              <input
                                type="checkbox"
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                checked={isSelected}
                                onChange={() => toggleSelectRow(a.email)}
                              />
                            </td>
                            <td className="px-4 py-3.5 font-medium text-gray-900">{a.email}</td>
                            <td className="px-4 py-3.5 text-indigo-600 font-mono text-xs">{a.data}</td>
                            <td className="px-4 py-3.5 text-right">
                              <button
                                onClick={() => {
                                  setPrimaryEmail(a.email);
                                  setActiveSubTab('delete_user');
                                }}
                                className="text-red-600 hover:text-red-800 text-xs font-semibold inline-flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove Alias</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Sticky Floating Batch Action Bar */}
                {selectedEmails.length > 0 && (
                  <div className="fixed bottom-6 right-6 z-40 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom border border-gray-800">
                    <span className="text-xs font-semibold">{selectedEmails.length} account{selectedEmails.length > 1 ? 's' : ''} selected</span>
                    <div className="h-4 w-px bg-gray-700" />
                    <button
                      onClick={() => {
                        setPrimaryEmail(selectedEmails.join(', '));
                        setActiveSubTab('add_user');
                      }}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                    >
                      Bulk Add Alias
                    </button>
                    <button
                      onClick={() => {
                        setSelectedEmails([]);
                      }}
                      className="text-gray-400 hover:text-white text-xs"
                    >
                      Deselect All
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ADD ALIASES */}
        {(activeSubTab.startsWith('add_')) && (
          <form onSubmit={handleAddAlias} className="space-y-4 max-w-md">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-gray-900">Add User Email Alias</h2>
              <p className="text-xs text-gray-500">Attach new email alias addresses to a primary user account.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Primary Email / Target Account</label>
              <input
                type="email"
                placeholder="user@demo.econz.net"
                value={primaryEmail}
                onChange={e => setPrimaryEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">New Aliases (Comma Separated)</label>
              <input
                type="text"
                placeholder="alias1@demo.econz.net, alias2@demo.econz.net"
                value={aliasInput}
                onChange={e => setAliasInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition shadow-sm disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? 'Attaching Alias...' : 'Attach Alias to Account'}</span>
            </button>
          </form>
        )}

        {/* DELETE ALIASES */}
        {(activeSubTab.startsWith('delete_')) && (
          <form onSubmit={handleDeleteAlias} className="space-y-4 max-w-md">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-gray-900">Remove User Email Alias</h2>
              <p className="text-xs text-gray-500">Permanently detach an email alias address from a user mailbox.</p>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-medium">
              Warning: Deleting an alias removes email routing for that address immediately.
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Primary Email Account</label>
              <input
                type="email"
                placeholder="user@demo.econz.net"
                value={primaryEmail}
                onChange={e => setPrimaryEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Alias Address To Delete</label>
              <input
                type="text"
                placeholder="old-alias@demo.econz.net"
                value={aliasInput}
                onChange={e => setAliasInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition shadow-sm disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? 'Deleting...' : 'Delete Alias Permanently'}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
