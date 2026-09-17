import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  Award,
  Printer,
  TrendingUp,
  FileCheck,
  CheckCircle2,
  Calendar,
  School,
  Sparkles,
  BarChart2,
  ChevronDown,
} from 'lucide-react';
import { ExamReport } from '../types';

export const ResultsModule: React.FC = () => {
  const { currentStudent, examReports, currentRole, students, showToast } = useSchool();

  // Selected student (if teacher/admin, allow switching student)
  const [selectedStudentId, setSelectedStudentId] = useState(currentStudent.id);
  const activeStudent = students.find((s) => s.id === selectedStudentId) || currentStudent;

  // Filter exam reports for active student
  const studentReports = examReports.filter((r) => r.studentId === activeStudent.id);
  const [selectedExamId, setSelectedExamId] = useState<string>(
    studentReports[0]?.id || examReports[0]?.id || ''
  );

  const activeReport: ExamReport | undefined =
    studentReports.find((r) => r.id === selectedExamId) || studentReports[0] || examReports[0];

  const handlePrint = () => {
    window.print();
    showToast('Sent report card to print preview');
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Award className="h-5 w-5 text-indigo-600" />
            <span>Academic Performance & Report Cards</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified transcripts, continuous assessments, and term evaluation reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Student Selector if Teacher/Admin */}
          {(currentRole === 'teacher' || currentRole === 'admin') && (
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
              <span className="text-xs text-slate-500 font-medium">Student:</span>
              <select
                value={selectedStudentId}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  const newRep = examReports.find((r) => r.studentId === e.target.value);
                  if (newRep) setSelectedExamId(newRep.id);
                }}
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-hidden"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.grade}-{st.section})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Exam Term Selector */}
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
            <span className="text-xs text-slate-500 font-medium">Evaluation:</span>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-hidden"
            >
              {studentReports.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.examTitle}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handlePrint}
            id="print-report-btn"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span>Print Report Card</span>
          </button>
        </div>
      </div>

      {activeReport ? (
        <div className="space-y-6">
          {/* Key Overall Standing Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Overall GPA</span>
              <div className="text-2xl font-black text-indigo-600 mt-1">
                {activeReport.gpa.toFixed(2)} <span className="text-xs text-slate-400 font-normal">/ 4.0</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-medium">Grade Honors</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Marks</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {activeReport.totalScore} <span className="text-xs text-slate-400 font-normal">/ {activeReport.maxTotalScore}</span>
              </div>
              <span className="text-[11px] text-indigo-600 font-semibold">{activeReport.percentage.toFixed(1)}% Aggregate</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Class Rank</span>
              <div className="text-2xl font-black text-amber-600 mt-1">
                #{activeReport.rank} <span className="text-xs text-slate-400 font-normal">of {activeReport.totalStudentsInClass}</span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Top 10th Percentile</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Term Attendance</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                {activeReport.attendancePercentage}%
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Satisfactory requirement</span>
            </div>
          </div>

          {/* Official Report Card Printable Canvas */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            {/* School Crest & Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xl shadow-xs">
                  <School className="h-9 w-9" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                    PREMIER CREST COLLEGE, LAGOS
                  </h1>
                  <p className="text-xs text-slate-500">
                    Department of Academic Planning & Records • WAEC, NECO & BECE Center #LGS-9041
                  </p>
                  <p className="text-xs font-semibold text-emerald-700 mt-0.5 uppercase tracking-wide">
                    Terminal Student Academic Report & Continuous Assessment (CA) Sheet
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right text-xs text-slate-600 space-y-0.5 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <p><span className="font-semibold text-slate-800">Academic Session:</span> {activeReport.academicYear}</p>
                <p><span className="font-semibold text-slate-800">Evaluation:</span> {activeReport.examTitle}</p>
                <p><span className="font-semibold text-slate-800">Date Issued:</span> {activeReport.issueDate}</p>
                <p><span className="font-semibold text-emerald-700">Next Term Begins:</span> {activeReport.nextTermBegins || '12th Jan 2026'}</p>
              </div>
            </div>

            {/* WAEC & NECO Grading Standard Banner */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 text-[11px] text-emerald-900 flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold flex items-center">
                <Award className="h-3.5 w-3.5 mr-1 text-emerald-700" />
                WAEC / NECO Standard:
              </span>
              <span><strong>A1:</strong> 75–100% (Excellent)</span>
              <span><strong>B2:</strong> 70–74% (Very Good)</span>
              <span><strong>B3:</strong> 65–69% (Good)</span>
              <span><strong>C4–C6:</strong> 50–64% (Credit)</span>
              <span><strong>D7–E8:</strong> 40–49% (Pass)</span>
              <span><strong>F9:</strong> 0–39% (Fail)</span>
            </div>

            {/* Student Bio Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs">
              <div className="col-span-2 sm:col-span-1 flex items-center space-x-3">
                <img src={activeStudent.avatar} alt={activeStudent.name} className="h-11 w-11 rounded-xl object-cover ring-2 ring-emerald-500/20" />
                <div>
                  <span className="text-slate-400 block text-[10px]">Student Name</span>
                  <span className="font-bold text-slate-900 text-xs">{activeStudent.name}</span>
                </div>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Admission Reg No</span>
                <span className="font-mono font-bold text-slate-900">{activeStudent.rollNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Class & Track</span>
                <span className="font-bold text-slate-900">{activeStudent.grade} ({activeStudent.section})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Inter-House Sports</span>
                <span className="font-semibold text-emerald-800">{activeStudent.house || 'Azikiwe House'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Parent / Guardian</span>
                <span className="font-bold text-slate-900 truncate block">{activeStudent.parentName}</span>
              </div>
            </div>

            {/* Subject-Wise Marks Breakdown Table with CA */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100/80 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-3 text-center">Code</th>
                    <th className="py-3 px-2 text-center" title="Continuous Assessment 1 (10 marks)">CA 1 (10)</th>
                    <th className="py-3 px-2 text-center" title="Continuous Assessment 2 (10 marks)">CA 2 (10)</th>
                    <th className="py-3 px-2 text-center" title="Practical / Project (10 marks)">Proj (10)</th>
                    <th className="py-3 px-2 text-center" title="Terminal Exam (70 marks)">Exam (70)</th>
                    <th className="py-3 px-3 text-center">Total (100)</th>
                    <th className="py-3 px-3 text-center">WAEC Grade</th>
                    <th className="py-3 px-3 text-center">Class Avg</th>
                    <th className="py-3 px-4">Subject Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {activeReport.scores.map((s) => {
                    const ca1 = s.ca1Score ?? Math.round((s.score * 0.1));
                    const ca2 = s.ca2Score ?? Math.round((s.score * 0.1));
                    const proj = s.projectScore ?? Math.round((s.score * 0.1));
                    const exam = s.examScore ?? (s.score - (ca1 + ca2 + proj));
                    return (
                      <tr key={s.code} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold text-slate-800">{s.subject}</td>
                        <td className="py-3 px-3 text-center font-mono text-[11px] text-slate-500">{s.code}</td>
                        <td className="py-3 px-2 text-center text-slate-600">{ca1}</td>
                        <td className="py-3 px-2 text-center text-slate-600">{ca2}</td>
                        <td className="py-3 px-2 text-center text-slate-600">{proj}</td>
                        <td className="py-3 px-2 text-center text-slate-700 font-medium">{exam}</td>
                        <td className="py-3 px-3 text-center font-bold text-emerald-800 bg-emerald-50/30">{s.score}</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                            s.grade.startsWith('A')
                              ? 'bg-emerald-100 text-emerald-800'
                              : s.grade.startsWith('B')
                              ? 'bg-indigo-100 text-indigo-800'
                              : s.grade.startsWith('C')
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {s.grade}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center text-slate-500">{s.classAverage}</td>
                        <td className="py-3 px-4 text-slate-600 italic text-[11px] max-w-xs">{s.teacherRemarks}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-300">
                  <tr>
                    <td className="py-3 px-4">Aggregate Total</td>
                    <td className="py-3 px-3 text-center">—</td>
                    <td className="py-3 px-2 text-center" colSpan={4}>Continuous Assessment + Terminal Examination</td>
                    <td className="py-3 px-3 text-center text-emerald-800 font-extrabold">{activeReport.totalScore} / {activeReport.maxTotalScore}</td>
                    <td className="py-3 px-3 text-center text-emerald-700">{activeReport.percentage.toFixed(1)}% (A1)</td>
                    <td className="py-3 px-3 text-center">75.2</td>
                    <td className="py-3 px-4 text-slate-600 font-normal">Passed with Distinction (Honours)</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Affective & Psychomotor Traits Domain (Nigerian Standard) */}
            {activeReport.affectiveTraits && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 mb-2 uppercase tracking-wide">Affective Behaviour Ratings (Scale 1–5):</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {activeReport.affectiveTraits.map((t) => (
                      <div key={t.trait} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200/60">
                        <span className="text-slate-600">{t.trait}</span>
                        <div className="flex space-x-0.5 text-amber-500 font-bold">
                          {'★'.repeat(t.rating)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {activeReport.psychomotorSkills && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 mb-2 uppercase tracking-wide">Psychomotor & Practical Skills (Scale 1–5):</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {activeReport.psychomotorSkills.map((p) => (
                        <div key={p.skill} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200/60">
                          <span className="text-slate-600 truncate mr-1">{p.skill}</span>
                          <div className="flex space-x-0.5 text-emerald-600 font-bold">
                            {'★'.repeat(p.rating)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Remarks & Signatures Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-200">
              <div className="md:col-span-2 space-y-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-xs font-bold text-slate-800 block mb-1">
                    Form Mistress Remarks (Mrs. Folashade Adeyemi, B.Sc Ed, M.Sc):
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    "{activeReport.formTeacherRemarks || activeReport.generalRemarks}"
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80">
                  <span className="text-xs font-bold text-emerald-900 block mb-1">
                    Principal's Commendation:
                  </span>
                  <p className="text-xs text-emerald-800 leading-relaxed italic">
                    "{activeReport.principalRemarks || 'Commendable result. Keep up the high standard in the coming term.'}"
                  </p>
                </div>
              </div>

              <div className="flex flex-col justify-end text-center space-y-3 p-4 bg-slate-50/50 rounded-xl border border-slate-200/60">
                <div className="border-b border-slate-300 pb-2">
                  <span className="font-serif italic text-base text-slate-800">Folashade Adeyemi, Ph.D</span>
                  <p className="text-[10px] text-emerald-700 font-semibold uppercase">Official School Seal & Stamp Attached</p>
                </div>
                <div className="text-[11px] text-slate-600">
                  <p className="font-bold text-slate-900">Dr. (Mrs.) Folashade Adeyemi, Ph.D, FSTAN</p>
                  <p>Principal & Head of School, Premier Crest College</p>
                  <p className="text-[10px] text-slate-400 mt-1">Lagos State Ministry of Basic Education Reg #MED/9041</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
          No exam reports found for this student.
        </div>
      )}
    </div>
  );
};
