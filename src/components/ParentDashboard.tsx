import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  CalendarCheck2,
  Award,
  CreditCard,
  BookOpen,
  ArrowRight,
  MessageCircle,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  TrendingUp,
  User,
  GraduationCap,
  Calendar,
  Send,
} from 'lucide-react';

interface ParentDashboardProps {
  onOpenFeePaymentModal?: (invoiceId: string) => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ onOpenFeePaymentModal }) => {
  const {
    currentStudent,
    students,
    selectedChildId,
    setSelectedChildId,
    attendance,
    examReports,
    fees,
    assignments,
    submissions,
    threads,
    announcements,
    setActiveTab,
    createThread,
    showToast,
  } = useSchool();

  const [quickTeacherNote, setQuickTeacherNote] = useState('');
  const [isSendingNote, setIsSendingNote] = useState(false);

  // Student specific data
  const studentAttendance = attendance.filter((a) => a.studentId === currentStudent.id);
  const totalDays = studentAttendance.length;
  const presentDays = studentAttendance.filter((a) => a.status === 'present').length;
  const lateDays = studentAttendance.filter((a) => a.status === 'late').length;
  const excusedDays = studentAttendance.filter((a) => a.status === 'excused').length;
  const attendanceRate = totalDays > 0 ? (((presentDays + excusedDays + lateDays * 0.5) / totalDays) * 100).toFixed(1) : '96.0';

  // Latest exam
  const studentReport = examReports.find((r) => r.studentId === currentStudent.id) || examReports[0];

  // Fee summary
  const studentFees = fees.filter((f) => f.studentId === currentStudent.id);
  const pendingFees = studentFees.filter((f) => f.status === 'pending' || f.status === 'overdue');
  const overdueFees = studentFees.filter((f) => f.status === 'overdue');
  const totalDue = pendingFees.reduce((sum, f) => sum + f.amount, 0);

  // Assignments
  const studentSubmissions = submissions.filter((s) => s.studentId === currentStudent.id);
  const gradedCount = studentSubmissions.filter((s) => s.status === 'graded').length;
  const classAssignments = assignments.filter((a) => a.grade.includes(currentStudent.grade.replace('Grade ', '')));
  const pendingAssignmentCount = Math.max(0, classAssignments.length - studentSubmissions.length);

  // Latest teacher thread
  const parentTeacherThread = threads.find((t) => t.category === 'teacher-parent');

  const handleSendQuickNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTeacherNote.trim()) return;
    setIsSendingNote(true);
    createThread('tch-1', `Parent Note regarding ${currentStudent.name}`, quickTeacherNote, 'teacher-parent');
    setQuickTeacherNote('');
    setIsSendingNote(false);
    showToast(`Note delivered to Mrs. Folashade Adeyemi (Form Mistress)`);
  };

  return (
    <div className="space-y-6">
      {/* School Campus & Student Profile Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
        {/* Campus Header Photo with subtle overlay */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-slate-900">
          <img
            src="/src/assets/images/nigerian_school_campus_1789632890673.jpg"
            alt="Premier Crest College Campus, Lagos"
            className="w-full h-full object-cover object-center opacity-85 hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent"></div>
          
          <div className="absolute top-4 left-4 sm:left-6 flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/90 text-white shadow-sm backdrop-blur-md">
              Premier Crest College, Lagos
            </span>
            <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-black/40 text-slate-200 backdrop-blur-md border border-white/20">
              WAEC & NECO Center • Victoria Island
            </span>
          </div>

          <div className="absolute bottom-4 right-4 sm:right-6 hidden sm:flex items-center space-x-2">
            <div className="flex -space-x-2 overflow-hidden">
              <img className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover" src="/src/assets/images/nigerian_student_boy_1789632860127.jpg" alt="Student" />
              <img className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover" src="/src/assets/images/nigerian_student_girl_1789632872335.jpg" alt="Student" />
              <img className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover" src="/src/assets/images/nigerian_teacher_portrait_1789632910125.jpg" alt="Teacher" />
            </div>
            <span className="text-xs text-white/90 font-medium">Session 2025/2026</span>
          </div>
        </div>

        {/* Student Profile Card Bar */}
        <div className="p-5 sm:p-6 -mt-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex items-end space-x-4">
              <div className="relative">
                <img
                  src={currentStudent.avatar}
                  alt={currentStudent.name}
                  className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-cover ring-4 ring-white shadow-md bg-white"
                />
                <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full ring-2 ring-white" title="Active Student in School">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
              </div>
              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                    {currentStudent.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {currentStudent.grade} • {currentStudent.section}
                  </span>
                  {currentStudent.house && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {currentStudent.house}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Reg No: <span className="font-semibold text-slate-700">{currentStudent.rollNumber}</span> • Form Mistress: <span className="font-semibold text-slate-700">{currentStudent.id === 'std-1' ? 'Mrs. Folashade Adeyemi' : 'Ms. Ngozi Okeke'}</span>
                </p>
                <div className="flex items-center space-x-3 mt-1.5 text-xs text-slate-500">
                  <span className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                    Present in School (Assembly marked 7:45 AM)
                  </span>
                  <span>•</span>
                  <span>Block C, Room 204</span>
                </div>
              </div>
            </div>

            {/* Child Switcher Pills */}
            <div className="flex items-center self-start md:self-end bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium px-2">Switch Child:</span>
              {students
                .filter((s) => s.id === 'std-1' || s.id === 'std-2')
                .map((child) => (
                  <button
                    key={child.id}
                    id={`select-child-btn-${child.id}`}
                    onClick={() => setSelectedChildId(child.id)}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedChildId === child.id
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <img src={child.avatar} alt={child.name} className="h-5 w-5 rounded-full object-cover" />
                    <span>{child.name.split(' ')[0]}</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Attendance Card */}
        <div
          onClick={() => setActiveTab('attendance')}
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Attendance Rate</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-900">{attendanceRate}%</div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Good Standing
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full"
              style={{ width: `${attendanceRate}%` }}
            ></div>
          </div>
          <p className="mt-3 text-xs text-slate-500 flex items-center justify-between">
            <span>{presentDays} Present • {lateDays} Tardy • {excusedDays} Excused</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </p>
        </div>

        {/* 2. Results & Grades Card */}
        <div
          onClick={() => setActiveTab('results')}
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Academic Term GPA</span>
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-900">
              {studentReport?.gpa || '3.90'} <span className="text-xs text-slate-400 font-normal">/ 4.0</span>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
              Rank #{studentReport?.rank || 3} of {studentReport?.totalStudentsInClass || 32}
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-1.5 rounded-full"
              style={{ width: `${((studentReport?.gpa || 3.9) / 4.0) * 100}%` }}
            ></div>
          </div>
          <p className="mt-3 text-xs text-slate-500 flex items-center justify-between">
            <span>Overall: {studentReport?.percentage || 90.3}% (Grade A+)</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </p>
        </div>

        {/* 3. Outstanding Fees Card */}
        <div
          onClick={() => setActiveTab('fees')}
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fee Invoices</span>
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${
              overdueFees.length > 0 ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
            }`}>
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-900">
              ₦{totalDue.toLocaleString('en-NG')}
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              overdueFees.length > 0 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {overdueFees.length > 0 ? `${overdueFees.length} Overdue` : `${pendingFees.length} Pending`}
            </span>
          </div>
          <div className="mt-3 flex items-center space-x-1.5 text-xs text-slate-500">
            {overdueFees.length > 0 ? (
              <span className="text-rose-600 font-semibold flex items-center">
                <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                Action required: Annual PTA Levy overdue
              </span>
            ) : (
              <span>2nd Term Tuition due on Mar 31</span>
            )}
          </div>
          <p className="mt-3 text-xs text-indigo-600 font-semibold flex items-center justify-between">
            <span>Click to view & pay online</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </p>
        </div>

        {/* 4. Assignments & Homework Card */}
        <div
          onClick={() => setActiveTab('assignments')}
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assignments</span>
            <div className="h-9 w-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <BookOpen className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-900">
              {pendingAssignmentCount} <span className="text-xs text-slate-400 font-normal">due soon</span>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-800">
              {gradedCount} Graded
            </span>
          </div>
          <div className="mt-3 flex items-center space-x-1.5 text-xs text-slate-500">
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            <span>Physics Optics lab report due Sept 24</span>
          </div>
          <p className="mt-3 text-xs text-slate-500 flex items-center justify-between">
            <span>Latest: WAEC CBT Normalization (49/50)</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </p>
        </div>
      </div>

      {/* Two-Column Middle Section: Academic Performance & Immediate Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Subject Performance & Academic Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Subject Performance Overview
                </h2>
                <p className="text-xs text-slate-500">
                  {studentReport?.examTitle} • Class Average Comparison
                </p>
              </div>
              <button
                onClick={() => setActiveTab('results')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                <span>View Full Report Card</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </button>
            </div>

            <div className="space-y-4">
              {studentReport?.scores.slice(0, 5).map((subject) => {
                const percentage = (subject.score / subject.maxScore) * 100;
                return (
                  <div key={subject.code} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-800">{subject.subject}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                          {subject.code}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs">
                        <span className="text-slate-500 hidden sm:inline">
                          Class Avg: {subject.classAverage}
                        </span>
                        <span className="font-bold text-slate-900">
                          {subject.score}/{subject.maxScore}
                        </span>
                        <span className="font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs">
                          {subject.grade}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 relative overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start space-x-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Teacher's Note:</span>{' '}
                "{studentReport?.generalRemarks}"
              </div>
            </div>
          </div>

          {/* Outstanding Invoices Quick Settlement */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Fee Payments & Invoices
                </h2>
                <p className="text-xs text-slate-500">
                  Secure instant online payment with downloadable tax-compliant receipts
                </p>
              </div>
              <button
                onClick={() => setActiveTab('fees')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                <span>All Invoices</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {studentFees.map((inv) => (
                <div key={inv.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-xl mt-0.5 ${
                      inv.status === 'paid'
                        ? 'bg-emerald-50 text-emerald-600'
                        : inv.status === 'overdue'
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}>
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-slate-900">{inv.title}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          inv.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.status === 'overdue'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {inv.invoiceNumber} • Due by {inv.dueDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900">₦{inv.amount.toLocaleString('en-NG')}</div>
                      <span className="text-[11px] text-slate-400">{inv.category}</span>
                    </div>

                    {inv.status !== 'paid' ? (
                      <button
                        id={`pay-fee-btn-${inv.id}`}
                        onClick={() => {
                          if (onOpenFeePaymentModal) {
                            onOpenFeePaymentModal(inv.id);
                          } else {
                            setActiveTab('fees');
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-xs"
                      >
                        Pay Online (Paystack/NIP)
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveTab('fees')}
                        className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition-colors"
                      >
                        Receipt
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Teacher Connect & School Circulars */}
        <div className="space-y-6">
          {/* Quick Message to Form Mistress */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center space-x-3 mb-4">
              <img
                src={currentStudent.id === 'std-1' ? '/src/assets/images/nigerian_teacher_portrait_1789632910125.jpg' : 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80'}
                alt="Form Mistress"
                className="h-11 w-11 rounded-full object-cover ring-2 ring-emerald-100"
              />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Message Form Mistress</h3>
                <p className="text-xs text-slate-500">
                  {currentStudent.id === 'std-1' ? 'Mrs. Folashade Adeyemi (SSS 2 - Alpha)' : 'Ms. Ngozi Okeke (JSS 1 - Beta)'}
                </p>
              </div>
            </div>

            {parentTeacherThread && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 mb-3 text-xs text-slate-600">
                <span className="font-semibold text-slate-700 block mb-1">Recent exchange:</span>
                <p className="italic line-clamp-2">"{parentTeacherThread.lastMessagePreview}"</p>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {parentTeacherThread.lastMessageTimestamp}
                </span>
              </div>
            )}

            <form onSubmit={handleSendQuickNote} className="space-y-2">
              <textarea
                value={quickTeacherNote}
                onChange={(e) => setQuickTeacherNote(e.target.value)}
                placeholder={`Ask ${currentStudent.id === 'std-1' ? 'Mrs. Adeyemi' : 'Ms. Okeke'} a question about ${currentStudent.name}...`}
                rows={3}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-hidden resize-none"
              ></textarea>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('communication')}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-medium"
                >
                  Open Messages
                </button>
                <button
                  type="submit"
                  disabled={!quickTeacherNote.trim() || isSendingNote}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  <Send className="h-3 w-3" />
                  <span>Send Note</span>
                </button>
              </div>
            </form>
          </div>

          {/* School Announcements / Circulars for Parents */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">School Notices</h3>
              <button
                onClick={() => setActiveTab('communication')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {announcements.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.priority === 'urgent'
                        ? 'bg-rose-100 text-rose-800'
                        : item.priority === 'important'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {item.priority}
                    </span>
                    <span className="text-[11px] text-slate-400">{item.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
