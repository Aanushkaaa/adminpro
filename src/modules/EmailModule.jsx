import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Trash2, Search, AlertOctagon, Eye, Hash, X, Loader2 } from 'lucide-react';
import StatusAlert from '../components/StatusAlert';
import ExportButton from '../components/ExportButton';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import { 
  apiGetEmailCount, apiListEmails, apiDeleteEmail, apiDomainRecallEmail 
} from '../services/api';

export default function EmailModule() {
  const { config } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('count');
  const [status, setStatus] = useState(null);

  // States
  const [targetEmail, setTargetEmail] = useState('');
  const [emailCountResult, setEmailCountResult] = useState(null);
  const [messagesList, setMessagesList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Selected Email Modal
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Recall states
  const [recallSender, setRecallSender] = useState('');
  const [recallQuery, setRecallQuery] = useState('');

  const handleGetCount = async (e) => {
    e.preventDefault();
    if (!targetEmail) return setStatus({ type: 'error', message: 'User email address required.' });
    setLoading(true);
    setStatus(null);
    try {
      const res = await apiGetEmailCount(config, targetEmail);
      setEmailCountResult(res.count);
      setStatus({ type: 'success', message: `User ${targetEmail} has approximately ${res.count} messages/threads in mailbox.` });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleListEmails = async (e) => {
    e.preventDefault();
    if (!targetEmail) return setStatus({ type: 'error', message: 'User email address required.' });
    setLoading(true);
    setStatus(null);
    try {
      const res = await apiListEmails(config, targetEmail);
      setMessagesList(res.emails);
      setStatus({ type: 'success', message: `Loaded ${res.emails.length} messages for ${targetEmail}. Action logged to sheet.` });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePermanent = async (messageId) => {
    if (!window.confirm(`Are you sure you want to permanently delete message ${messageId}? This cannot be undone.`)) return;
    setStatus({ type: 'info', message: `Processing deletion for message ${messageId}...` });
    try {
      const res = await apiDeleteEmail(config, targetEmail, messageId);
      setStatus({ type: 'success', message: res.message });
      setMessagesList(prev => prev.filter(m => m.id !== messageId));
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    }
  };

  const handleDomainRecall = async (e) => {
    e.preventDefault();
    if (!recallSender || !recallQuery) return setStatus({ type: 'error', message: 'Both Sender Email and Search Query are required.' });
    if (!window.confirm(`DANGER ZONE: You are about to permanently recall and delete all emails matching query "${recallQuery}" from sender "${recallSender}" across ALL active user mailboxes in domain "${config.domain || 'your domain'}". Proceed?`)) {
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      const res = await apiDomainRecallEmail(config, recallSender, recallQuery, config.domain || 'yourcompany.com');
      setStatus({ type: 'success', message: res.message });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Email & Mailbox Operations</h1>
          <p className="text-sm text-gray-500 mt-1">View mailbox metrics, search domain emails, and perform domain-wide email recall.</p>
        </div>
        {messagesList.length > 0 && <ExportButton data={messagesList} filename={`mailbox_${targetEmail}`} />}
      </div>

      <StatusAlert status={status} onClose={() => setStatus(null)} />

      {/* Sub tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-2">
        {[
          { id: 'count', label: 'View Count', icon: Hash },
          { id: 'list', label: 'List & View Emails', icon: Mail },
          { id: 'recall', label: 'Domain Email Recall', icon: AlertOctagon },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 font-medium text-sm border-b-2 transition whitespace-nowrap ${
                activeSubTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* VIEW COUNT TAB */}
      {activeSubTab === 'count' && (
        <form onSubmit={handleGetCount} className="bg-white border border-gray-200 rounded-2xl p-6 max-w-lg space-y-4 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-gray-900">View Mailbox Email & Thread Count</h2>
            <p className="text-xs text-gray-500">Query total thread and message metrics for a specific user mailbox.</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">User Email Address</label>
            <input
              type="email"
              placeholder="user@yourcompany.com"
              value={targetEmail}
              onChange={e => setTargetEmail(e.target.value)}
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
            <span>{loading ? 'Checking Mailbox...' : 'Fetch Mailbox Count'}</span>
          </button>

          {loading && <LoadingState message="Fetching Gmail profile metrics..." />}

          {!loading && emailCountResult !== null && (
            <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl text-left space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-indigo-900">Mailbox Metrics Summary</div>
              <div className="text-2xl font-bold text-indigo-700">{emailCountResult.toLocaleString()} <span className="text-sm font-normal text-indigo-900">Total Messages / Threads</span></div>
            </div>
          )}
        </form>
      )}

      {/* LIST & VIEW TAB */}
      {activeSubTab === 'list' && (
        <div className="space-y-4">
          <form onSubmit={handleListEmails} className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 max-w-xl shadow-sm">
            <input
              type="email"
              placeholder="Enter user email address (e.g. user@yourcompany.com)"
              value={targetEmail}
              onChange={e => setTargetEmail(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2 rounded-xl text-sm transition shadow-sm disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? 'Loading...' : 'Load User Messages'}</span>
            </button>
          </form>

          {loading && <LoadingState message="Fetching user mailbox messages..." />}

          {!loading && messagesList.length === 0 && (
            <EmptyState
              icon={Mail}
              title="No Mailbox Messages Loaded"
              description="Enter a user email address above and click 'Load User Messages' to list mailbox records."
            />
          )}

          {!loading && messagesList.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3">From</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Message ID</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {messagesList.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3.5 font-medium text-gray-900">{m.from}</td>
                      <td className="px-4 py-3.5 text-gray-700">{m.subject}</td>
                      <td className="px-4 py-3.5 text-gray-500 text-xs">{m.date}</td>
                      <td className="px-4 py-3.5 text-xs font-mono text-gray-400">{m.id}</td>
                      <td className="px-4 py-3.5 text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedMessage(m)}
                          className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="View Message Snippet"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePermanent(m.id)}
                          className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Permanently"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* DOMAIN RECALL TAB */}
      {activeSubTab === 'recall' && (
        <form onSubmit={handleDomainRecall} className="bg-white border border-rose-200 rounded-2xl p-6 max-w-xl space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-lg border-b border-rose-100 pb-3">
            <AlertOctagon className="w-5 h-5 text-rose-600" />
            <span>Domain-Wide Email Recall (Purge)</span>
          </div>

          <p className="text-xs text-rose-600 leading-relaxed">
            <strong>DANGER ZONE:</strong> Searches all active user mailboxes in the domain and permanently deletes any matching email.
          </p>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Sender's Email Address</label>
            <input
              type="email"
              placeholder="pravenesh@domain.com"
              value={recallSender}
              onChange={e => setRecallSender(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email Subject / Gmail Search Query</label>
            <input
              type="text"
              placeholder='subject:"Meeting Canceled"'
              value={recallQuery}
              onChange={e => setRecallQuery(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
              required
            />
          </div>

          {loading && <LoadingState message="Executing domain-wide search & email recall purge..." />}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition shadow-sm w-full disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{loading ? 'Recalling & Purging...' : 'Purge Matching Emails Domain-Wide'}</span>
          </button>
        </form>
      )}

      {/* Message Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-gray-100 text-left">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-gray-900">{selectedMessage.subject}</h3>
              <button onClick={() => setSelectedMessage(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <div><strong>From:</strong> {selectedMessage.from}</div>
              <div><strong>Date:</strong> {selectedMessage.date}</div>
              <div><strong>Message ID:</strong> {selectedMessage.id}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-800 font-mono leading-relaxed border border-gray-200">
              {selectedMessage.snippet}
            </div>
            <div className="flex justify-end">
              <button onClick={() => setSelectedMessage(null)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
