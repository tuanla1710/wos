export type TaskStatus = "todo" | "in_progress" | "blocked" | "done";
export type TaskPriority = "high" | "medium" | "low";

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  start_date?: string | null;
  due_date: string | null;
  work_days?: number | null;
  project_id: string | null;
  parent_id?: string | null;
  assignee_id?: string | null;
  is_inbox: boolean;
  blocked_reason?: string;
  focused?: boolean;
  checklists?: Checklist[];
  subtasks?: Task[];
  links?: EntityLink[];
  issue_key?: string | null;
  task_number?: number | null;
};

export type Checklist = { id: string; title: string; is_done: boolean; position: number };

export type EntityLink = { id: string; title: string; url: string; task_id?: string | null; project_id?: string | null };

export type Project = {
  id: string;
  name: string;
  key?: string | null;
  parent_id?: string | null;
  start_date?: string | null;
  due_date?: string | null;
  work_days?: number | null;
  children?: Project[];
  links?: EntityLink[];
};

export type Holiday = { id: string; day: string; name: string };
export type PublicHoliday = {
  id?: string;
  day: string;
  name: string;
  name_en: string;
  kind: "primary" | "secondary" | "custom";
  country: string;
  off: boolean;
};
export type HolidaySettings = {
  country: string | null;
  country2: string | null;
  effective: string;
  effective_name: string;
  detected: string;
  detected_name: string;
  timezone: string;
  skips: string[];
  countries: { code: string; name: string }[];
};

export type Me = {
  id: string;
  name: string;
  email: string;
  timezone: string;
  ai_enabled?: boolean;
  is_admin?: boolean;
  phone?: string | null;
  phone_verified?: boolean;
  workspace: { id: string; name: string; role?: string | null; member_count?: number };
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  phone_verified?: boolean;
  timezone: string;
  is_admin: boolean;
  disabled: boolean;
  created_at: string | null;
  workspaces: { id: string; name: string; role: string }[];
};

export type WorkspaceRef = { id: string; name: string; role: string };

export type ProjectWorkStatus = "empty" | "not_started" | "in_progress" | "blocked" | "overdue" | "done";

export type StatisticsData = {
  today: string;
  tasks: {
    total: number;
    inbox: number;
    overdue: number;
    due_today: number;
    upcoming: number;
    todo: number;
    in_progress: number;
    blocked: number;
    done: number;
  };
  projects: {
    total: number;
    counts: Record<ProjectWorkStatus, number>;
    rows: {
      id: string;
      name: string;
      status: ProjectWorkStatus;
      progress: number;
      tasks: number;
      completed: number;
      in_progress: number;
      blocked: number;
      overdue: number;
    }[];
  };
};

export type ReviewData = {
  week_start: string;
  week_end: string;
  last_week_start: string;
  last_week_end: string;
  next_week_start: string;
  plan_week_start: string;
  plan_week_end: string;
  completed: number;
  completed_tasks: Task[];
  last_week_done: Task[];
  this_week_done: Task[];
  this_week_doing: Task[];
  next_week_planned: Task[];
  overdue: Task[];
  blocked: Task[];
  due_next_week: Task[];
  projects: { id: string; name: string; progress: number }[];
  week_focus: Task[];
};

export type HomeData = {
  greeting: string;
  name: string;
  today: string;
  counts: { overdue: number; due_today: number; upcoming: number; inbox: number };
  focus: Task[];
  suggestions: Task[];
  this_week: { date: string; weekday: string; count: number }[];
  review_prompt: boolean;
  review_week_start?: string;
  next_week_start: string;
  team_activity?: { id: string; summary: string; task_id: string | null; actor: string }[];
  member_count?: number;
};

export type CalendarEvent = {
  id: string;
  title: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  all_day: boolean;
};

export type Comment = {
  id: string;
  author_name: string;
  body: string;
  deleted: boolean;
  created_at: string | null;
};

export type Attachment = { id: string; filename: string; size_bytes: number };

export type NoteKind = "quick" | "work" | "meeting" | "lecture";

export type WorkNote = {
  id: string;
  title: string;
  body?: string;
  snippet?: string;
  kind: NoteKind;
  pinned: boolean;
  starred: boolean;
  archived: boolean;
  author_id: string;
  author_name: string;
  task_id: string | null;
  task_title?: string | null;
  project_id: string | null;
  project_name?: string | null;
  tags: string[];
  file_count: number;
  files?: Attachment[];
  created_at: string | null;
  updated_at: string | null;
};

export type NoteActivity = {
  id: string;
  verb: string;
  summary: string;
  actor: string;
  created_at: string | null;
};
