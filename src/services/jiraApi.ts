import { JiraCredentials, JiraTicket, JiraWorklog } from '../types/jira';

export interface JiraIssue {
    id: string;
    key: string;
    fields: {
        summary: string;
        status: {
            name: string;
        };
        priority: {
            name: string;
        };
        assignee: {
            displayName: string;
        } | null;
        reporter: {
            displayName: string;
        };
        created: string;
        updated: string;
        description: string;
        issuetype: {
            name: string;
        };
    };
}

export interface JiraSearchResponse {
    issues: JiraIssue[];
    total: number;
    maxResults: number;
    startAt: number;
}

export interface WorklogRequest {
    timeSpent: string;
    started: string;
    comment: string;
}


class JiraApiService {
    private credentials: JiraCredentials | null = null;

    setCredentials(credentials: JiraCredentials) {
        this.credentials = credentials;
    }

    private getAuthHeaders(): HeadersInit {
        if (!this.credentials) {
            throw new Error('Jira credentials not set');
        }

        // For Jira Server/Data Center with Personal Access Token
        // Use Bearer authentication
        return {
            'Authorization': `Bearer ${this.credentials.token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        };
    }

    private getBaseUrl(): string {
        if (!this.credentials) {
            throw new Error('Jira credentials not set');
        }

        // Use the Vite proxy to avoid CORS issues
        // The proxy will forward requests to the actual Jira server
        return '/api/jira/rest/api/latest/';
    }

    async testConnection(): Promise<boolean> {
        try {
            const response = await fetch(`${this.getBaseUrl()}myself`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            return response.ok;
        } catch (error) {
            console.error('Connection test failed:', error);
            return false;
        }
    }

    async searchIssues(jql: string, startAt: number = 0, maxResults: number = 50): Promise<JiraSearchResponse> {
        const url = `${this.getBaseUrl()}search`;
        const body = {
            jql,
            startAt,
            maxResults,
            fields: [
                'summary',
                'status',
                'priority',
                'assignee',
                'reporter',
                'created',
                'updated',
                'description',
                'issuetype'
            ]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to search issues: ${response.status} ${response.statusText} - ${errorText}`);
        }

        return response.json();
    }

    async createWorklog(issueKey: string, worklog: WorklogRequest): Promise<void> {
        const url = `${this.getBaseUrl()}issue/${issueKey}/worklog`;

        const response = await fetch(url, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(worklog),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create worklog: ${response.status} ${response.statusText} - ${errorText}`);
        }
    }

    // Convert Jira API response to our internal format
    convertJiraIssueToTicket(jiraIssue: JiraIssue): JiraTicket {
        return {
            id: jiraIssue.id,
            key: jiraIssue.key,
            summary: jiraIssue.fields.summary,
            status: jiraIssue.fields.status.name,
            priority: jiraIssue.fields.priority.name,
            assignee: jiraIssue.fields.assignee?.displayName || 'Unassigned',
            reporter: jiraIssue.fields.reporter.displayName,
            created: jiraIssue.fields.created,
            updated: jiraIssue.fields.updated,
            description: jiraIssue.fields.description || '',
            type: jiraIssue.fields.issuetype.name as 'Story' | 'Bug' | 'Task' | 'Epic',
        };
    }

    // Convert time format from UI to Jira format
    convertTimeSpentToJiraFormat(timeSpent: string): string {
        // Jira accepts formats like: 1w 2d 3h 4m
        // Our UI might send: 2h 30m, 1.5h, 90m, 1d 4h

        // If it's already in a good format, return as-is
        if (/^\d+[wdhm](\s+\d+[wdhm])*$/.test(timeSpent.trim())) {
            return timeSpent.trim();
        }

        // Handle decimal hours (e.g., 1.5h)
        const decimalHourMatch = timeSpent.match(/^(\d+(?:\.\d+)?)h$/);
        if (decimalHourMatch) {
            const hours = parseFloat(decimalHourMatch[1]);
            const wholeHours = Math.floor(hours);
            const minutes = Math.round((hours - wholeHours) * 60);

            if (wholeHours > 0 && minutes > 0) {
                return `${wholeHours}h ${minutes}m`;
            } else if (wholeHours > 0) {
                return `${wholeHours}h`;
            } else {
                return `${minutes}m`;
            }
        }

        // Handle minutes only (e.g., 90m)
        const minutesMatch = timeSpent.match(/^(\d+)m$/);
        if (minutesMatch) {
            const totalMinutes = parseInt(minutesMatch[1]);
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;

            if (hours > 0 && minutes > 0) {
                return `${hours}h ${minutes}m`;
            } else if (hours > 0) {
                return `${hours}h`;
            } else {
                return `${minutes}m`;
            }
        }

        // Return as-is if we can't parse it
        return timeSpent.trim();
    }

    // NEW METHODS FOR CREATE TICKET FUNCTIONALITY


    // Get work logs for a specific issue
    async getWorklogsForIssue(issueKey: string): Promise<JiraWorklog[]> {
        const url = `${this.getBaseUrl()}issue/${issueKey}/worklog`;

        const response = await fetch(url, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to get worklogs for issue ${issueKey}: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        return data.worklogs.map((worklog: {
            id: string;
            issueId: string;
            author: {
                accountId?: string;
                displayName: string;
                emailAddress?: string;
            };
            comment: string;
            started: string;
            timeSpent: string;
            timeSpentSeconds: number;
            created: string;
            updated: string;
        }) => ({
            id: worklog.id,
            issueId: worklog.issueId,
            author: {
                accountId: worklog.author.accountId,
                displayName: worklog.author.displayName,
                emailAddress: worklog.author.emailAddress,
            },
            comment: worklog.comment || '',
            started: worklog.started,
            timeSpent: worklog.timeSpent,
            timeSpentSeconds: worklog.timeSpentSeconds,
            created: worklog.created,
            updated: worklog.updated,
        }));
    }

    // Get work logs for multiple issues
    async getWorklogsForIssues(issueKeys: string[]): Promise<JiraWorklog[]> {
        const worklogPromises = issueKeys.map(issueKey =>
            this.getWorklogsForIssue(issueKey).catch(error => {
                console.warn(`Failed to fetch worklogs for ${issueKey}:`, error);
                return [];
            })
        );

        const worklogArrays = await Promise.all(worklogPromises);
        return worklogArrays.flat();
    }

    // Convert time spent seconds to duration for calendar events
    convertSecondsToHours(seconds: number): number {
        return seconds / 3600; // Convert seconds to hours
    }

    // Parse Jira time spent format to seconds
    parseJiraTimeToSeconds(timeSpent: string): number {
        let totalSeconds = 0;

        // Match patterns like "2h 30m", "1d 4h", "90m", etc.
        const patterns = [
            { regex: /(\d+)w/g, multiplier: 7 * 24 * 3600 }, // weeks
            { regex: /(\d+)d/g, multiplier: 24 * 3600 },     // days
            { regex: /(\d+)h/g, multiplier: 3600 },          // hours
            { regex: /(\d+)m/g, multiplier: 60 },            // minutes
            { regex: /(\d+)s/g, multiplier: 1 }              // seconds
        ];

        patterns.forEach(({ regex, multiplier }) => {
            let match;
            while ((match = regex.exec(timeSpent)) !== null) {
                totalSeconds += parseInt(match[1]) * multiplier;
            }
        });

        return totalSeconds;
    }
}

export const jiraApi = new JiraApiService();