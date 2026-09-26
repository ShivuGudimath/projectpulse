export type UserRole = 'admin' | 'officer' | 'contractor' | 'citizen';

export type ProjectStatus = 'Planning' | 'Not Started' | 'In Progress' | 'Delayed' | 'Completed' | 'On Hold';

export interface User {
  id: string;
  name: string;
  email: string;
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
  status: string;
  responsible: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
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

export interface ProjectDocument {
  id: string;
  name: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface ProjectRisk {
  level: 'Low' | 'Medium' | 'High' | 'Critical';
  score: number;
  reasons: string[];
  daysRemaining: number;
  delayDays: number;
  unresolvedIssues: number;
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
  documents: ProjectDocument[];
  progressUpdates: ProgressUpdate[];
  expenses: Expense[];
  risk?: ProjectRisk;
}

export interface AlertItem {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'critical' | 'info';
  isRead: boolean;
  createdAt: string;
}

export interface DashboardSummary {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  delayedProjects: number;
  totalBudget: number;
  totalExpenditure: number;
  averageCompletion: number;
  projectsAtRisk: number;
}

export interface FeedbackItem {
  id: string;
  projectId: string;
  name: string;
  email: string;
  category: string;
  description: string;
  status: string;
  createdAt: string;
  location: string;
}
