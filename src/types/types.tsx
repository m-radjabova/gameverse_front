export interface User {
  id: number;
  username: string;
  email: string;
}

export interface ReqUser {
  username: string;
  email: string;
}

export interface Team {
  id: number;
  name: string;
  members: User[];
}

export interface ResponseTask{
  status : string;
  tasks : Task[];
}

export interface Task {
  id: number;
  title: string;
  description: string;
  assignees: User[];
  status: string;
  priority: string;     
  created_date: string;
  end_date: string;
}

export interface ReqTask {
  title: string;
  description: string;
  assignees: User[];
  status: string;
  priority: string;      
  end_date: string;
}

export interface FilterParams {
  assignee_id?: number;
  priority?: string;
  from_date?: string;
  title?: string;
}

export interface FilterState {
  assignees: number[];
  priority: string;
  from_date: string;
  title: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface UserOption extends SelectOption {
  value: string;
}

export type StatusType = "TODO" | "IN_PROGRESS" | "VERIFIED" | "DONE";
export type PriorityType = "LOW" | "MEDIUM" | "HIGH";


export interface UpdateTaskStatusParams {
  taskId: number;
  newStatus: StatusType;
}

export interface DragEndEvent {
  active: { id: string };
  over: { id: string } | null;
}