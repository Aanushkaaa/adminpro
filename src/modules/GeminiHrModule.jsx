import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, FolderSearch, MessageSquare, Send, Bot, User, Loader2 } from 'lucide-react';
import StatusAlert from '../components/StatusAlert';
import ExportButton from '../components/ExportButton';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import { apiAnalyzeResumeFolder, apiAskGeminiChatbot } from '../services/api';

export default function GeminiHrModule() {
  const { config } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('analyzer');
  const [folderId, setFolderId] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  // Chatbot state
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your Gemini HR Assistant. Ask me anything about candidate experience, skills, or ATS scores.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const handleStartAnalysis = async (e) => {
    e.preventDefault();
    if (!folderId) return setStatus({ type: 'error', message: 'Google Drive Folder ID required.' });
    setLoading(true);
    setStatus({ type: 'info', message: 'Scanning Google Drive folder & analyzing resumes with Gemini AI...' });
    try {
      const res = await apiAnalyzeResumeFolder(config, folderId, jobDescription);
      setCandidates(res.files);
      setStatus({ type: 'success', message: `Analysis Complete! Successfully processed ${res.files.length} resumes. Logs written to audit sheet.` });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userQ = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { sender: 'user', text: userQ }]);
    setChatLoading(true);
    try {
      const botReply = await apiAskGeminiChatbot(userQ);
      setChatMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { sender: 'bot', text: `Error: ${err.message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Gemini HR & ATS Intelligence</h1>
            <span className="bg-indigo-100 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-bold">Gemini 2.0 AI</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Automated resume scanning, ATS keyword matching, and candidate Q&A chatbot.</p>
        </div>
        {candidates.length > 0 && <ExportButton data={candidates} filename="gemini_ats_candidates" />}
      </div>

      <StatusAlert status={status} onClose={() => setStatus(null)} />

      {/* Sub tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveSubTab('analyzer')}
          className={`flex items-center gap-2 px-4 py-2.5 font-medium text-sm border-b-2 transition ${
            activeSubTab === 'analyzer' ? 'border-indigo-600 text-indigo-600 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FolderSearch className="w-4 h-4" />
          <span>Folder Resume Analyzer</span>
        </button>
        <button
          onClick={() => setActiveSubTab('chatbot')}
          className={`flex items-center gap-2 px-4 py-2.5 font-medium text-sm border-b-2 transition ${
            activeSubTab === 'chatbot' ? 'border-indigo-600 text-indigo-600 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Candidate Resume Chatbot</span>
        </button>
      </div>

      {/* FOLDER ANALYZER TAB */}
      {activeSubTab === 'analyzer' && (
        <div className="space-y-6">
          <form onSubmit={handleStartAnalysis} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm max-w-2xl">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-gray-900">Scan & Analyze Resumes in Drive Folder</h2>
              <p className="text-xs text-gray-500">Extract applicant qualifications and compute ATS relevance scores against job description.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Google Drive Folder ID</label>
              <input
                type="text"
                placeholder="e.g. 1A2b3C4dE5f6G7h8I9j0"
                value={folderId}
                onChange={e => setFolderId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Target Job Description (for ATS Scoring)</label>
              <textarea
                rows={4}
                placeholder="Paste Job Description requirements here..."
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2.5 rounded-lg text-xs transition shadow-2xs disabled:opacity-50 font-mono"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
              <span>{loading ? 'Analyzing with Gemini AI...' : 'Analyze Folder Resumes'}</span>
            </button>
          </form>

          {loading && <LoadingState message="Scanning Drive files and computing ATS scores with Gemini AI..." />}

          {!loading && candidates.length === 0 && (
            <EmptyState
              icon={FolderSearch}
              title="No Candidates Analyzed Yet"
              description="Provide a Google Drive Folder ID containing resume documents and click 'Analyze Folder Resumes'."
            />
          )}

          {/* Results Table */}
          {!loading && candidates.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3">Candidate Name</th>
                    <th className="px-4 py-3">ATS Score</th>
                    <th className="px-4 py-3">Experience</th>
                    <th className="px-4 py-3">Skills</th>
                    <th className="px-4 py-3">Summary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {candidates.map((c, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3.5 font-semibold text-gray-900">{c.name}</td>
                      <td className="px-4 py-3.5">
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                          {c.atsScore}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs font-medium text-gray-600">{c.yearsExperience}</td>
                      <td className="px-4 py-3.5 text-xs text-indigo-600 truncate max-w-xs">{c.skills}</td>
                      <td className="px-4 py-3.5 text-xs text-gray-600 max-w-xs leading-relaxed">{c.summary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CHATBOT TAB */}
      {activeSubTab === 'chatbot' && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs flex flex-col h-[520px]">
          <div className="p-3 bg-slate-900 text-white font-mono text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-slate-300" />
              <span>GEMINI HR EVALUATION AGENT</span>
            </div>
            <span className="text-[10px] text-slate-400 font-sans font-mono uppercase tracking-wider">AI HR ASSISTANT</span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div className={`p-3.5 rounded-2xl text-sm max-w-md leading-relaxed ${
                  msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 shadow-sm rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {chatLoading && (
              <div className="text-xs text-gray-500 italic pl-10 flex items-center gap-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                <span>Gemini is evaluating candidates...</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSendChat} className="p-3 border-t border-gray-200 bg-white flex gap-2">
            <input
              type="text"
              placeholder="e.g. Who has more than 5 years of experience in React and GCP?"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <button type="submit" disabled={chatLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl transition shadow-sm">
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
