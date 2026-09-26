export type UserRole = 'admin' | 'officer' | 'contractor' | 'citizen';
export type ProjectStatus = 'Planning' | 'Not Started' | 'In Progress' | 'Delayed' | 'Completed' | 'On Hold';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type IssuePriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type FeedbackCategory = 'Work quality' | 'Delay' | 'Safety' | 'Corruption concern' | 'Environmental concern' | 'Other';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department: string;
  createdAt: string;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  startDate: string;
  dueDate: string;
  completion: number;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Delayed';
  responsible: string;
}

export interface DocumentRecord {
  id: string;
  name: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  priority: IssuePriority;
  status: 'Open' | 'In Review' | 'Resolved';
  reportedBy: string;
  createdAt: string;
  resolution?: string;
}

export interface ProgressUpdate {
  id: string;
  progress: number;
  description: string;
  photoUrl: string;
  updatedBy: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  approvedBy: string;
}

export interface ProjectFeedback {
  id: string;
  projectId: string;
  name: string;
  email: string;
  category: FeedbackCategory;
  description: string;
  imageUrl?: string;
  status: 'Pending Review' | 'Reviewed';
  createdAt: string;
  location: string;
}

export interface Project {
  id: string;
  projectCode: string;
  name: string;
  description: string;
  department: string;
  category: string;
  state: string;
  district: string;
  location: string;
  latitude: number;
  longitude: number;
  budget: number;
  expenditure: number;
  progress: number;
  status: ProjectStatus;
  startDate: string;
  expectedEndDate: string;
  actualEndDate?: string;
  managerId?: string;
  contractorId?: string;
  createdAt: string;
  milestones: Milestone[];
  issues: Issue[];
  documents: DocumentRecord[];
  progressUpdates: ProgressUpdate[];
  expenses: Expense[];
  risk?: {
    level: RiskLevel;
    score: number;
    reasons: string[];
    daysRemaining: number;
    delayDays: number;
    unresolvedIssues: number;
  };
}

export interface AlertItem {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'warning' | 'critical' | 'info';
  isRead: boolean;
  createdAt: string;
}

export interface AuthPayload {
  userId: string;
  email: string;
  role: UserRole;
}
