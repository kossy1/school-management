import React from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  CreditCard,
  Building,
  TrendingUp,
  FileSpreadsheet,
  Megaphone,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

export const AdminOverview: React.FC = () => {
  const { students, teachers, fees, attendance, announcements, showToast, setActiveTab } = useSchool();

  const totalFeeInvoiced = fees.reduce((sum, f) => sum + f.amount, 0);
  const totalFeeCollected = fees.filter((f) => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
  const feeCollectionRate = ((totalFeeCollected / totalFeeInvoiced) * 100).toFixed(1);

  const classes = [
    { name: 'Grade 10 - Section A', teacher: 'Mrs. Sarah Jenkins', students: 32, attendanceToday: '96.8%', avgGpa: '3.74' },
    { name: 'Grade 10 - Section B', teacher: 'Mr. Robert Taylor', students: 30, attendanceToday: '93.3%', avgGpa: '3.58' },
    { name: 'Grade 7 - Section B', teacher: 'Ms. Elena Rossi', students: 28, attendanceToday: '98.2%', avgGpa: '3.82' },
    { name: 'Grade 11 - Section A', teacher: 'Dr. William Vance', students: 29, attendanceToday: '95.0%', avgGpa: '3.65' },
  ];

  return (
    <div className="space-y-6">
      {/* Executive KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Total Enrolled</span>
            <Users className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">420</div>
          <span className="text-xs text-slate-500 mt-1 block">Across 14 Grade Divisions</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Overall Attendance Today</span>
            <CalendarCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">96.4%</div>
          <span className="text-xs text-emerald-700 mt-1 block">405 of 420 Students Present</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Fee Recovery Rate</span>
            <CreditCard className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{feeCollectionRate}%</div>
          <span className="text-xs text-slate-500 mt-1 block">
            ${totalFeeCollected.toFixed(0)} of ${totalFeeInvoiced.toFixed(0)}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Faculty & Educators</span>
            <GraduationCap className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">38</div>
          <span className="text-xs text-slate-500 mt-1 block">1:11 Teacher-Student Ratio</span>
        </div>
      </div>

      {/* Class Analytics Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Class Performance & Attendance Index</h3>
            <p className="text-xs text-slate-500">Live section metrics for academic leadership</p>
          </div>
          <button
            onClick={() => showToast('Exported school analytics to CSV')}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Class & Section</th>
                <th className="py-3 px-4">Class Mentor</th>
                <th className="py-3 px-4 text-center">Enrollment</th>
                <th className="py-3 px-4 text-center">Today's Attendance</th>
                <th className="py-3 px-4 text-center">Average Section GPA</th>
                <th className="py-3 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classes.map((cls, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="py-3.5 px-4 font-bold text-slate-800">{cls.name}</td>
                  <td className="py-3.5 px-4 text-slate-600">{cls.teacher}</td>
                  <td className="py-3.5 px-4 text-center font-semibold text-slate-700">{cls.students}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-emerald-600">{cls.attendanceToday}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-indigo-700">{cls.avgGpa}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setActiveTab('attendance')}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      View Register
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Administrative Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setActiveTab('communication')}
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer flex items-center space-x-3 group"
        >
          <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              Broadcast School Circular
            </h4>
            <p className="text-[11px] text-slate-500">Dispatch urgent notice to parents & faculty</p>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('fees')}
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer flex items-center space-x-3 group"
        >
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              Generate Term Invoices
            </h4>
            <p className="text-[11px] text-slate-500">Batch tuition billing & receipt auditing</p>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('results')}
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer flex items-center space-x-3 group"
        >
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
              Audit Term Transcripts
            </h4>
            <p className="text-[11px] text-slate-500">Sign off official school gradebooks</p>
          </div>
        </div>
      </div>
    </div>
  );
};
