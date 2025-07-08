// Mock data and defaults for ticket creation
// This will be replaced with real Jira API calls later

export interface IssueType {
    value: string;
    label: string;
    icon: string;
}

export interface Priority {
    value: string;
    label: string;
    icon: string;
}

export interface User {
    value: string;
    label: string;
}

export interface Component {
    value: string;
    label: string;
}

export interface Sprint {
    value: string;
    label: string;
}

export interface Project {
    value: string;
    label: string;
}

export const mockIssueTypes: IssueType[] = [
    { value: 'story', label: 'Story', icon: '📖' },
    { value: 'bug', label: 'Bug', icon: '🐛' },
    { value: 'task', label: 'Task', icon: '✅' },
    { value: 'epic', label: 'Epic', icon: '🎯' },
    { value: 'subtask', label: 'Sub-task', icon: '📝' },
];

export const mockPriorities: Priority[] = [
    { value: 'highest', label: 'Highest', icon: '🔴' },
    { value: 'high', label: 'High', icon: '🟠' },
    { value: 'medium', label: 'Medium', icon: '🟡' },
    { value: 'low', label: 'Low', icon: '🟢' },
    { value: 'lowest', label: 'Lowest', icon: '🔵' },
];

export const mockUsers: User[] = [
    { value: 'john.doe', label: 'John Doe' },
    { value: 'jane.smith', label: 'Jane Smith' },
    { value: 'mike.wilson', label: 'Mike Wilson' },
    { value: 'sarah.johnson', label: 'Sarah Johnson' },
    { value: 'alex.brown', label: 'Alex Brown' },
    { value: 'emily.davis', label: 'Emily Davis' },
];

export const mockComponents: Component[] = [
    { value: 'frontend', label: 'Frontend' },
    { value: 'backend', label: 'Backend' },
    { value: 'api', label: 'API' },
    { value: 'database', label: 'Database' },
    { value: 'ui-ux', label: 'UI/UX' },
    { value: 'mobile', label: 'Mobile' },
    { value: 'testing', label: 'Testing' },
];

export const mockSprints: Sprint[] = [
    { value: 'sprint-24', label: 'Sprint 24 - Current' },
    { value: 'sprint-25', label: 'Sprint 25 - Next' },
    { value: 'sprint-26', label: 'Sprint 26 - Future' },
    { value: 'backlog', label: 'Backlog' },
];

export const mockProjects: Project[] = [
    { value: 'WQLegend', label: 'WQLegend' },
    { value: 'DEMO', label: 'Demo Project' },
    { value: 'TEST', label: 'Test Project' },
    { value: 'SUPPORT', label: 'Support' },
];

// Service class for managing ticket defaults and data
export class TicketDefaultsService {
    // Get all issue types (mock data for now)
    static getIssueTypes(): Promise<IssueType[]> {
        return Promise.resolve(mockIssueTypes);
    }

    // Get all priorities (mock data for now)
    static getPriorities(): Promise<Priority[]> {
        return Promise.resolve(mockPriorities);
    }

    // Get all users (mock data for now)
    static getUsers(): Promise<User[]> {
        return Promise.resolve(mockUsers);
    }

    // Get all components (mock data for now)
    static getComponents(): Promise<Component[]> {
        return Promise.resolve(mockComponents);
    }

    // Get all sprints (mock data for now)
    static getSprints(): Promise<Sprint[]> {
        return Promise.resolve(mockSprints);
    }

    // Get all projects (mock data for now)
    static getProjects(): Promise<Project[]> {
        return Promise.resolve(mockProjects);
    }

    // Get current user (mock data for now)
    static getCurrentUser(): Promise<User> {
        return Promise.resolve(mockUsers[0]); // Return first user as current user
    }

    // Get default project
    static getDefaultProject(): string {
        return 'WQLegend';
    }

    // Future: These methods will be replaced with real Jira API calls
    // static async getRealIssueTypes(credentials: JiraCredentials): Promise<IssueType[]>
    // static async getRealPriorities(credentials: JiraCredentials): Promise<Priority[]>
    // static async getRealUsers(credentials: JiraCredentials): Promise<User[]>
    // etc.
}