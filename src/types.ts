export type UserRole = 'parent' | 'teacher' | 'student' | 'admin';

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  grade: string;
  section: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  avatar: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  address: string;
  bloodGroup?: string;
  emergencyContact: string;
  house?: string; // Nigerian Inter-House Sports (e.g. Azikiwe House, Awolowo House)
  stateOfOrigin?: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  subjects: string[];
  assignedClass: string;
  avatar: string;
  roomNumber: string;
  designation?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  remarks?: string;
  notifiedParent?: boolean;
}

export interface SubjectScore {
  subject: string;
  code: string;
  score: number;
  maxScore: number;
  grade: string;
  classAverage: number;
  teacherRemarks: string;
  ca1Score?: number; // 10 marks
  ca2Score?: number; // 10 marks
  projectScore?: number; // 10 marks
  examScore?: number; // 70 marks
  waecEquivalent?: string; // A1, B2, B3, C4, C5, C6, D7, E8, F9
}

export interface ExamReport {
  id: string;
  examTitle: string;
  term: string;
  academicYear: string;
  studentId: string;
  scores: SubjectScore[];
  totalScore: number;
  maxTotalScore: number;
  percentage: number;
  gpa: number;
  rank: number;
  totalStudentsInClass: number;
  attendancePercentage: number;
  issueDate: string;
  generalRemarks: string;
  formTeacherRemarks?: string;
  principalRemarks?: string;
  nextTermBegins?: string;
  affectiveTraits?: { trait: string; rating: number }[];
  psychomotorSkills?: { skill: string; rating: number }[];
}

export type FeeCategory = 'Tuition' | 'Laboratory' | 'Library' | 'Sports & Activities' | 'Transport' | 'Examination' | 'PTA Levy' | 'Uniform & Books';
export type FeeStatus = 'paid' | 'pending' | 'overdue';

export interface FeeInvoice {
  id: string;
  invoiceNumber: string;
  studentId: string;
  title: string;
  category: FeeCategory;
  amount: number;
  dueDate: string;
  status: FeeStatus;
  paidAt?: string;
  paymentMethod?: string;
  transactionId?: string;
  academicTerm: string;
  currency?: string; // ₦
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  grade: string;
  section: string;
  teacherId: string;
  teacherName: string;
  description: string;
  assignedDate: string;
  dueDate: string;
  maxPoints: number;
  attachmentName?: string;
  submissionsCount?: number;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  content: string;
  attachmentName?: string;
  status: 'pending' | 'submitted' | 'graded';
  pointsAwarded?: number;
  feedback?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar: string;
  content: string;
  timestamp: string;
}

export interface CommunicationThread {
  id: string;
  subject: string;
  participants: {
    id: string;
    name: string;
    role: UserRole;
    avatar: string;
  }[];
  category: 'teacher-parent' | 'teacher-student' | 'general';
  lastMessagePreview: string;
  lastMessageTimestamp: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export interface SchoolAnnouncement {
  id: string;
  title: string;
  category: 'Academic' | 'Event' | 'Administrative' | 'Sports';
  content: string;
  author: string;
  authorRole: string;
  date: string;
  priority: 'normal' | 'important' | 'urgent';
  targetAudience: 'All' | 'Parents' | 'Students' | 'Teachers';
}
