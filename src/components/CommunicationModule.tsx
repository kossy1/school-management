import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { CommunicationThread, ChatMessage, SchoolAnnouncement } from '../types';
import {
  MessageSquare,
  Send,
  Users,
  Bell,
  Search,
  PlusCircle,
  CheckCheck,
  Calendar,
  AlertTriangle,
  School,
  X,
  User,
} from 'lucide-react';

export const CommunicationModule: React.FC = () => {
  const {
    currentRole,
    currentStudent,
    threads,
    teachers,
    announcements,
    sendMessage,
    createThread,
    showToast,
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'messages' | 'announcements'>('messages');
  const [selectedThreadId, setSelectedThreadId] = useState<string>(threads[0]?.id || '');
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // New Thread Modal state
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  const [newRecipientId, setNewRecipientId] = useState(teachers[0]?.id || '');
  const [newSubject, setNewSubject] = useState('');
  const [newInitialMsg, setNewInitialMsg] = useState('');

  const activeThread = threads.find((t) => t.id === selectedThreadId) || threads[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeThread) return;
    sendMessage(activeThread.id, messageInput);
    setMessageInput('');
  };

  const handleCreateNewThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newInitialMsg.trim()) return;

    const cat = currentRole === 'student' ? 'teacher-student' : 'teacher-parent';
    const newId = createThread(newRecipientId, newSubject, newInitialMsg, cat);
    setSelectedThreadId(newId);
    setShowNewThreadModal(false);
    setNewSubject('');
    setNewInitialMsg('');
  };

  const quickPrompts = [
    'Could we schedule a brief consultation regarding WAEC & NECO exam readiness?',
    'Thank you for the detailed Continuous Assessment (CA) feedback.',
    'Confirming our family attendance for the upcoming PTA General Congress.',
    'May we request past WAEC / NECO question papers and marking guides?',
  ];

  const filteredAnnouncements = announcements.filter((a) => {
    if (!searchQuery) return true;
    return (
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Bar with Tab switcher */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-indigo-600" />
            <span>School Communication & Notices</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Direct real-time messaging between teachers, parents, and students, plus official school circulars.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'messages'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Direct Messages
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'announcements'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              School Circulars ({announcements.length})
            </button>
          </div>

          {activeTab === 'messages' && (
            <button
              onClick={() => setShowNewThreadModal(true)}
              id="new-message-btn"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              <span>New Message</span>
            </button>
          )}
        </div>
      </div>

      {/* MESSAGES TAB */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12 min-h-[560px]">
          {/* Left Column: Thread List */}
          <div className="md:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/50">
            <div className="p-3.5 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Conversations
              </span>
            </div>

            <div className="divide-y divide-slate-100 overflow-y-auto flex-1 max-h-[500px]">
              {threads.map((thread) => {
                const isSelected = thread.id === selectedThreadId;
                const otherParticipant =
                  thread.participants.find((p) => p.role !== currentRole) || thread.participants[0];

                return (
                  <div
                    key={thread.id}
                    onClick={() => setSelectedThreadId(thread.id)}
                    className={`p-4 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-white border-l-4 border-indigo-600 shadow-xs'
                        : 'hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <img
                        src={otherParticipant.avatar}
                        alt={otherParticipant.name}
                        className="h-10 w-10 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {otherParticipant.name}
                          </h4>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {thread.lastMessageTimestamp}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-700 truncate">
                          {thread.subject}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {thread.lastMessagePreview}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Conversation */}
          {activeThread ? (
            <div className="md:col-span-8 flex flex-col h-full bg-white">
              {/* Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{activeThread.subject}</h3>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                    <span>With: {activeThread.participants.map((p) => p.name).join(' & ')}</span>
                    <span>•</span>
                    <span className="capitalize text-indigo-600 font-semibold">
                      {activeThread.category.replace('-', ' & ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 max-h-[380px] bg-slate-50/40">
                {activeThread.messages.map((msg) => {
                  const isCurrentUser =
                    (currentRole === 'parent' && msg.senderRole === 'parent') ||
                    (currentRole === 'teacher' && msg.senderRole === 'teacher') ||
                    (currentRole === 'student' && msg.senderRole === 'student') ||
                    (currentRole === 'admin' && msg.senderRole === 'admin');

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end space-x-2 ${
                        isCurrentUser ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {!isCurrentUser && (
                        <img
                          src={msg.senderAvatar}
                          alt={msg.senderName}
                          className="h-7 w-7 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                        />
                      )}
                      <div
                        className={`max-w-[78%] rounded-2xl p-3.5 text-xs ${
                          isCurrentUser
                            ? 'bg-indigo-600 text-white rounded-br-xs'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-xs'
                        }`}
                      >
                        <div
                          className={`text-[10px] font-bold mb-1 ${
                            isCurrentUser ? 'text-indigo-200' : 'text-slate-500'
                          }`}
                        >
                          {msg.senderName}
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        <div
                          className={`text-[9px] mt-1 text-right ${
                            isCurrentUser ? 'text-indigo-200' : 'text-slate-400'
                          }`}
                        >
                          {msg.timestamp}
                        </div>
                      </div>
                      {isCurrentUser && (
                        <img
                          src={msg.senderAvatar}
                          alt={msg.senderName}
                          className="h-7 w-7 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Quick Prompts Bar */}
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center space-x-2 overflow-x-auto scrollbar-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">
                  Quick Prompt:
                </span>
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMessageInput(prompt)}
                    className="text-[11px] whitespace-nowrap bg-white border border-slate-200 px-2.5 py-1 rounded-full text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Chat Input Box */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`Write a message as ${
                    currentRole === 'parent'
                      ? 'Eleanor Vance (Parent)'
                      : currentRole === 'teacher'
                      ? 'Mrs. Sarah Jenkins'
                      : currentStudent.name
                  }...`}
                  className="flex-1 text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 focus:border-indigo-500 outline-hidden"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="md:col-span-8 flex items-center justify-center p-8 text-slate-400 text-xs">
              Select or start a conversation to communicate.
            </div>
          )}
        </div>
      )}

      {/* ANNOUNCEMENTS TAB */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search circulars, exam dates, events..."
                className="w-full text-xs pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl focus:border-indigo-500 outline-hidden"
              />
            </div>
            <span className="text-xs text-slate-500 ml-4">
              {filteredAnnouncements.length} Published Circulars
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAnnouncements.map((ann) => (
              <div
                key={ann.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wider">
                      {ann.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        ann.priority === 'urgent'
                          ? 'bg-rose-100 text-rose-800'
                          : ann.priority === 'important'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {ann.priority} Notice
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {ann.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {ann.content}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-semibold text-slate-700">{ann.author}</span>
                    <span>({ann.authorRole})</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>{ann.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NEW CONVERSATION MODAL */}
      {showNewThreadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Start Direct Message</h3>
              <button
                onClick={() => setShowNewThreadModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewThread} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recipient Educator
                </label>
                <select
                  value={newRecipientId}
                  onChange={(e) => setNewRecipientId(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-white"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subjects.join(', ')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Olympiad registration inquiry"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:border-indigo-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Message</label>
                <textarea
                  required
                  rows={4}
                  value={newInitialMsg}
                  onChange={(e) => setNewInitialMsg(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:border-indigo-500 outline-hidden resize-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewThreadModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
