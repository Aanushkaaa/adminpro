import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Plus, UserPlus, Trash2, Activity, Upload, FileSpreadsheet, Loader2, Search } from 'lucide-react';
import StatusAlert from '../components/StatusAlert';
import ExportButton from '../components/ExportButton';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import { 
  apiListUserChats, apiCreateChatSpace, apiDeleteChatSpace, 
  apiGenerateDomainSpaceReport, apiFetchUserLoginActivity 
} from '../services/api';

export default function ChatModule() {
  const { config } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('view_chats');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [userEmail, setUserEmail] = useState(config.adminEmail || '');
  const [domainName, setDomainName] = useState(config.domain || '');
  const [spaceName, setSpaceName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [deleteSpaceId, setDeleteSpaceId] = useState('');
  
  // Output data
  const [chats, setChats] = useState([]);
  const [domainSpaceReport, setDomainSpaceReport] = useState([]);
  const [loginActivity, setLoginActivity] = useState([]);
  const [bulkInput, setBulkInput] = useState('');

  const handleFetchChats = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await apiListUserChats(config, userEmail);
      setChats(res.chats);
      setStatus({ type: 'success', message: `Found ${res.chats.length} chats for ${userEmail}.` });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleFetchLoginActivity = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const data = await apiFetchUserLoginActivity(config, domainName);
      setLoginActivity(data);
      setStatus({ type: 'success', message: `Retrieved login activity for ${data.length} users in ${domainName}.` });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDomainSpaceReport = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const data = await apiGenerateDomainSpaceReport(config, domainName);
      setDomainSpaceReport(data);
      setStatus({ type: 'success', message: 'Space report generated.' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSpace = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiCreateChatSpace(config, spaceName, memberEmail);
      setStatus({ type: 'success', message: res.message });
      setSpaceName('');
      setMemberEmail('');
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSpace = async (e) => {
    e.preventDefault();
    if (!window.confirm(`Are you sure you want to PERMANENTLY delete Chat Space ${deleteSpaceId}?`)) return;
    setLoading(true);
    try {
      const res = await apiDeleteChatSpace(config, deleteSpaceId);
      setStatus({ type: 'success', message: res.message });
      setDeleteSpaceId('');
      handleFetchChats();
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCreateAdd = async () => {
    setLoading(true);
    try {
      const lines = bulkInput.split('\n').filter(l => l.trim().length > 0);
      let count = 0;
      for (const line of lines) {
        const parts = line.split(',').map(p => p.trim());
        if (parts[0]) {
          await apiCreateChatSpace(config, parts[0], parts[1] || null);
          count++;
        }
      }
      setStatus({ type: 'success', message: `Bulk created ${count} Chat spaces and added members.` });
      setBulkInput('');
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const subTabs = [
    { id: 'view_chats', label: "View User's Chats", icon: MessageSquare },
    { id: 'login_activity', label: 'User Login Activity', icon: Activity },
    { id: 'domain_report', label: 'Domain Space Report', icon: FileSpreadsheet },
    { id: 'create_space', label: 'Create Space', icon: Plus },
    { id: 'create_add_member', label: 'Create & Add Member', icon: UserPlus },
    { id: 'bulk_create_add', label: 'Bulk Create & Add', icon: Upload },
    { id: 'delete_space', label: 'Delete Space', icon: Trash2 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Chat & Space Management</h1>
          <p className="text-sm text-gray-500 mt-1">Inspect user chat spaces, login activity, domain reports, create spaces, and manage space resources.</p>
        </div>
        <ExportButton 
          data={activeSubTab === 'login_activity' ? loginActivity : activeSubTab === 'domain_report' ? domainSpaceReport : chats} 
          filename="google_chat_spaces_report" 
        />
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
        
        {/* SUBTAB 1: View User's Chats */}
        {activeSubTab === 'view_chats' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-gray-900">Search User Chat Spaces</h2>
              <p className="text-xs text-gray-500">Query all Google Chat spaces and group conversations for a specific user.</p>
            </div>
            <form onSubmit={handleFetchChats} className="flex flex-col sm:flex-row gap-3 max-w-lg">
              <input
                type="email"
                placeholder="user@yourcompany.com"
                value={userEmail}
                onChange={e => setUserEmail(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition shadow-sm disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>{loading ? 'Searching...' : 'Search User Chat Spaces'}</span>
              </button>
            </form>

            {loading && <LoadingState message="Fetching user Google Chat spaces..." />}

            {!loading && chats.length === 0 && (
              <EmptyState
                icon={MessageSquare}
                title="No User Chats Displayed"
                description="Enter a user email address above and click 'Search User Chat Spaces'."
              />
            )}

            {!loading && chats.length > 0 && (
              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3">Space Name</th>
                      <th className="px-4 py-3">Space ID</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {chats.map((c, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3.5 font-medium text-gray-900">{c.displayName}</td>
                        <td className="px-4 py-3.5 font-mono text-xs text-indigo-600">{c.id}</td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => {
                              setDeleteSpaceId(c.id);
                              setActiveSubTab('delete_space');
                            }}
                            className="text-red-600 hover:text-red-800 text-xs font-semibold inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Space</span>
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

        {/* SUBTAB 2: User Login Activity */}
        {activeSubTab === 'login_activity' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-gray-900">User Login Activity Report</h2>
              <p className="text-xs text-gray-500">Query last active login timestamps for users across the workspace domain.</p>
            </div>
            <form onSubmit={handleFetchLoginActivity} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Domain Name</label>
                <input
                  type="text"
                  placeholder="yourcompany.com"
                  value={domainName}
                  onChange={e => setDomainName(e.target.value)}
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
                <span>{loading ? 'Generating Report...' : 'Fetch Login Activity Report'}</span>
              </button>
            </form>

            {loading && <LoadingState message="Fetching user login timestamps from Admin Reports API..." />}

            {!loading && loginActivity.length === 0 && (
              <EmptyState
                icon={Activity}
                title="No Login Activity Loaded"
                description="Click 'Fetch Login Activity Report' above to retrieve last active timestamps."
              />
            )}

            {!loading && loginActivity.length > 0 && (
              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3">User Email</th>
                      <th className="px-4 py-3">Last Active Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-mono text-xs">
                    {loginActivity.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3.5 font-medium text-gray-900 font-sans">{row.user}</td>
                        <td className="px-4 py-3.5 text-gray-600">{row.lastActive}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SUBTAB 3: Domain Space Report */}
        {activeSubTab === 'domain_report' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-gray-900">Domain-Wide Space & Member Report</h2>
              <p className="text-xs text-gray-500">Generate a complete list of all Google Chat spaces and space members in the domain.</p>
            </div>
            <form onSubmit={handleGenerateDomainSpaceReport} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Domain Name</label>
                <input
                  type="text"
                  placeholder="yourcompany.com"
                  value={domainName}
                  onChange={e => setDomainName(e.target.value)}
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
                <span>{loading ? 'Generating Report...' : 'Generate Space & Member Report'}</span>
              </button>
            </form>

            {loading && <LoadingState message="Scanning domain Chat spaces and members list..." />}

            {!loading && domainSpaceReport.length === 0 && (
              <EmptyState
                icon={FileSpreadsheet}
                title="No Domain Space Report Loaded"
                description="Click 'Generate Space & Member Report' above to analyze domain spaces."
              />
            )}

            {!loading && domainSpaceReport.length > 0 && (
              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3">Space Name</th>
                      <th className="px-4 py-3">Members</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {domainSpaceReport.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3.5 font-medium text-gray-900">{row.spaceName}</td>
                        <td className={`px-4 py-3.5 text-xs ${
                          row.members.includes('Access denied') 
                            ? 'text-gray-500 italic' 
                            : 'text-indigo-600 font-mono'
                        }`}>
                          {row.members}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SUBTAB 4: Create Space */}
        {activeSubTab === 'create_space' && (
          <form onSubmit={handleCreateSpace} className="space-y-4 max-w-md">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-gray-900">Create New Chat Space</h2>
              <p className="text-xs text-gray-500">Provision a new Google Chat Space for group collaboration.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Space Display Name</label>
              <input
                type="text"
                placeholder="Project Apollo Discussion"
                value={spaceName}
                onChange={e => setSpaceName(e.target.value)}
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
              <span>{loading ? 'Creating Space...' : 'Create Chat Space'}</span>
            </button>
          </form>
        )}

        {/* SUBTAB 5: Create & Add Member */}
        {activeSubTab === 'create_add_member' && (
          <form onSubmit={handleCreateSpace} className="space-y-4 max-w-md">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-gray-900">Create Space & Add Initial Member</h2>
              <p className="text-xs text-gray-500">Provision a new Chat Space and instantly add an initial member email.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Space Display Name</label>
              <input
                type="text"
                placeholder="Project Apollo Discussion"
                value={spaceName}
                onChange={e => setSpaceName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Initial Member Email</label>
              <input
                type="email"
                placeholder="user@yourcompany.com"
                value={memberEmail}
                onChange={e => setMemberEmail(e.target.value)}
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
              <span>{loading ? 'Creating...' : 'Create Space & Add Member'}</span>
            </button>
          </form>
        )}

        {/* SUBTAB 6: Bulk Create & Add */}
        {activeSubTab === 'bulk_create_add' && (
          <div className="space-y-4 max-w-lg">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-gray-900">Bulk Create Spaces & Add Members</h2>
              <p className="text-xs text-gray-500">Paste line-by-line CSV: <code>Space Name, Member Email</code></p>
            </div>
            <textarea
              rows={6}
              placeholder="Engineering Space, dev1@yourcompany.com\nSales Space, lead@yourcompany.com"
              value={bulkInput}
              onChange={e => setBulkInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            {loading && <LoadingState message="Processing batch Chat spaces creation..." />}
            <button
              onClick={handleBulkCreateAdd}
              disabled={loading || !bulkInput.trim()}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition shadow-sm disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? 'Processing Batch...' : 'Create Spaces & Add Members'}</span>
            </button>
          </div>
        )}

        {/* SUBTAB 7: Delete Space */}
        {activeSubTab === 'delete_space' && (
          <form onSubmit={handleDeleteSpace} className="space-y-4 max-w-md">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-gray-900">Permanently Delete Chat Space</h2>
              <p className="text-xs text-gray-500">Remove a Chat Space resource permanently using its Space ID.</p>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-medium">
              Warning: Deleting a Google Chat Space permanently removes all messages and attachments inside the space.
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Target Space ID / Name</label>
              <input
                type="text"
                placeholder="spaces/AAQA2F46zJA"
                value={deleteSpaceId}
                onChange={e => setDeleteSpaceId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-mono focus:ring-2 focus:ring-red-500 focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition shadow-sm disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? 'Deleting Space...' : 'Delete Space Permanently'}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
