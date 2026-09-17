import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  Student,
  Teacher,
  AttendanceRecord,
  AttendanceStatus,
  ExamReport,
  FeeInvoice,
  Assignment,
  AssignmentSubmission,
  CommunicationThread,
  ChatMessage,
  SchoolAnnouncement,
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  INITIAL_ATTENDANCE,
  INITIAL_EXAM_REPORTS,
  INITIAL_FEES,
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_COMMUNICATION_THREADS,
  INITIAL_ANNOUNCEMENTS,
} from '../data/mockData';

interface SchoolContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  selectedChildId: string;
  setSelectedChildId: (id: string) => void;
  currentStudent: Student;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Data
  students: Student[];
  teachers: Teacher[];
  attendance: AttendanceRecord[];
  examReports: ExamReport[];
  fees: FeeInvoice[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  threads: CommunicationThread[];
  announcements: SchoolAnnouncement[];

  // Actions
  markAttendance: (records: { studentId: string; status: AttendanceStatus; remarks?: string }[], date: string) => void;
  notifyParentOfAbsence: (studentId: string, date: string, reason?: string) => void;
  payFeeInvoice: (invoiceId: string, paymentMethod: string) => { success: boolean; transactionId: string };
  createAssignment: (newAssignment: Omit<Assignment, 'id' | 'submissionsCount'>) => void;
  submitAssignment: (assignmentId: string, studentId: string, content: string, attachmentName?: string) => void;
  gradeAssignment: (submissionId: string, points: number, feedback: string) => void;
  sendMessage: (threadId: string, content: string) => void;
  createThread: (targetUserId: string, subject: string, message: string, category: 'teacher-parent' | 'teacher-student') => string;
  addExamReport: (report: ExamReport) => void;
  resetToDemoData: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

const STORAGE_PREFIX = 'sms_oakridge_';

function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(STORAGE_PREFIX + key);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to parse localStorage for', key, e);
  }
  return defaultValue;
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage for', key, e);
  }
}

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('parent'); // Default to parent view per prompt
  const [selectedChildId, setSelectedChildId] = useState<string>('std-1'); // Leo Vance
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [students] = useState<Student[]>(() => getStorage('students', INITIAL_STUDENTS));
  const [teachers] = useState<Teacher[]>(() => getStorage('teachers', INITIAL_TEACHERS));
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => getStorage('attendance', INITIAL_ATTENDANCE));
  const [examReports, setExamReports] = useState<ExamReport[]>(() => getStorage('examReports', INITIAL_EXAM_REPORTS));
  const [fees, setFees] = useState<FeeInvoice[]>(() => getStorage('fees', INITIAL_FEES));
  const [assignments, setAssignments] = useState<Assignment[]>(() => getStorage('assignments', INITIAL_ASSIGNMENTS));
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>(() => getStorage('submissions', INITIAL_SUBMISSIONS));
  const [threads, setThreads] = useState<CommunicationThread[]>(() => getStorage('threads', INITIAL_COMMUNICATION_THREADS));
  const [announcements] = useState<SchoolAnnouncement[]>(() => getStorage('announcements', INITIAL_ANNOUNCEMENTS));

  useEffect(() => {
    setStorage('attendance', attendance);
  }, [attendance]);

  useEffect(() => {
    setStorage('fees', fees);
  }, [fees]);

  useEffect(() => {
    setStorage('examReports', examReports);
  }, [examReports]);

  useEffect(() => {
    setStorage('assignments', assignments);
  }, [assignments]);

  useEffect(() => {
    setStorage('submissions', submissions);
  }, [submissions]);

  useEffect(() => {
    setStorage('threads', threads);
  }, [threads]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const currentStudent = students.find((s) => s.id === selectedChildId) || students[0];

  const markAttendance = (records: { studentId: string; status: AttendanceStatus; remarks?: string }[], date: string) => {
    setAttendance((prev) => {
      // Filter out existing records for this date and students being updated
      const studentIds = new Set(records.map((r) => r.studentId));
      const filtered = prev.filter((r) => !(r.date === date && studentIds.has(r.studentId)));
      const newItems: AttendanceRecord[] = records.map((r, index) => ({
        id: `att-manual-${Date.now()}-${index}`,
        studentId: r.studentId,
        date,
        status: r.status,
        remarks: r.remarks || (r.status === 'present' ? 'Present' : r.status === 'late' ? 'Tardy' : 'Absent'),
        notifiedParent: r.status !== 'present',
      }));
      return [...newItems, ...filtered];
    });
    showToast(`Attendance updated successfully for ${records.length} students on ${date}`);
  };

  const notifyParentOfAbsence = (studentId: string, date: string, reason?: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;
    
    // Update record to show notified
    setAttendance((prev) =>
      prev.map((r) => (r.studentId === studentId && r.date === date ? { ...r, notifiedParent: true } : r))
    );

    // Auto-create communication message to the parent
    const threadSubject = `Attendance Alert: ${student.name} marked absent on ${date}`;
    const noticeContent = `Dear ${student.parentName}, this is an automated attendance alert from Oakridge Academy. ${student.name} was marked absent for classes on ${date}. Reason noted: ${reason || 'Unspecified'}. Please reach out if you have questions or to submit a medical slip.`;

    const existingThread = threads.find((t) =>
      t.participants.some((p) => p.id === studentId || p.name.includes(student.parentName))
    );

    if (existingThread) {
      sendMessage(existingThread.id, noticeContent);
    } else {
      createThread('par-1', threadSubject, noticeContent, 'teacher-parent');
    }

    showToast(`SMS & Portal notification dispatched to ${student.parentName} (${student.parentPhone})`);
  };

  const payFeeInvoice = (invoiceId: string, paymentMethod: string) => {
    const txn = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const nowStr = new Date().toISOString().split('T')[0];

    setFees((prev) =>
      prev.map((f) =>
        f.id === invoiceId
          ? {
              ...f,
              status: 'paid',
              paidAt: nowStr,
              paymentMethod,
              transactionId: txn,
            }
          : f
      )
    );

    showToast(`Payment successful! Receipt ${txn} generated.`);
    return { success: true, transactionId: txn };
  };

  const createAssignment = (newAssignment: Omit<Assignment, 'id' | 'submissionsCount'>) => {
    const id = `asg-${Date.now()}`;
    const item: Assignment = {
      ...newAssignment,
      id,
      submissionsCount: 0,
    };
    setAssignments((prev) => [item, ...prev]);
    showToast(`Assignment "${newAssignment.title}" published to ${newAssignment.grade}-${newAssignment.section}`);
  };

  const submitAssignment = (assignmentId: string, studentId: string, content: string, attachmentName?: string) => {
    const student = students.find((s) => s.id === studentId);
    const existing = submissions.find((s) => s.assignmentId === assignmentId && s.studentId === studentId);

    if (existing) {
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === existing.id
            ? {
                ...s,
                content,
                attachmentName: attachmentName || s.attachmentName,
                submittedAt: new Date().toLocaleString(),
                status: 'submitted',
              }
            : s
        )
      );
    } else {
      const newSub: AssignmentSubmission = {
        id: `sub-${Date.now()}`,
        assignmentId,
        studentId,
        studentName: student?.name || 'Student',
        submittedAt: new Date().toLocaleString(),
        content,
        attachmentName: attachmentName || 'Project_Submission_V1.pdf',
        status: 'submitted',
      };
      setSubmissions((prev) => [newSub, ...prev]);
    }

    // Increment submissionsCount on assignment
    setAssignments((prev) =>
      prev.map((a) => (a.id === assignmentId ? { ...a, submissionsCount: (a.submissionsCount || 0) + 1 } : a))
    );

    showToast('Assignment submitted successfully!');
  };

  const gradeAssignment = (submissionId: string, points: number, feedback: string) => {
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId
          ? {
              ...s,
              status: 'graded',
              pointsAwarded: points,
              feedback,
            }
          : s
      )
    );
    showToast(`Graded submission with ${points} points.`);
  };

  const sendMessage = (threadId: string, content: string) => {
    if (!content.trim()) return;

    let senderName = 'Eleanor Vance (Parent)';
    let senderRole: UserRole = 'parent';
    let senderId = 'par-1';
    let senderAvatar = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80';

    if (currentRole === 'teacher') {
      senderName = 'Mrs. Sarah Jenkins';
      senderRole = 'teacher';
      senderId = 'tch-1';
      senderAvatar = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80';
    } else if (currentRole === 'student') {
      senderName = currentStudent.name;
      senderRole = 'student';
      senderId = currentStudent.id;
      senderAvatar = currentStudent.avatar;
    } else if (currentRole === 'admin') {
      senderName = 'School Administration';
      senderRole = 'admin';
      senderId = 'adm-1';
      senderAvatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80';
    }

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId,
      senderName,
      senderRole,
      senderAvatar,
      content,
      timestamp: 'Just now',
    };

    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              messages: [...t.messages, newMsg],
              lastMessagePreview: content,
              lastMessageTimestamp: 'Just now',
            }
          : t
      )
    );
  };

  const createThread = (
    targetUserId: string,
    subject: string,
    message: string,
    category: 'teacher-parent' | 'teacher-student'
  ): string => {
    const threadId = `th-${Date.now()}`;
    const teacher = teachers.find((t) => t.id === targetUserId) || teachers[0];

    const newThread: CommunicationThread = {
      id: threadId,
      subject,
      category,
      unreadCount: 0,
      lastMessagePreview: message,
      lastMessageTimestamp: 'Just now',
      participants: [
        {
          id: 'par-1',
          name: currentRole === 'student' ? currentStudent.name : 'Eleanor Vance (Parent)',
          role: currentRole === 'student' ? 'student' : 'parent',
          avatar: currentRole === 'student' ? currentStudent.avatar : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        },
        {
          id: teacher.id,
          name: teacher.name,
          role: 'teacher',
          avatar: teacher.avatar,
        },
      ],
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderId: currentRole === 'student' ? currentStudent.id : 'par-1',
          senderName: currentRole === 'student' ? currentStudent.name : 'Eleanor Vance',
          senderRole: currentRole === 'student' ? 'student' : 'parent',
          senderAvatar: currentRole === 'student' ? currentStudent.avatar : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
          content: message,
          timestamp: 'Just now',
        },
      ],
    };

    setThreads((prev) => [newThread, ...prev]);
    showToast('Conversation started.');
    return threadId;
  };

  const addExamReport = (report: ExamReport) => {
    setExamReports((prev) => [report, ...prev]);
    showToast(`Exam report for ${report.examTitle} saved.`);
  };

  const resetToDemoData = () => {
    localStorage.removeItem(STORAGE_PREFIX + 'attendance');
    localStorage.removeItem(STORAGE_PREFIX + 'fees');
    localStorage.removeItem(STORAGE_PREFIX + 'examReports');
    localStorage.removeItem(STORAGE_PREFIX + 'assignments');
    localStorage.removeItem(STORAGE_PREFIX + 'submissions');
    localStorage.removeItem(STORAGE_PREFIX + 'threads');
    
    setAttendance(INITIAL_ATTENDANCE);
    setFees(INITIAL_FEES);
    setExamReports(INITIAL_EXAM_REPORTS);
    setAssignments(INITIAL_ASSIGNMENTS);
    setSubmissions(INITIAL_SUBMISSIONS);
    setThreads(INITIAL_COMMUNICATION_THREADS);
    showToast('Reset data to initial state');
  };

  return (
    <SchoolContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        selectedChildId,
        setSelectedChildId,
        currentStudent,
        activeTab,
        setActiveTab,
        students,
        teachers,
        attendance,
        examReports,
        fees,
        assignments,
        submissions,
        threads,
        announcements,
        markAttendance,
        notifyParentOfAbsence,
        payFeeInvoice,
        createAssignment,
        submitAssignment,
        gradeAssignment,
        sendMessage,
        createThread,
        addExamReport,
        resetToDemoData,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};
