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

export interface JiraWorklog {
  id: string;
  issueId: string;
  author: {
    accountId: string;
    displayName: string;
    emailAddress?: string;
  };
  comment: string;
  started: string; // ISO 8601 date string
  timeSpent: string; // e.g., "2h 30m"
  timeSpentSeconds: number;
  created: string;
  updated: string;
}

export interface CalendarWorklogEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: {
    priority: string;
    type: string;
    status: string;
  };
  worklog: JiraWorklog;
  ticket: JiraTicket;
}