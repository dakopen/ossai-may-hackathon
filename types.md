# AI-Powered Project Manager: Types and Functions

This document outlines the data structures (types) and functions required for the backend and frontend of the AI-Powered Project Manager.

## Data Types

### Project

Represents a project within the system.

```typescript
interface Project {
  projectId: string;         // Unique identifier for the project
  name: string;              // Name of the project
  description: string;       // Detailed description of the project
  userIds: string[];         // List of user IDs associated with this project
  taskIds: string[];         // List of task IDs belonging to this project
  creationDate: Date;
  lastUpdateDate: Date;
}
```

### User

Represents a user within the system, potentially assigned to one or more projects.

```typescript
interface User {
  userId: string;            // Unique identifier for the user
  name: string;              // User's full name
  email: string;             // User's email address (for notifications, login)
  description: string;       // Description of user's aptitudes, skills, and workload capacity (e.g., "Expert in Python, prefers backend tasks, can handle 2-3 medium tasks per week")
  assignedTaskIds: string[]; // List of task IDs currently assigned to this user
  projectIds: string[];      // List of project IDs this user is a member of
}
```

### Task

Represents a task within a project.

```typescript
enum TaskStatus {
  TODO = "To Do",
  IN_PROGRESS = "In Progress",
  BLOCKED = "Blocked",
  IN_REVIEW = "In Review",
  COMPLETED = "Completed"
}

interface Task {
  taskId: string;            // Unique identifier for the task
  projectId: string;         // ID of the project this task belongs to
  title: string;             // Short title for the task
  description: string;       // Detailed description of the task requirements
  status: TaskStatus;        // Current status of the task (e.g., "To Do", "In Progress")
  assignedUserId?: string;   // ID of the user assigned to this task (optional)
  estimatedEffort?: number;  // Estimated effort in hours or story points (optional)
  actualEffort?: number;     // Actual effort spent (optional)
  creationDate: Date;
  dueDate?: Date;            // Optional due date for the task
  completionDate?: Date;     // Optional completion date
  dependencies?: string[];   // List of task IDs that this task depends on (optional)
}
```

### AIModels (Helper types for AI interactions)
```typescript
interface UserProfileForAI {
  userId: string;
  aptitudes: string; // Parsed or structured from User.description
  currentWorkload: number; // Calculated based on assigned tasks' effort vs capacity
  taskPreferences?: string; // e.g., "backend", "frontend", "documentation"
}

interface TaskDetailsForAI {
  taskId: string;
  requiredSkills: string[]; // Extracted from Task.description
  estimatedEffort: number;
  priority?: number; // If we add priority
}
```

## Functions / API Endpoints

These functions represent the core operations needed. They can be mapped to backend API endpoints and corresponding frontend service methods.

### Project Management

*   `createProject(name: string, description: string): Promise<Project>`
*   `getProjectById(projectId: string): Promise<Project | null>`
*   `updateProject(projectId: string, updates: Partial<Pick<Project, 'name' | 'description'>>): Promise<Project>`
*   `deleteProject(projectId: string): Promise<void>`
*   `listProjects(userId?: string): Promise<Project[]>` (Optionally filter by user)
*   `addUserToProject(projectId: string, userId: string): Promise<void>`
*   `removeUserFromProject(projectId: string, userId: string): Promise<void>`
*   `getProjectUsers(projectId: string): Promise<User[]>`
*   `getProjectTasks(projectId: string, statusFilter?: TaskStatus, assignedUserIdFilter?: string): Promise<Task[]>`

### User Management

*   `createUser(name: string, email: string, description: string): Promise<User>`
*   `getUserById(userId: string): Promise<User | null>`
*   `updateUser(userId: string, updates: Partial<Pick<User, 'name' | 'email' | 'description'>>): Promise<User>`
*   `deleteUser(userId: string): Promise<void>` (Consider implications: reassign tasks, etc.)
*   `listUsers(): Promise<User[]>`
*   `getUserTasks(userId: string, statusFilter?: TaskStatus): Promise<Task[]>`

### Task Management

*   `createTask(projectId: string, title: string, description: string, estimatedEffort?: number, dueDate?: Date, assignedUserId?: string, dependencies?: string[]): Promise<Task>`
*   `getTaskById(taskId: string): Promise<Task | null>`
*   `updateTask(taskId: string, updates: Partial<Omit<Task, 'taskId' | 'projectId' | 'creationDate'>>): Promise<Task>`
*   `deleteTask(taskId: string): Promise<void>`
*   `assignTask(taskId: string, userId: string): Promise<Task>`
*   `unassignTask(taskId: string): Promise<Task>`
*   `updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task>`

### AI-Powered Functions

*   `suggestOptimalUserForTask(taskId: string, projectId: string): Promise<User | null>`
    *   *Input*: Task details (requirements, effort), Project context (available users)
    *   *Logic*: AI analyzes task needs against user profiles (aptitudes, current workload, preferences).
    *   *Output*: Suggested user ID or User object.
*   `getSmartTaskSuggestions(userId: string, projectId: string, count?: number): Promise<Task[]>`
    *   *Input*: User ID, Project ID
    *   *Logic*: AI identifies tasks from the project backlog that are a good fit for the user's skills and current availability/workload.
    *   *Output*: List of suggested Task objects.
*   `analyzeProjectHealth(projectId: string): Promise<ProjectHealthReport>` (Requires defining `ProjectHealthReport` type, could include risk assessment, progress bottlenecks, workload distribution)
    *   *Input*: Project ID
    *   *Logic*: AI analyzes overall project status, task distribution, potential delays.
    *   *Output*: A report object.
*   `generateTaskDescription(brief: string, context?: any): Promise<string>` (AI helps expand a brief task idea into a fuller description)
*   `estimateTaskEffort(taskDescription: string, historicalData?: any): Promise<number>` (AI predicts effort based on description and similar past tasks)

---

This provides a comprehensive starting point.
