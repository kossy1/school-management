import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Assignment, AssignmentSubmission } from '../types';
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  UploadCloud,
  PlusCircle,
  Award,
  MessageSquare,
  AlertCircle,
  X,
  Send,
  User,
} from 'lucide-react';

export const AssignmentsModule: React.FC = () => {
  const {
    currentRole,
    currentStudent,
    assignments,
    submissions,
    createAssignment,
    submitAssignment,
    gradeAssignment,
    showToast,
  } = useSchool();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  // Submit Modal state
  const [activeAssignmentToSubmit, setActiveAssignmentToSubmit] = useState<Assignment | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionFileName, setSubmissionFileName] = useState('My_Assignment_Solution.pdf');

  // Teacher: Create Assignment Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Further Mathematics');
  const [newGrade, setNewGrade] = useState('SSS 2');
  const [newSection, setNewSection] = useState('Alpha');
  const [newDueDate, setNewDueDate] = useState('');
  const [newMaxPoints, setNewMaxPoints] = useState(100);
  const [newDescription, setNewDescription] = useState('');

  // Teacher: Grading Modal state
  const [activeSubmissionToGrade, setActiveSubmissionToGrade] = useState<AssignmentSubmission | null>(null);
  const [gradePoints, setGradePoints] = useState<number>(90);
  const [gradeFeedback, setGradeFeedback] = useState('');

  // Class assignments relevant to current student or teacher
  const relevantAssignments =
    currentRole === 'teacher' || currentRole === 'admin'
      ? assignments
      : assignments.filter(
          (a) =>
            a.grade.includes(currentStudent.grade) ||
            currentStudent.grade.includes(a.grade) ||
            (currentStudent.grade.startsWith('SSS') && a.grade.startsWith('SSS')) ||
            (currentStudent.grade.startsWith('JSS') && a.grade.startsWith('JSS'))
        );

  const subjectsList = Array.from(new Set(relevantAssignments.map((a) => a.subject)));

  const filteredAssignments = relevantAssignments.filter((asg) => {
    if (selectedSubject !== 'all' && asg.subject !== selectedSubject) return false;
    
    const sub = submissions.find((s) => s.assignmentId === asg.id && s.studentId === currentStudent.id);
    const status = sub?.status || 'pending';

    if (statusFilter === 'all') return true;
    return status === statusFilter;
  });

  const handleSubmitWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssignmentToSubmit || !submissionContent.trim()) return;

    submitAssignment(
      activeAssignmentToSubmit.id,
      currentStudent.id,
      submissionContent,
      submissionFileName
    );

    setActiveAssignmentToSubmit(null);
    setSubmissionContent('');
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDueDate) return;

    createAssignment({
      title: newTitle,
      subject: newSubject,
      grade: newGrade,
      section: newSection,
      teacherId: 'tch-1',
      teacherName: 'Mrs. Folashade Adeyemi',
      description: newDescription,
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: newDueDate,
      maxPoints: Number(newMaxPoints),
      attachmentName: `${newSubject.replace(/\s+/g, '_')}_Problem_Set.pdf`,
    });

    setShowCreateModal(false);
    setNewTitle('');
    setNewDescription('');
    setNewDueDate('');
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmissionToGrade) return;

    gradeAssignment(activeSubmissionToGrade.id, Number(gradePoints), gradeFeedback);
    setActiveSubmissionToGrade(null);
    setGradeFeedback('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            <span>Course Assignments & Project Submissions</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {currentRole === 'parent'
              ? `Tracking assignments, deadlines, and teacher feedback for ${currentStudent.name}`
              : 'Publish problem sets, review submissions, and return detailed rubrics.'}
          </p>
        </div>

        {(currentRole === 'teacher' || currentRole === 'admin') && (
          <button
            onClick={() => setShowCreateModal(true)}
            id="create-assignment-btn"
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create Assignment</span>
          </button>
        )}
      </div>

      {/* Filter and Category Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Status Pills */}
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto">
          {(['all', 'pending', 'submitted', 'graded'] as const).map((st) => (
            <button
              key={st}
              id={`filter-asg-${st}`}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'pending' ? 'To Do / Pending' : st}
            </button>
          ))}
        </div>

        {/* Subject Filter Dropdown */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-medium">Subject:</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800"
          >
            <option value="all">All Subjects</option>
            {subjectsList.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assignment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAssignments.map((asg) => {
          const sub = submissions.find((s) => s.assignmentId === asg.id && s.studentId === currentStudent.id);
          const status = sub?.status || 'pending';

          return (
            <div
              key={asg.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header: Subject & Status */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {asg.subject}
                  </span>
                  <span
                    className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                      status === 'graded'
                        ? 'bg-emerald-100 text-emerald-800'
                        : status === 'submitted'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {status === 'graded' && <Award className="h-3 w-3 mr-0.5" />}
                    {status === 'submitted' && <CheckCircle2 className="h-3 w-3 mr-0.5" />}
                    {status === 'pending' && <Clock className="h-3 w-3 mr-0.5" />}
                    <span>{status === 'pending' ? 'Pending' : status}</span>
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {asg.title}
                </h3>
                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {asg.description}
                </p>

                {asg.attachmentName && (
                  <div className="mt-3 inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-mono font-medium">
                    <FileText className="h-3.5 w-3.5 text-slate-500" />
                    <span>{asg.attachmentName}</span>
                  </div>
                )}
              </div>

              {/* Graded Details (If Graded) */}
              {status === 'graded' && sub && (
                <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900">Score Awarded:</span>
                    <span className="text-sm font-black text-emerald-700">
                      {sub.pointsAwarded} / {asg.maxPoints}
                    </span>
                  </div>
                  {sub.feedback && (
                    <p className="text-emerald-800 italic pt-1">
                      <span className="font-semibold not-italic">Teacher Feedback:</span> "{sub.feedback}"
                    </p>
                  )}
                </div>
              )}

              {/* Footer: Due date & Action buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="text-slate-500 space-y-0.5">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>Due: <strong className="text-slate-700">{asg.dueDate}</strong></span>
                  </div>
                  <p className="text-[11px] text-slate-400">By {asg.teacherName}</p>
                </div>

                {/* Role based actions */}
                {currentRole === 'student' && status === 'pending' && (
                  <button
                    onClick={() => setActiveAssignmentToSubmit(asg)}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                  >
                    Submit Work
                  </button>
                )}

                {currentRole === 'parent' && (
                  <span className="text-xs text-slate-400">
                    {status === 'graded' ? 'Completed & Graded' : status === 'submitted' ? 'Awaiting Grading' : 'In Progress'}
                  </span>
                )}

                {(currentRole === 'teacher' || currentRole === 'admin') && (
                  <div className="flex items-center space-x-2">
                    {sub && status === 'submitted' && (
                      <button
                        onClick={() => {
                          setActiveSubmissionToGrade(sub);
                          setGradePoints(Math.round(asg.maxPoints * 0.9));
                        }}
                        className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold"
                      >
                        Grade Submission
                      </button>
                    )}
                    <span className="text-xs text-slate-400">
                      {asg.submissionsCount || 0} handed in
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* SUBMISSION MODAL */}
      {activeAssignmentToSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                Submit: {activeAssignmentToSubmit.title}
              </h3>
              <button
                onClick={() => setActiveAssignmentToSubmit(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitWork} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Submission Notes / Text Answer
                </label>
                <textarea
                  required
                  rows={4}
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  placeholder="Paste your solution notes, research writeup, or shared project drive URL..."
                  className="w-full text-xs border border-slate-200 rounded-xl p-3 focus:border-indigo-500 outline-hidden resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Attach Solution File / Document
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 cursor-pointer">
                  <UploadCloud className="h-6 w-6 text-indigo-600 mx-auto mb-1" />
                  <span className="text-xs font-semibold text-slate-800 block">
                    {submissionFileName}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    PDF, DOCX, ZIP or source code files up to 25MB
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveAssignmentToSubmit(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit Assignment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE ASSIGNMENT MODAL (TEACHER) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Publish New Assignment</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Assignment Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Electromagnetic Induction Lab Sheet #2"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:border-indigo-500 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Subject</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-white"
                  >
                    <option value="Further Mathematics">Further Mathematics</option>
                    <option value="General Mathematics">General Mathematics</option>
                    <option value="Physics & Practical">Physics & Practical</option>
                    <option value="Chemistry & Practical">Chemistry & Practical</option>
                    <option value="Biology & Agriculture">Biology & Agriculture</option>
                    <option value="English Language & Lit">English Language & Lit</option>
                    <option value="Data Processing / ICT">Data Processing / ICT</option>
                    <option value="Civic Education">Civic Education</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Max Points</label>
                  <input
                    type="number"
                    required
                    min={10}
                    max={100}
                    value={newMaxPoints}
                    onChange={(e) => setNewMaxPoints(Number(e.target.value))}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Target Form & Arm</label>
                  <select
                    value={`${newGrade}-${newSection}`}
                    onChange={(e) => {
                      const [g, s] = e.target.value.split('-');
                      setNewGrade(g);
                      setNewSection(s);
                    }}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-white"
                  >
                    <option value="SSS 2-Alpha">SSS 2 - Alpha (Science)</option>
                    <option value="SSS 2-Beta">SSS 2 - Beta (Commercial)</option>
                    <option value="JSS 1-Beta">JSS 1 - Beta (Junior)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Instructions & Guidelines</label>
                <textarea
                  required
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Detail instructions, rubric guidelines, submission formats..."
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:border-indigo-500 outline-hidden resize-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Publish to Students
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GRADE SUBMISSION MODAL (TEACHER) */}
      {activeSubmissionToGrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                Grade Submission: {activeSubmissionToGrade.studentName}
              </h3>
              <button
                onClick={() => setActiveSubmissionToGrade(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="mt-4 space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-semibold text-slate-700 block mb-1">Student Answer:</span>
                <p className="text-slate-600">{activeSubmissionToGrade.content}</p>
                {activeSubmissionToGrade.attachmentName && (
                  <span className="mt-2 inline-block font-mono text-[11px] text-indigo-700">
                    File: {activeSubmissionToGrade.attachmentName}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Score Awarded</label>
                <input
                  type="number"
                  required
                  min={0}
                  max={100}
                  value={gradePoints}
                  onChange={(e) => setGradePoints(Number(e.target.value))}
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Educator Feedback & Comments</label>
                <textarea
                  required
                  rows={3}
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  placeholder="Provide constructive feedback for student and parent..."
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:border-indigo-500 outline-hidden resize-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveSubmissionToGrade(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Save & Publish Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
