export interface JiraTicket {
  id: string;
  key: string;
  summary: string;
  status: string;
  priority: string;
  assignee: string;
  reporter: string;
  created: string;
  updated: string;
  description: string;
  type: 'Story' | 'Bug' | 'Task' | 'Epic';
}

export interface JiraCredentials {
  token: string;
  endpoint: string;
}

export interface TimerState {
  ticketId: string;
  startTime: number;
  elapsedTime: number;
  isRunning: boolean;
}