import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { HardDrive, Globe, Trash2, ExternalLink, Search, Loader2 } from 'lucide-react';
import StatusAlert from '../components/StatusAlert';
import ExportButton from '../components/ExportButton';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import { apiListDriveFiles, apiDeleteDriveFile } from '../services/api';

export default function DriveModule() {
  const { config } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('user_files');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // Input states
  const [userEmail, setUserEmail] = useState(config.adminEmail || 'anushka.p@demo.econz.net');
  const [domainName, setDomainName] = useState(config.domain || 'demo.econz.net');
  const [deleteFileId, setDeleteFileId] = useState('');

  // Results state
  const [files, setFiles] = useState([]);

  const handleFetchUserFiles = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await apiListDriveFiles(config, userEmail, false);
      setFiles(res.files);
      setStatus({ type: 'success', message: `Retrieved ${res.files.length} Drive files owned by ${userEmail}.` });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleFetchDomainFiles = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await apiListDriveFiles(config, domainName, true);
      setFiles(res.files);
      setStatus({ type: 'success', message: `Retrieved ${res.files.length} domain shared files for ${domainName}.` });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    const targetId = fileId || deleteFileId;
    if (!targetId) return;
    if (!window.confirm(`Are you sure you want to PERMANENTLY delete file ID ${targetId} from Google Drive?`)) return;

    setLoading(true);
    try {
      const res = await apiDeleteDriveFile(config, targetId);
      setStatus({ type: 'success', message: res.message });
      setDeleteFileId('');
      setFiles(prev => prev.filter(f => f.id !== targetId));
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const subTabs = [
    { id: 'user_files', label: 'User Drive Files', icon: HardDrive },
    { id: 'domain_files', label: 'Domain Drive Files Explorer', icon: Globe },
    { id: 'delete_file', label: 'Delete Drive File', icon: Trash2 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Google Drive Management</h1>
          <p className="text-sm text-gray-500 mt-1">Inspect user Google Drive files, explore domain-wide assets, and permanently purge files.</p>
        </div>
        <ExportButton data={files} filename="google_drive_files_report" />
      </div>

      <StatusAlert status={status} onClose={() => setStatus(null)} />

      {/* Subtabs Navigation Bar */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-1">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          const isDelete = tab.id.includes('delete');
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id);
                setFiles([]);
              }}
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

        {/* SUBTAB 1: User Drive Files */}
        {activeSubTab === 'user_files' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-gray-900">User Drive Files Search</h2>
              <p className="text-xs text-gray-500">Query all files owned by a specific Google Workspace user account.</p>
            </div>
            <form onSubmit={handleFetchUserFiles} className="flex flex-col sm:flex-row gap-3 max-w-lg">
              <input
                type="email"
                placeholder="anushka.p@demo.econz.net"
                value={userEmail}
                onChange={e => setUserEmail(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>{loading ? 'Searching Drive...' : 'Search User Drive Files'}</span>
              </button>
            </form>
          </div>
        )}

        {/* SUBTAB 2: Domain Drive Files Explorer */}
        {activeSubTab === 'domain_files' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-gray-900">Domain Files Explorer</h2>
              <p className="text-xs text-gray-500">Explore domain-wide shared files and organization assets.</p>
            </div>
            <form onSubmit={handleFetchDomainFiles} className="flex flex-col sm:flex-row gap-3 max-w-lg">
              <input
                type="text"
                placeholder="demo.econz.net"
                value={domainName}
                onChange={e => setDomainName(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                <span>{loading ? 'Exploring Domain...' : 'Explore Domain Files'}</span>
              </button>
            </form>
          </div>
        )}

        {/* SUBTAB 3: Delete Drive File */}
        {activeSubTab === 'delete_file' && (
          <form onSubmit={(e) => { e.preventDefault(); handleDeleteFile(); }} className="space-y-4 max-w-md">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-gray-900">Permanently Delete Drive File</h2>
              <p className="text-xs text-gray-500">Purge a specific file permanently from Google Drive using its File ID.</p>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-medium">
              Warning: Permanently deleting a Drive file cannot be undone.
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Target File ID</label>
              <input
                type="text"
                placeholder="1A2b3C4d5E6f7G8h9I0j"
                value={deleteFileId}
                onChange={e => setDeleteFileId(e.target.value)}
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
              <span>{loading ? 'Deleting File...' : 'Delete File Permanently'}</span>
            </button>
          </form>
        )}

        {/* Loading State */}
        {loading && (activeSubTab === 'user_files' || activeSubTab === 'domain_files') && (
          <LoadingState message="Fetching Google Drive files and metadata..." />
        )}

        {/* Empty State */}
        {!loading && files.length === 0 && (activeSubTab === 'user_files' || activeSubTab === 'domain_files') && (
          <EmptyState
            icon={HardDrive}
            title={activeSubTab === 'user_files' ? 'No User Files Displayed' : 'No Domain Files Displayed'}
            description={activeSubTab === 'user_files' ? 'Enter a user email address above and click "Search User Drive Files".' : 'Enter your domain name above and click "Explore Domain Files".'}
          />
        )}

        {/* Drive Files Table */}
        {!loading && files.length > 0 && (activeSubTab === 'user_files' || activeSubTab === 'domain_files') && (
          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">File Name</th>
                  <th className="px-4 py-3">MIME Type</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {files.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{f.name}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-gray-500 max-w-[200px] truncate">{f.mimeType}</td>
                    <td className="px-4 py-3 font-mono text-gray-700">{f.owner}</td>
                    <td className="px-4 py-3 text-right space-x-3">
                      <a
                        href={f.webViewLink && f.webViewLink !== '#' ? f.webViewLink : `https://drive.google.com/file/d/${f.id}/view`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View File</span>
                      </a>
                      <button
                        onClick={() => handleDeleteFile(f.id)}
                        className="text-red-600 hover:text-red-800 font-semibold inline-flex items-center gap-1"
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
    </div>
  );
}
