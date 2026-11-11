import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, UserPlus, Trash2, Settings, FileSpreadsheet, List, Upload, Loader2, Search } from 'lucide-react';
import StatusAlert from '../components/StatusAlert';
import ExportButton from '../components/ExportButton';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import { 
  apiListGroups, apiCreateGroup, apiAddGroupMember, apiListGroupMembers, 
  apiDeleteGroup, apiDeleteGroupMember, apiUpdateGroupSettings 
} from '../services/api';

export default function GroupsModule() {
  const { config } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('list');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [domain, setDomain] = useState(config.domain || '');
  const [groups, setGroups] = useState([]);
  
  // Single Group creation
  const [newGroupEmail, setNewGroupEmail] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  // Member management
  const [targetGroupEmail, setTargetGroupEmail] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [memberRole, setRole] = useState('MEMBER');
  const [membersList, setMembersList] = useState([]);

  // Deletion states
  const [deleteGroupEmail, setDeleteGroupEmail] = useState('');
  const [deleteMemberEmail, setDeleteMemberEmail] = useState('');

  // Settings state
  const [settingsGroupEmail, setSettingsGroupEmail] = useState('');
  const [whoCanJoin, setWhoCanJoin] = useState('CAN_REQUEST_TO_JOIN');
  const [whoCanPostMessage, setWhoCanPostMessage] = useState('ALL_IN_DOMAIN_CAN_POST');

  // Bulk input
  const [bulkInputText, setBulkInputText] = useState('');

  // --- Handlers ---
  const handleListGroups = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const data = await apiListGroups(config, domain);
      setGroups(data);
      setStatus({ type: 'success', message: `Found ${data.length} groups for domain ${domain}. Action logged to audit sheet.` });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiCreateGroup(config, newGroupEmail, newGroupName, newGroupDesc);
      setStatus({ type: 'success', message: res.message });
      setNewGroupEmail('');
      setNewGroupName('');
      setNewGroupDesc('');
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiAddGroupMember(config, targetGroupEmail, newMemberEmail, memberRole);
      setStatus({ type: 'success', message: res.message });
      setNewMemberEmail('');
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleListMembers = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiListGroupMembers(config, targetGroupEmail);
      setMembersList(data);
      setStatus({ type: 'success', message: `Retrieved ${data.length} members for ${targetGroupEmail}` });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (e) => {
    e.preventDefault();
    if (!window.confirm(`Are you sure you want to PERMANENTLY delete group ${deleteGroupEmail}?`)) return;
    setLoading(true);
    try {
      const res = await apiDeleteGroup(config, deleteGroupEmail);
      setStatus({ type: 'success', message: res.message });
      setDeleteGroupEmail('');
      handleListGroups();
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiDeleteGroupMember(config, targetGroupEmail, deleteMemberEmail);
      setStatus({ type: 'success', message: res.message });
      setDeleteMemberEmail('');
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiUpdateGroupSettings(config, settingsGroupEmail, {
        whoCanJoin,
        whoCanPostMessage
      });
      setStatus({ type: 'success', message: res.message });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (actionType) => {
    setLoading(true);
    try {
      const lines = bulkInputText.split('\n').filter(l => l.trim().length > 0);
      let count = 0;
      for (const line of lines) {
        const parts = line.split(',').map(p => p.trim());
        if (actionType === 'bulk_create') {
          if (parts[0]) {
            await apiCreateGroup(config, parts[0], parts[1] || parts[0].split('@')[0], parts[2] || '');
            count++;
          }
        } else if (actionType === 'bulk_add_members') {
          if (parts[0] && parts[1]) {
            await apiAddGroupMember(config, parts[0], parts[1], parts[2] || 'MEMBER');
            count++;
          }
        } else if (actionType === 'bulk_delete_groups') {
          if (parts[0]) {
            await apiDeleteGroup(config, parts[0]);
            count++;
          }
        } else if (actionType === 'bulk_delete_members') {
          if (parts[0] && parts[1]) {
            await apiDeleteGroupMember(config, parts[0], parts[1]);
            count++;
          }
        }
      }
      setStatus({ type: 'success', message: `Bulk Action (${actionType}) completed for ${count} records! Logged to audit sheet.` });
      setBulkInputText('');
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const subTabs = [
    { id: 'list', label: 'List Groups', icon: List },
    { id: 'create', label: 'Create Group', icon: Users },
    { id: 'add_member', label: 'Add Member', icon: UserPlus },
    { id: 'list_members', label: 'List Members', icon: List },
    { id: 'update_settings', label: 'Update Settings', icon: Settings },
    { id: 'bulk_create_csv', label: 'Bulk Create (CSV)', icon: Upload },
    { id: 'bulk_create_sheet', label: 'Bulk Create (Sheet)', icon: FileSpreadsheet },
    { id: 'bulk_add_members', label: 'Bulk Add Members', icon: UserPlus },
    { id: 'bulk_delete_groups', label: 'Bulk Delete Groups', icon: Trash2 },
    { id: 'bulk_delete_members', label: 'Bulk Delete Members', icon: Trash2 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Groups Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage Google Workspace Groups, Membership Roles, Settings, and Bulk Deletion.</p>
        </div>
        <ExportButton data={groups} filename="google_workspace_groups" />
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
        
        {/* SUBTAB: List Groups */}
        {activeSubTab === 'list' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-gray-900">Workspace Domain Groups</h2>
              <p className="text-xs text-gray-500">Query active Google Workspace groups and associated member roles.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
              <input
                type="text"
                value={domain}
                onChange={e => setDomain(e.target.value)}
                placeholder="yourcompany.com"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                onClick={handleListGroups}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition shadow-sm disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>{loading ? 'Fetching...' : 'Load Domain Groups'}</span>
              </button>
            </div>

            {loading && <LoadingState message="Fetching groups and members from Google Directory API..." />}

            {!loading && groups.length === 0 && (
              <EmptyState
                icon={Users}
                title="No Domain Groups Loaded"
                description="Click 'Load Domain Groups' above to fetch active group records for your workspace domain."
              />
            )}

            {!loading && groups.length > 0 && (
              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3">Group Email</th>
                      <th className="px-4 py-3">Group Name</th>
                      <th className="px-4 py-3">Admins (Owners/Managers)</th>
                      <th className="px-4 py-3">Members</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {groups.map((g, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3.5 font-medium text-indigo-600 font-mono text-xs">{g.email}</td>
                        <td className="px-4 py-3.5 font-medium text-gray-900">{g.name}</td>
                        <td className="px-4 py-3.5 text-xs font-mono text-gray-600">{g.admins}</td>
                        <td className="px-4 py-3.5 text-xs max-w-xs truncate text-gray-500">{g.members}</td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => {
                              setDeleteGroupEmail(g.email);
                              setActiveSubTab('bulk_delete_groups');
                            }}
                            className="text-red-600 hover:text-red-800 text-xs font-semibold inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
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

        {/* SUBTAB: Create Group */}
        {activeSubTab === 'create' && (
          <form onSubmit={handleCreateGroup} className="space-y-4 max-w-md">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-gray-900">Create New Group</h2>
              <p className="text-xs text-gray-500">Provision a new Google Workspace group email address and settings.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Group Email</label>
              <input
                type="email"
                placeholder="sales-team@yourcompany.com"
                value={newGroupEmail}
                onChange={e => setNewGroupEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Group Display Name</label>
              <input
                type="text"
                placeholder="Sales Team"
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</label>
              <textarea
                placeholder="Group for Sales Representatives"
                value={newGroupDesc}
                onChange={e => setNewGroupDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition shadow-sm disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? 'Creating Group...' : 'Create New Group'}</span>
            </button>
          </form>
        )}

        {/* SUBTAB: Add Member */}
        {activeSubTab === 'add_member' && (
          <form onSubmit={handleAddMember} className="space-y-4 max-w-md">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-gray-900">Add Group Member</h2>
              <p className="text-xs text-gray-500">Add a user to an existing Google Workspace group with a designated role.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Target Group Email</label>
              <input
                type="email"
                placeholder="sales-team@yourcompany.com"
                value={targetGroupEmail}
                onChange={e => setTargetGroupEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">New Member Email</label>
              <input
                type="email"
                placeholder="user@yourcompany.com"
                value={newMemberEmail}
                onChange={e => setNewMemberEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Membership Role</label>
              <select
                value={memberRole}
                onChange={e => setRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="MEMBER">Member</option>
                <option value="MANAGER">Manager</option>
                <option value="OWNER">Owner</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition shadow-sm disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? 'Adding Member...' : 'Add Member to Group'}</span>
            </button>
          </form>
        )}

        {/* SUBTAB: List Members */}
        {activeSubTab === 'list_members' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-gray-900">List Group Members</h2>
              <p className="text-xs text-gray-500">View all users and roles assigned to a specific group.</p>
            </div>
            <form onSubmit={handleListMembers} className="flex flex-col sm:flex-row gap-3 max-w-lg">
              <input
                type="email"
                value={targetGroupEmail}
                onChange={e => setTargetGroupEmail(e.target.value)}
                placeholder="sales-team@yourcompany.com"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition shadow-sm disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <List className="w-4 h-4" />}
                <span>{loading ? 'Fetching...' : 'Load Group Members'}</span>
              </button>
            </form>

            {loading && <LoadingState message="Fetching members list..." />}

            {!loading && membersList.length === 0 && (
              <EmptyState
                icon={Users}
                title="No Group Members Displayed"
                description="Enter a target group email address above and click 'Load Group Members'."
              />
            )}

            {!loading && membersList.length > 0 && (
              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3">Member Email</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {membersList.map((m, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3.5 font-medium text-gray-900">{m.email}</td>
                        <td className="px-4 py-3.5 text-xs font-semibold uppercase text-indigo-600">{m.role}</td>
                        <td className="px-4 py-3.5 text-xs text-gray-500">{m.type}</td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => {
                              setDeleteMemberEmail(m.email);
                              handleDeleteMember({ preventDefault: () => {} });
                            }}
                            className="text-red-600 hover:text-red-800 text-xs font-semibold inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
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

        {/* SUBTAB: Update Settings */}
        {activeSubTab === 'update_settings' && (
          <form onSubmit={handleUpdateSettings} className="space-y-4 max-w-md">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-gray-900">Update Group Access Settings</h2>
              <p className="text-xs text-gray-500">Configure join permissions and message posting access for a group.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Group Email</label>
              <input
                type="email"
                placeholder="sales-team@yourcompany.com"
                value={settingsGroupEmail}
                onChange={e => setSettingsGroupEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Who Can Join</label>
              <select
                value={whoCanJoin}
                onChange={e => setWhoCanJoin(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="CAN_REQUEST_TO_JOIN">Can Request To Join</option>
                <option value="ALL_IN_DOMAIN_CAN_JOIN">All In Domain Can Join</option>
                <option value="INVITED_CAN_JOIN">Invited Users Only</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Who Can Post Messages</label>
              <select
                value={whoCanPostMessage}
                onChange={e => setWhoCanPostMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="ALL_IN_DOMAIN_CAN_POST">All Domain Users</option>
                <option value="ALL_MEMBERS_CAN_POST">Group Members Only</option>
                <option value="ALL_MANAGERS_CAN_POST">Managers Only</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition shadow-sm disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? 'Updating...' : 'Save Group Access Settings'}</span>
            </button>
          </form>
        )}

        {/* SUBTAB: Bulk CSV / Sheet / Add / Delete */}
        {(activeSubTab.startsWith('bulk_')) && (
          <div className="space-y-4 max-w-xl">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-gray-900 capitalize">
                {activeSubTab.replace(/_/g, ' ')}
              </h2>
              <p className="text-xs text-gray-500">
                Paste CSV records line-by-line (e.g. <code>group_email, name_or_member_email</code>).
              </p>
            </div>
            <textarea
              rows={6}
              placeholder={
                activeSubTab.includes('delete_groups')
                  ? "group1@yourcompany.com\ngroup2@yourcompany.com"
                  : activeSubTab.includes('delete_members')
                  ? "group1@yourcompany.com, user1@yourcompany.com\ngroup1@yourcompany.com, user2@yourcompany.com"
                  : "sales@yourcompany.com, Sales Team, Sales Group\nsupport@yourcompany.com, Support Team, Support Group"
              }
              value={bulkInputText}
              onChange={e => setBulkInputText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            {loading && <LoadingState message="Executing batch bulk operations..." />}
            <button
              onClick={() => handleBulkAction(activeSubTab)}
              disabled={loading || !bulkInputText.trim()}
              className={`inline-flex items-center gap-2 font-medium px-5 py-2.5 rounded-xl text-sm transition text-white shadow-sm ${
                activeSubTab.includes('delete') ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'
              } disabled:opacity-50`}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? 'Processing Batch...' : `Execute ${activeSubTab.replace(/_/g, ' ')}`}</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
