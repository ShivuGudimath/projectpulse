import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

import { demoUsers, demoProjects, demoAlerts, demoFeedback, demoSummary } from './data.js';
import type { User, Project, AuthPayload, UserRole } from './types.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5000);
const JWT_SECRET = process.env.JWT_SECRET || 'projectpulse-demo-secret';

const users: User[] = demoUsers.map((user) => ({ ...user }));
let projects: Project[] = demoProjects.map((project) => ({ ...project, milestones: [...project.milestones], issues: [...project.issues], documents: [...project.documents], progressUpdates: [...project.progressUpdates], expenses: [...project.expenses] }));
let alerts = demoAlerts.map((alert) => ({ ...alert }));
let feedback = demoFeedback.map((item) => ({ ...item }));

const formatProjectRisk = (project: Project) => {
  const activeIssues = project.issues.filter((issue) => issue.status !== 'Resolved').length;
  const delayDays = Math.max(0, Math.round((Date.now() - new Date(project.expectedEndDate).getTime()) / (1000 * 60 * 60 * 24)));
  const daysRemaining = Math.max(0, Math.round((new Date(project.expectedEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  const score = Math.min(
    100,
    Math.round(
      project.progress * 0.35 +
        (activeIssues * 12) +
        (project.expenditure / Math.max(project.budget, 1)) * 30 +
        (delayDays > 0 ? delayDays * 1.8 : 0),
    ),
  );

  let level: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
  if (score >= 80) level = 'Critical';
  else if (score >= 60) level = 'High';
  else if (score >= 35) level = 'Medium';

  const reasons: string[] = [];
  if (project.progress < 60) reasons.push('Project progress is below target');
  if (delayDays > 0) reasons.push('Milestone completion is behind schedule');
  if (activeIssues > 0) reasons.push('Unresolved issues remain active');
  if (project.expenditure > project.budget * 0.7) reasons.push('Budget utilization is high');
  if (reasons.length === 0) reasons.push('Project performance remains within acceptable range');

  return {
    level,
    score,
    reasons,
    daysRemaining,
    delayDays,
    unresolvedIssues: activeIssues,
  };
};

projects = projects.map((project) => ({
  ...project,
  risk: formatProjectRisk(project),
}));

const sanitizeUser = (user: User) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  department: user.department,
  createdAt: user.createdAt,
});

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const token = header.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    (req as Request & { user?: AuthPayload }).user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

const requireRole = (roles: UserRole[]) => (req: Request, res: Response, next: NextFunction) => {
  const user = (req as Request & { user?: AuthPayload }).user;
  if (!user) return res.status(401).json({ message: 'Unauthorized.' });
  if (!roles.includes(user.role)) return res.status(403).json({ message: 'Access denied for this role.' });
  return next();
};

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'ProjectPulse API is running.' });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = users.find((item) => item.email.toLowerCase() === String(email).toLowerCase());
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const isValidPassword = bcrypt.compareSync(String(password), user.password);
  if (!isValidPassword) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

  return res.json({ token, user: sanitizeUser(user) });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role, department } = req.body ?? {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required.' });
  }

  const existing = users.find((user) => user.email.toLowerCase() === String(email).toLowerCase());
  if (existing) {
    return res.status(409).json({ message: 'An account with this email already exists.' });
  }

  const newUser: User = {
    id: uuid(),
    name: String(name),
    email: String(email),
    password: bcrypt.hashSync(String(password), 10),
    role: (role as UserRole) || 'citizen',
    department: String(department || 'General'),
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  return res.status(201).json({ user: sanitizeUser(newUser) });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = users.find((item) => item.id === (req as Request & { user?: AuthPayload }).user?.userId);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  return res.json({ user: sanitizeUser(user) });
});

app.get('/api/projects', authMiddleware, (req, res) => {
  const search = String(req.query.search || '').toLowerCase();
  const status = String(req.query.status || '').toLowerCase();
  const risk = String(req.query.risk || '').toLowerCase();
  const department = String(req.query.department || '').toLowerCase();

  let filtered = [...projects];

  if (search) {
    filtered = filtered.filter((project) => {
      return [
        project.name,
        project.projectCode,
        project.state,
        project.district,
        project.department,
        project.category,
        project.location,
      ]
        .join(' ')
        .toLowerCase()
        .includes(search);
    });
  }

  if (status) {
    filtered = filtered.filter((project) => project.status.toLowerCase() === status);
  }

  if (risk) {
    filtered = filtered.filter((project) => project.risk?.level.toLowerCase() === risk);
  }

  if (department) {
    filtered = filtered.filter((project) => project.department.toLowerCase().includes(department));
  }

  return res.json(filtered);
});

app.get('/api/projects/:id', authMiddleware, (req, res) => {
  const project = projects.find((item) => item.id === req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found.' });
  return res.json(project);
});

app.post('/api/projects', authMiddleware, requireRole(['admin', 'officer']), (req, res) => {
  const project = req.body as Partial<Project>;
  if (!project.name || !project.department || !project.state || !project.district || !project.budget) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  const newProject: Project = {
    id: `p-${Date.now()}`,
    projectCode: project.projectCode || `PP-${Date.now().toString().slice(-4)}`,
    name: String(project.name),
    description: String(project.description || 'New project'),
    department: String(project.department),
    category: String(project.category || 'General'),
    state: String(project.state),
    district: String(project.district),
    location: String(project.location || 'Unknown'),
    latitude: Number(project.latitude || 0),
    longitude: Number(project.longitude || 0),
    budget: Number(project.budget || 0),
    expenditure: Number(project.expenditure || 0),
    progress: Number(project.progress || 0),
    status: (project.status as Project['status']) || 'Planning',
    startDate: String(project.startDate || new Date().toISOString()),
    expectedEndDate: String(project.expectedEndDate || new Date().toISOString()),
    actualEndDate: project.actualEndDate ? String(project.actualEndDate) : undefined,
    managerId: project.managerId,
    contractorId: project.contractorId,
    createdAt: new Date().toISOString(),
    milestones: Array.isArray(project.milestones) ? project.milestones : [],
    issues: Array.isArray(project.issues) ? project.issues : [],
    documents: Array.isArray(project.documents) ? project.documents : [],
    progressUpdates: Array.isArray(project.progressUpdates) ? project.progressUpdates : [],
    expenses: Array.isArray(project.expenses) ? project.expenses : [],
  };

  newProject.risk = formatProjectRisk(newProject);
  projects.unshift(newProject);
  return res.status(201).json(newProject);
});

app.put('/api/projects/:id', authMiddleware, requireRole(['admin', 'officer']), (req, res) => {
  const projectIndex = projects.findIndex((project) => project.id === req.params.id);
  if (projectIndex === -1) return res.status(404).json({ message: 'Project not found.' });

  projects[projectIndex] = {
    ...projects[projectIndex],
    ...req.body,
    risk: formatProjectRisk({ ...projects[projectIndex], ...req.body }),
  };

  return res.json(projects[projectIndex]);
});

app.delete('/api/projects/:id', authMiddleware, requireRole(['admin']), (req, res) => {
  const projectIndex = projects.findIndex((project) => project.id === req.params.id);
  if (projectIndex === -1) return res.status(404).json({ message: 'Project not found.' });
  projects.splice(projectIndex, 1);
  return res.json({ success: true, message: 'Project deleted.' });
});

app.get('/api/projects/:id/milestones', authMiddleware, (req, res) => {
  const project = projects.find((item) => item.id === req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found.' });
  return res.json(project.milestones);
});

app.post('/api/projects/:id/milestones', authMiddleware, requireRole(['admin', 'officer', 'contractor']), (req, res) => {
  const project = projects.find((item) => item.id === req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found.' });
  const milestone = { id: uuid(), ...req.body };
  project.milestones.push(milestone);
  return res.status(201).json(milestone);
});

app.get('/api/projects/:id/issues', authMiddleware, (req, res) => {
  const project = projects.find((item) => item.id === req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found.' });
  return res.json(project.issues);
});

app.post('/api/projects/:id/issues', authMiddleware, requireRole(['admin', 'officer', 'contractor', 'citizen']), (req, res) => {
  const project = projects.find((item) => item.id === req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found.' });
  const issue = { id: uuid(), ...req.body, createdAt: new Date().toISOString() };
  project.issues.push(issue);
  project.risk = formatProjectRisk(project);
  return res.status(201).json(issue);
});

app.get('/api/projects/:id/progress', authMiddleware, (req, res) => {
  const project = projects.find((item) => item.id === req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found.' });
  return res.json(project.progressUpdates);
});

app.post('/api/projects/:id/progress', authMiddleware, requireRole(['admin', 'officer', 'contractor']), (req, res) => {
  const project = projects.find((item) => item.id === req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found.' });
  const update = { id: uuid(), ...req.body, createdAt: new Date().toISOString() };
  project.progressUpdates.push(update);
  project.progress = Number(update.progress || project.progress);
  project.risk = formatProjectRisk(project);
  return res.status(201).json(update);
});

app.get('/api/projects/:id/expenses', authMiddleware, (req, res) => {
  const project = projects.find((item) => item.id === req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found.' });
  return res.json(project.expenses);
});

app.post('/api/projects/:id/expenses', authMiddleware, requireRole(['admin', 'officer', 'contractor']), (req, res) => {
  const project = projects.find((item) => item.id === req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found.' });
  const expense = { id: uuid(), ...req.body };
  project.expenses.push(expense);
  project.expenditure = project.expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  project.risk = formatProjectRisk(project);
  return res.status(201).json(expense);
});

app.get('/api/projects/:id/documents', authMiddleware, (req, res) => {
  const project = projects.find((item) => item.id === req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found.' });
  return res.json(project.documents);
});

app.post('/api/projects/:id/documents', authMiddleware, requireRole(['admin', 'officer', 'contractor']), (req, res) => {
  const project = projects.find((item) => item.id === req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found.' });
  const document = { id: uuid(), ...req.body, uploadedAt: new Date().toISOString() };
  project.documents.push(document);
  return res.status(201).json(document);
});

app.get('/api/alerts', authMiddleware, (req, res) => {
  return res.json(alerts);
});

app.put('/api/alerts/:id/read', authMiddleware, (req, res) => {
  const item = alerts.find((alert) => alert.id === req.params.id);
  if (!item) return res.status(404).json({ message: 'Alert not found.' });
  item.isRead = true;
  return res.json(item);
});

app.get('/api/feedback', authMiddleware, (req, res) => {
  const limit = Number(req.query.limit || 20);
  return res.json(feedback.slice(0, limit));
});

app.post('/api/feedback', (req, res) => {
  const body = req.body ?? {};
  if (!body.name || !body.email || !body.projectId || !body.description) {
    return res.status(400).json({ message: 'Name, email, project ID and message are required.' });
  }

  const record = {
    id: uuid(),
    projectId: String(body.projectId),
    name: String(body.name),
    email: String(body.email),
    category: body.category || 'Other',
    description: String(body.description),
    imageUrl: body.imageUrl ? String(body.imageUrl) : undefined,
    status: 'Pending Review',
    createdAt: new Date().toISOString(),
    location: String(body.location || 'General'),
  };

  feedback.unshift(record);
  return res.status(201).json(record);
});

app.get('/api/analytics/dashboard', authMiddleware, (req, res) => {
  const totalBudget = projects.reduce((sum, project) => sum + Number(project.budget), 0);
  const totalExpenditure = projects.reduce((sum, project) => sum + Number(project.expenditure), 0);
  const statusCounts = ['Planning', 'Not Started', 'In Progress', 'Delayed', 'Completed', 'On Hold'].map((status) => ({
    name: status,
    value: projects.filter((project) => project.status === status).length,
  }));

  const byDistrict = projects.reduce<Record<string, number>>((acc, project) => {
    acc[project.district] = (acc[project.district] || 0) + 1;
    return acc;
  }, {});

  const monthlyProgress = [
    { month: 'Jan', value: 34 },
    { month: 'Feb', value: 42 },
    { month: 'Mar', value: 48 },
    { month: 'Apr', value: 56 },
    { month: 'May', value: 61 },
    { month: 'Jun', value: 68 },
    { month: 'Jul', value: 73 },
  ];

  return res.json({
    summary: {
      totalProjects: projects.length,
      activeProjects: projects.filter((project) => project.status === 'In Progress').length,
      completedProjects: projects.filter((project) => project.status === 'Completed').length,
      delayedProjects: projects.filter((project) => project.status === 'Delayed').length,
      totalBudget,
      totalExpenditure,
      averageCompletion: Math.round(projects.reduce((sum, project) => sum + project.progress, 0) / projects.length),
      projectsAtRisk: projects.filter((project) => project.risk && (project.risk.level === 'High' || project.risk.level === 'Critical')).length,
    },
    statusDistribution: statusCounts,
    budgetVsExpenditure: [
      { name: 'Approved Budget', value: totalBudget },
      { name: 'Spent', value: totalExpenditure },
    ],
    monthlyProgress,
    districtBreakdown: Object.entries(byDistrict).map(([name, value]) => ({ name, value })),
  });
});

app.get('/api/analytics/projects', authMiddleware, (req, res) => {
  return res.json(projects.map((project) => ({
    ...project,
    health: {
      progress: project.progress,
      budget: Math.min(100, Math.round((project.expenditure / Math.max(project.budget, 1)) * 100)),
      timeline: Math.max(10, 100 - (project.risk?.delayDays || 0) * 2),
      risk: project.risk?.level || 'Low',
    },
  })));
});

app.get('/api/reports', authMiddleware, (req, res) => {
  const type = String(req.query.type || 'progress');
  const rows = projects.map((project) => ({
    projectCode: project.projectCode,
    projectName: project.name,
    department: project.department,
    district: project.district,
    status: project.status,
    progress: project.progress,
    budget: project.budget,
    expenditure: project.expenditure,
    risk: project.risk?.level || 'Low',
  }));

  if (type === 'csv') {
    const header = Object.keys(rows[0] || {}).join(',');
    const csv = rows.map((row) => Object.values(row).join(',')).join('\n');
    res.header('Content-Type', 'text/csv');
    return res.send(`${header}\n${csv}`);
  }

  return res.json({ generatedAt: new Date().toISOString(), type, count: rows.length, rows });
});

app.get('/api/demo/users', authMiddleware, (_req, res) => {
  return res.json(users.map(sanitizeUser));
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  return res.status(500).json({ message: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`ProjectPulse backend running at http://localhost:${PORT}`);
});

export default app;
