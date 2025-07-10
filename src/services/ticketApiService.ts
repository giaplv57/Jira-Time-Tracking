import { jiraApi } from './jiraApi';

// Real API service for ticket creation metadata
export class TicketApiService {
    // Get all projects
    static async getProjects(): Promise<Array<{ value: string; label: string }>> {
        try {
            const projects = await jiraApi.getProjects();
            return projects.map(project => ({
                value: project.key,
                label: project.name
            }));
        } catch (error) {
            console.error('Failed to fetch projects:', error);
            throw new Error('Failed to load projects. Please try again.');
        }
    }

    // Get issue types for a specific project
    static async getProjectIssueTypes(projectKey: string): Promise<Array<{ value: string; label: string; icon?: string }>> {
        try {
            const issueTypes = await jiraApi.getProjectIssueTypes(projectKey);
            return issueTypes
                .filter(type => !type.subtask) // Exclude subtasks for main issue creation
                .map(type => ({
                    value: type.id,
                    label: type.name,
                    icon: this.getIssueTypeIcon(type.name)
                }));
        } catch (error) {
            console.error(`Failed to fetch issue types for project ${projectKey}:`, error);
            throw new Error('Failed to load issue types. Please try again.');
        }
    }

    // Get all priorities
    static async getPriorities(): Promise<Array<{ value: string; label: string; icon?: string }>> {
        try {
            const priorities = await jiraApi.getPriorities();
            return priorities.map(priority => ({
                value: priority.id,
                label: priority.name,
                icon: this.getPriorityIcon(priority.name)
            }));
        } catch (error) {
            console.error('Failed to fetch priorities:', error);
            throw new Error('Failed to load priorities. Please try again.');
        }
    }

    // Get assignable users for a project
    static async getAssignableUsers(projectKey: string): Promise<Array<{ value: string; label: string }>> {
        try {
            const users = await jiraApi.getAssignableUsers(projectKey);
            return users
                .filter(user => user.active)
                .map(user => ({
                    value: user.accountId,
                    label: user.displayName
                }));
        } catch (error) {
            console.error(`Failed to fetch assignable users for project ${projectKey}:`, error);
            throw new Error('Failed to load users. Please try again.');
        }
    }

    // Get components for a project
    static async getProjectComponents(projectKey: string): Promise<Array<{ value: string; label: string }>> {
        try {
            const components = await jiraApi.getProjectComponents(projectKey);
            return components.map(component => ({
                value: component.id,
                label: component.name
            }));
        } catch (error) {
            console.error(`Failed to fetch components for project ${projectKey}:`, error);
            throw new Error('Failed to load components. Please try again.');
        }
    }

    // Get sprints for a project (auto-selects first scrum board)
    static async getProjectSprints(projectKey: string): Promise<Array<{ value: string; label: string }>> {
        try {
            // Get boards for the project
            const boards = await jiraApi.getProjectBoards(projectKey);

            // Find the first scrum board
            const scrumBoard = boards.find(board => board.type === 'scrum');
            if (!scrumBoard) {
                // If no scrum board, return empty array
                return [];
            }

            // Get active and future sprints for the scrum board
            const sprints = await jiraApi.getBoardSprints(scrumBoard.id, ['active', 'future']);

            return sprints.map(sprint => ({
                value: sprint.id.toString(),
                label: `${sprint.name} (${sprint.state})`
            }));
        } catch (error) {
            console.error(`Failed to fetch sprints for project ${projectKey}:`, error);
            throw new Error('Failed to load sprints. Please try again.');
        }
    }

    // Get current user
    static async getCurrentUser(): Promise<{ accountId: string; displayName: string }> {
        try {
            const user = await jiraApi.getCurrentUser();
            return {
                accountId: user.accountId,
                displayName: user.displayName
            };
        } catch (error) {
            console.error('Failed to fetch current user:', error);
            throw new Error('Failed to load current user. Please try again.');
        }
    }

    // Get active sprint for a project (for default selection)
    static async getActiveSprint(projectKey: string): Promise<string | null> {
        try {
            const boards = await jiraApi.getProjectBoards(projectKey);
            const scrumBoard = boards.find(board => board.type === 'scrum');

            if (!scrumBoard) {
                return null;
            }

            const sprints = await jiraApi.getBoardSprints(scrumBoard.id, ['active']);
            const activeSprint = sprints.find(sprint => sprint.state === 'active');

            return activeSprint ? activeSprint.id.toString() : null;
        } catch (error) {
            console.error(`Failed to fetch active sprint for project ${projectKey}:`, error);
            return null;
        }
    }

    // Helper method to get issue type icons
    private static getIssueTypeIcon(issueTypeName: string): string {
        const iconMap: { [key: string]: string } = {
            'Story': '📖',
            'Bug': '🐛',
            'Task': '✅',
            'Epic': '🎯',
            'Sub-task': '📝',
            'Improvement': '⚡',
            'New Feature': '🆕'
        };
        return iconMap[issueTypeName] || '📋';
    }

    // Helper method to get priority icons
    private static getPriorityIcon(priorityName: string): string {
        const iconMap: { [key: string]: string } = {
            'Highest': '🔴',
            'High': '🟠',
            'Medium': '🟡',
            'Low': '🟢',
            'Lowest': '🔵',
            'Critical': '🚨',
            'Major': '🔶',
            'Minor': '🔸',
            'Trivial': '⚪'
        };
        return iconMap[priorityName] || '⚫';
    }

    // Create a new issue
    static async createIssue(ticketData: {
        summary: string;
        description: string;
        project: string;
        issueType: string;
        priority?: string;
        assignee?: string;
        reporter?: string;
        components?: string[];
        sprint?: string;
    }): Promise<{ id: string; key: string }> {
        try {
            const createRequest = {
                fields: {
                    project: { key: ticketData.project },
                    summary: ticketData.summary,
                    description: ticketData.description,
                    issuetype: { id: ticketData.issueType },
                    ...(ticketData.priority && { priority: { id: ticketData.priority } }),
                    ...(ticketData.assignee && { assignee: { accountId: ticketData.assignee } }),
                    ...(ticketData.reporter && { reporter: { accountId: ticketData.reporter } }),
                    ...(ticketData.components && ticketData.components.length > 0 && {
                        components: ticketData.components.map(id => ({ id }))
                    }),
                    ...(ticketData.sprint && { customfield_10020: parseInt(ticketData.sprint) })
                }
            };

            const result = await jiraApi.createIssue(createRequest);
            return {
                id: result.id,
                key: result.key
            };
        } catch (error) {
            console.error('Failed to create issue:', error);
            throw new Error('Failed to create ticket. Please check your input and try again.');
        }
    }
}