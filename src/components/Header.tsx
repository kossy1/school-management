import React from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  GraduationCap,
  Bell,
  Users,
  UserCheck,
  RotateCcw,
  Sparkles,
  School,
  ChevronDown
} from 'lucide-react';
import { UserRole } from '../types';

export const Header: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    students,
    selectedChildId,
    setSelectedChildId,
    currentStudent,
    resetToDemoData,
    threads,
  } = useSchool();

  const parentChildren = students.filter((s) => s.id === 'std-1' || s.id === 'std-2');
  const totalUnreadMessages = threads.reduce((acc, t) => acc + (t.unreadCount || 0), 0);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* School Brand */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm ring-2 ring-indigo-100">
              <School className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-slate-900">
                  Premier Crest College
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  2nd Term • 2025/2026 Session
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Victoria Island, Lagos • WAEC & NECO Accredited Portal
              </p>
            </div>
          </div>

          {/* Right Section: Role Selector, Child Switcher (if Parent), Notifications & Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Role Switcher Pill */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <span className="text-xs font-medium text-slate-500 px-2 hidden lg:inline">
                Role:
              </span>
              {(['parent', 'teacher', 'student', 'admin'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  id={`role-btn-${role}`}
                  onClick={() => setCurrentRole(role)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg capitalize transition-all duration-150 ${
                    currentRole === role
                      ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {role === 'parent' ? 'Parent Portal' : role}
                </button>
              ))}
            </div>

            {/* Child Switcher (Only visible in Parent Role) */}
            {currentRole === 'parent' && (
              <div className="relative">
                <div className="flex items-center bg-indigo-50/80 border border-indigo-200/80 rounded-xl px-2.5 py-1 space-x-2">
                  <span className="text-xs text-indigo-600 font-medium hidden md:inline">Child:</span>
                  <select
                    id="parent-child-select"
                    value={selectedChildId}
                    onChange={(e) => setSelectedChildId(e.target.value)}
                    className="bg-transparent text-xs font-semibold text-indigo-900 focus:outline-hidden cursor-pointer"
                  >
                    {parentChildren.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.grade}-{c.section})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Reset Demo Data Button */}
            <button
              onClick={resetToDemoData}
              title="Reset demo data to default"
              id="reset-demo-btn"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            {/* Notification Badge */}
            <div className="relative">
              <div
                title={`${totalUnreadMessages} new communications`}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors relative"
              >
                <Bell className="h-4 w-4" />
                {totalUnreadMessages > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
                )}
              </div>
            </div>

            {/* Profile Avatar & Name */}
            <div className="flex items-center space-x-2 pl-1 border-l border-slate-200">
              <img
                src={
                  currentRole === 'parent'
                    ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
                    : currentRole === 'teacher'
                    ? '/src/assets/images/nigerian_teacher_portrait_1789632910125.jpg'
                    : currentRole === 'student'
                    ? currentStudent.avatar
                    : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                }
                alt="User Avatar"
                className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200"
              />
              <div className="hidden xl:block text-left">
                <p className="text-xs font-semibold text-slate-800 leading-tight">
                  {currentRole === 'parent'
                    ? 'Dr. (Mrs.) Funke Adeleke'
                    : currentRole === 'teacher'
                    ? 'Mrs. Folashade Adeyemi'
                    : currentRole === 'student'
                    ? currentStudent.name
                    : 'Bursar & Registry'}
                </p>
                <p className="text-[11px] text-slate-500 capitalize">
                  {currentRole === 'parent'
                    ? `Parent (${currentStudent.name.split(' ')[0]})`
                    : currentRole === 'teacher'
                    ? 'Form Mistress (SSS 2)'
                    : currentRole === 'student'
                    ? `${currentStudent.grade} • ${currentStudent.section}`
                    : 'Admin Office'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
