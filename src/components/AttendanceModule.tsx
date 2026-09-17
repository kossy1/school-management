import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { AttendanceStatus } from '../types';
import {
  CalendarCheck,
  Check,
  X,
  Clock,
  ShieldCheck,
  AlertCircle,
  Bell,
  Users,
  Calendar,
  Save,
  Send,
  PlusCircle,
  Filter,
} from 'lucide-react';

export const AttendanceModule: React.FC = () => {
  const {
    currentRole,
    currentStudent,
    students,
    attendance,
    markAttendance,
    notifyParentOfAbsence,
    showToast,
  } = useSchool();

  // Teacher mode states
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedClass, setSelectedClass] = useState('SSS 2-Alpha');
  
  // Roster attendance state for teacher marking
  const classStudents = students.filter(
    (s) => `${s.grade}-${s.section}` === selectedClass || selectedClass === 'All' || s.grade.includes(selectedClass.split('-')[0])
  );
  
  const [markingState, setMarkingState] = useState<Record<string, { status: AttendanceStatus; remarks: string }>>(() => {
    const initial: Record<string, { status: AttendanceStatus; remarks: string }> = {};
    classStudents.forEach((st) => {
      const existing = attendance.find((a) => a.studentId === st.id && a.date === todayStr);
      initial[st.id] = {
        status: existing?.status || 'present',
        remarks: existing?.remarks || '',
      };
    });
    return initial;
  });

  // Parent/Student Leave Request modal state
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  // Parent/Student specific view data
  const studentRecords = attendance.filter((a) => a.studentId === currentStudent.id);
  const totalDays = studentRecords.length || 1;
  const presentCount = studentRecords.filter((a) => a.status === 'present').length;
  const lateCount = studentRecords.filter((a) => a.status === 'late').length;
  const excusedCount = studentRecords.filter((a) => a.status === 'excused').length;
  const absentCount = studentRecords.filter((a) => a.status === 'absent').length;
  const overallRate = (((presentCount + excusedCount + lateCount * 0.5) / totalDays) * 100).toFixed(1);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setMarkingState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleRemarkChange = (studentId: string, remarks: string) => {
    setMarkingState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const handleMarkAllPresent = () => {
    setMarkingState((prev) => {
      const updated = { ...prev };
      classStudents.forEach((st) => {
        updated[st.id] = { status: 'present', remarks: 'Present on time' };
      });
      return updated;
    });
    showToast('All students marked as Present');
  };

  const handleSaveAttendance = () => {
    const records = classStudents.map((st) => ({
      studentId: st.id,
      status: markingState[st.id]?.status || 'present',
      remarks: markingState[st.id]?.remarks || '',
    }));

    markAttendance(records, selectedDate);
  };

  const handleNotifyAbsentees = () => {
    let notifiedCount = 0;
    classStudents.forEach((st) => {
      const state = markingState[st.id];
      if (state && (state.status === 'absent' || state.status === 'late')) {
        notifyParentOfAbsence(st.id, selectedDate, state.remarks);
        notifiedCount++;
      }
    });

    if (notifiedCount === 0) {
      showToast('No absent students to notify on this date.');
    }
  };

  const handleSubmitLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveDate || !leaveReason) return;

    markAttendance(
      [
        {
          studentId: currentStudent.id,
          status: 'excused',
          remarks: `Parent Request: ${leaveReason}`,
        },
      ],
      leaveDate
    );

    setShowLeaveModal(false);
    setLeaveDate('');
    setLeaveReason('');
    showToast(`Leave request recorded for ${currentStudent.name} on ${leaveDate}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Mode Switch Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <CalendarCheck className="h-5 w-5 text-indigo-600" />
            <span>
              {currentRole === 'teacher' || currentRole === 'admin'
                ? 'Class Attendance Management'
                : `Attendance Record: ${currentStudent.name}`}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {currentRole === 'teacher' || currentRole === 'admin'
              ? 'Mark and review daily class attendance records and trigger parent alerts.'
              : `Official school attendance register for ${currentStudent.grade}-${currentStudent.section}`}
          </p>
        </div>

        {currentRole === 'parent' || currentRole === 'student' ? (
          <button
            onClick={() => setShowLeaveModal(true)}
            id="open-leave-modal-btn"
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-xs self-start sm:self-auto"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Submit Absence Note</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleMarkAllPresent}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Mark All Present
            </button>
            <button
              onClick={handleNotifyAbsentees}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold transition-colors"
            >
              <Bell className="h-3.5 w-3.5" />
              <span>Notify Absentee Parents</span>
            </button>
          </div>
        )}
      </div>

      {/* PARENT / STUDENT VIEW */}
      {(currentRole === 'parent' || currentRole === 'student') && (
        <div className="space-y-6">
          {/* Summary Metric Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Rate</span>
              <div className="text-xl font-bold text-indigo-600 mt-1">{overallRate}%</div>
              <span className="text-[11px] text-slate-400">Target: ≥ 90%</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Present Days</span>
              <div className="text-xl font-bold text-emerald-600 mt-1">{presentCount}</div>
              <span className="text-[11px] text-emerald-700">On time</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Late / Tardy</span>
              <div className="text-xl font-bold text-amber-600 mt-1">{lateCount}</div>
              <span className="text-[11px] text-amber-700">Bus / traffic</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Excused</span>
              <div className="text-xl font-bold text-sky-600 mt-1">{excusedCount}</div>
              <span className="text-[11px] text-sky-700">Medical / Doctor</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
              <span className="text-xs text-slate-500 font-medium">Unexcused</span>
              <div className="text-xl font-bold text-rose-600 mt-1">{absentCount}</div>
              <span className="text-[11px] text-rose-700">Action needed</span>
            </div>
          </div>

          {/* Detailed Attendance Log Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800">Recent Attendance Register</h3>
              <span className="text-xs text-slate-500">{studentRecords.length} recorded school days</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Remarks / Explanation</th>
                    <th className="py-3 px-4">Parent Alert Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                        {rec.date}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                            rec.status === 'present'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rec.status === 'late'
                              ? 'bg-amber-100 text-amber-800'
                              : rec.status === 'excused'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {rec.status === 'present' && <Check className="h-3 w-3 mr-0.5" />}
                          {rec.status === 'late' && <Clock className="h-3 w-3 mr-0.5" />}
                          {rec.status === 'excused' && <ShieldCheck className="h-3 w-3 mr-0.5" />}
                          {rec.status === 'absent' && <X className="h-3 w-3 mr-0.5" />}
                          <span>{rec.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {rec.remarks || '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {rec.status === 'present' ? (
                          <span className="text-slate-400 text-[11px]">Normal attendance</span>
                        ) : rec.notifiedParent ? (
                          <span className="text-emerald-700 font-medium text-[11px] flex items-center">
                            <Check className="h-3 w-3 mr-1 text-emerald-600" />
                            Parent Notified via SMS
                          </span>
                        ) : (
                          <span className="text-amber-600 text-[11px]">Pending verification</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TEACHER / ADMIN ATTENDANCE MARKING ROSTER */}
      {(currentRole === 'teacher' || currentRole === 'admin') && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-4">
          {/* Controls Bar */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase">Class Form</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="mt-0.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800"
                >
                  <option value="SSS 2-Alpha">SSS 2 - Alpha (Senior Secondary Science)</option>
                  <option value="JSS 1-Beta">JSS 1 - Beta (Junior Secondary)</option>
                  <option value="All">All Registered Forms</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase">Attendance Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="mt-0.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800"
                />
              </div>
            </div>

            <button
              onClick={handleSaveAttendance}
              id="save-attendance-btn"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              <Save className="h-4 w-4" />
              <span>Save & Publish Register</span>
            </button>
          </div>

          {/* Student Roster Table */}
          <div className="overflow-x-auto px-4 pb-4">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Roll No</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3">Teacher Remarks</th>
                  <th className="py-2.5 px-3">Parent Notification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classStudents.map((st) => {
                  const state = markingState[st.id] || { status: 'present', remarks: '' };
                  return (
                    <tr key={st.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-3">
                          <img
                            src={st.avatar}
                            alt={st.name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{st.name}</span>
                            <span className="text-[11px] text-slate-500">{st.parentName} (Parent)</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700">{st.rollNumber}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center space-x-1 bg-slate-100 p-1 rounded-xl w-fit mx-auto border border-slate-200">
                          {(['present', 'late', 'absent', 'excused'] as AttendanceStatus[]).map((stat) => (
                            <button
                              key={stat}
                              type="button"
                              onClick={() => handleStatusChange(st.id, stat)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all ${
                                state.status === stat
                                  ? stat === 'present'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : stat === 'late'
                                    ? 'bg-amber-500 text-white shadow-xs'
                                    : stat === 'excused'
                                    ? 'bg-sky-600 text-white shadow-xs'
                                    : 'bg-rose-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              {stat}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={state.remarks}
                          onChange={(e) => handleRemarkChange(st.id, e.target.value)}
                          placeholder="Optional remark..."
                          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:bg-white focus:border-indigo-500 outline-hidden"
                        />
                      </td>
                      <td className="py-3 px-3">
                        {state.status === 'absent' || state.status === 'late' ? (
                          <button
                            type="button"
                            onClick={() => notifyParentOfAbsence(st.id, selectedDate, state.remarks)}
                            className="text-xs text-rose-600 font-semibold hover:text-rose-800 underline inline-flex items-center"
                          >
                            <Send className="h-3 w-3 mr-1" />
                            <span>Alert Parent</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs">Present</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Leave Request Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Submit Absence / Leave Note</h3>
              <button
                onClick={() => setShowLeaveModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitLeave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Student</label>
                <input
                  type="text"
                  disabled
                  value={`${currentStudent.name} (${currentStudent.grade}-${currentStudent.section})`}
                  className="w-full text-xs bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-slate-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Absence</label>
                <input
                  type="date"
                  required
                  value={leaveDate}
                  onChange={(e) => setLeaveDate(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:border-indigo-500 outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason / Note for Teacher</label>
                <textarea
                  required
                  rows={3}
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="E.g., Medical appointment, family emergency, sickness..."
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:border-indigo-500 outline-hidden resize-none"
                ></textarea>
              </div>
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                >
                  Submit to School
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
