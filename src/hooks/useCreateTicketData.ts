import { useEffect, useState } from 'react';
import { OptionType } from '../components/TagField';
import { TicketApiService } from '../services/ticketApiService';
import { handleError } from '../utils/errorHandler';

export interface CreateTicketData {
    summary: string;
    description: string;
    issueType: string;
    reporter?: string;
    assignee?: string;
    priority?: string;
    components?: string[];
    sprint?: string;
    project: string;
}

interface LoadingStates {
    projects: boolean;
    issueTypes: boolean;
    priorities: boolean;
    users: boolean;
    components: boolean;
    sprints: boolean;
    currentUser: boolean;
}

interface ErrorStates {
    projects: string;
    issueTypes: string;
    priorities: string;
    users: string;
    components: string;
    sprints: string;
    currentUser: string;
}

export const useCreateTicketData = (isOpen: boolean, defaultProject: string = 'WQLEGEND') => {
    const [currentUser, setCurrentUser] = useState<{ accountId: string; displayName: string } | null>(null);
    const [formData, setFormData] = useState<Partial<CreateTicketData>>({});

    // Options state
    const [projects, setProjects] = useState<OptionType[]>([]);
    const [issueTypes, setIssueTypes] = useState<OptionType[]>([]);
    const [priorities, setPriorities] = useState<OptionType[]>([]);
    const [users, setUsers] = useState<OptionType[]>([]);
    const [components, setComponents] = useState<OptionType[]>([]);
    const [sprints, setSprints] = useState<OptionType[]>([]);

    // Loading states
    const [loadingStates, setLoadingStates] = useState<LoadingStates>({
        projects: false,
        issueTypes: false,
        priorities: false,
        users: false,
        components: false,
        sprints: false,
        currentUser: false
    });

    // Error states
    const [errorStates, setErrorStates] = useState<ErrorStates>({
        projects: '',
        issueTypes: '',
        priorities: '',
        users: '',
        components: '',
        sprints: '',
        currentUser: ''
    });

    // Helper to update loading state
    const setLoadingState = (key: keyof LoadingStates, value: boolean) => {
        setLoadingStates(prev => ({ ...prev, [key]: value }));
    };

    // Helper to update error state
    const setErrorState = (key: keyof ErrorStates, value: string) => {
        setErrorStates(prev => ({ ...prev, [key]: value }));
    };

    const loadCurrentUser = async () => {
        setLoadingState('currentUser', true);
        setErrorState('currentUser', '');
        try {
            const user = await TicketApiService.getCurrentUser();
            setCurrentUser(user);

            // Set default reporter and assignee
            setFormData(prev => ({
                ...prev,
                reporter: user.accountId,
                assignee: user.accountId
            }));
        } catch (error) {
            const errorMessage = handleError('loadCurrentUser', error);
            setErrorState('currentUser', errorMessage);
        } finally {
            setLoadingState('currentUser', false);
        }
    };

    const loadProjects = async () => {
        setLoadingState('projects', true);
        setErrorState('projects', '');
        try {
            const projectOptions = await TicketApiService.getProjects();
            setProjects(projectOptions);

            // Auto-select default project if it exists
            const defaultProjectOption = projectOptions.find(project => project.value === defaultProject);

            if (defaultProjectOption) {
                setFormData(prev => ({
                    ...prev,
                    project: defaultProjectOption.value
                }));
                // Load project-specific metadata after setting the project
                loadProjectMetadata(defaultProjectOption.value);
            }
        } catch (error) {
            const errorMessage = handleError('loadProjects', error);
            setErrorState('projects', errorMessage);
        } finally {
            setLoadingState('projects', false);
        }
    };

    const loadProjectMetadata = async (projectKey: string) => {
        // Load all project-specific metadata in parallel
        await Promise.all([
            loadIssueTypes(projectKey),
            loadPriorities(),
            loadUsers(projectKey),
            loadComponents(projectKey),
            loadSprints(projectKey)
        ]);
    };

    const loadIssueTypes = async (projectKey: string) => {
        setLoadingState('issueTypes', true);
        setErrorState('issueTypes', '');
        try {
            const issueTypeOptions = await TicketApiService.getProjectIssueTypes(projectKey);
            setIssueTypes(issueTypeOptions);

            // Set default issue type to "Task" if available
            const taskType = issueTypeOptions.find(type => type.label.toLowerCase() === 'task');
            if (taskType && !formData.issueType) {
                setFormData(prev => ({
                    ...prev,
                    issueType: taskType.value
                }));
            }
        } catch (error) {
            const errorMessage = handleError('loadIssueTypes', error);
            setErrorState('issueTypes', errorMessage);
        } finally {
            setLoadingState('issueTypes', false);
        }
    };

    const loadPriorities = async () => {
        setLoadingState('priorities', true);
        setErrorState('priorities', '');
        try {
            const priorityOptions = await TicketApiService.getPriorities();
            setPriorities(priorityOptions);

            // Set default priority to "Medium" if available
            const mediumPriority = priorityOptions.find(priority => priority.label.toLowerCase() === 'medium');
            if (mediumPriority && !formData.priority) {
                setFormData(prev => ({
                    ...prev,
                    priority: mediumPriority.value
                }));
            }
        } catch (error) {
            const errorMessage = handleError('loadPriorities', error);
            setErrorState('priorities', errorMessage);
        } finally {
            setLoadingState('priorities', false);
        }
    };

    const loadUsers = async (projectKey: string) => {
        setLoadingState('users', true);
        setErrorState('users', '');
        try {
            const userOptions = await TicketApiService.getAssignableUsers(projectKey);
            setUsers(userOptions);
        } catch (error) {
            const errorMessage = handleError('loadUsers', error);
            setErrorState('users', errorMessage);
        } finally {
            setLoadingState('users', false);
        }
    };

    const loadComponents = async (projectKey: string) => {
        setLoadingState('components', true);
        setErrorState('components', '');
        try {
            const componentOptions = await TicketApiService.getProjectComponents(projectKey);
            setComponents(componentOptions);
        } catch (error) {
            const errorMessage = handleError('loadComponents', error);
            setErrorState('components', errorMessage);
        } finally {
            setLoadingState('components', false);
        }
    };

    const loadSprints = async (projectKey: string) => {
        setLoadingState('sprints', true);
        setErrorState('sprints', '');
        try {
            const sprintOptions = await TicketApiService.getProjectSprints(projectKey);
            setSprints(sprintOptions);

            // Set default to active sprint if available
            const activeSprint = await TicketApiService.getActiveSprint(projectKey);
            if (activeSprint && !formData.sprint) {
                setFormData(prev => ({
                    ...prev,
                    sprint: activeSprint
                }));
            }
        } catch (error) {
            const errorMessage = handleError('loadSprints', error);
            setErrorState('sprints', errorMessage);
        } finally {
            setLoadingState('sprints', false);
        }
    };

    const handleFieldChange = (field: string, value: string | string[]) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // If project changes, reload project-specific metadata
        if (field === 'project' && typeof value === 'string') {
            // Clear project-specific data
            setIssueTypes([]);
            setPriorities([]);
            setUsers([]);
            setComponents([]);
            setSprints([]);

            // Clear project-specific form data
            setFormData(prev => ({
                ...prev,
                issueType: undefined,
                priority: undefined,
                assignee: currentUser?.accountId,
                reporter: currentUser?.accountId,
                components: undefined,
                sprint: undefined
            }));

            // Load new project metadata
            loadProjectMetadata(value);
        }
    };

    const resetData = () => {
        setFormData({});
        setProjects([]);
        setIssueTypes([]);
        setPriorities([]);
        setUsers([]);
        setComponents([]);
        setSprints([]);
        setCurrentUser(null);
        setLoadingStates({
            projects: false,
            issueTypes: false,
            priorities: false,
            users: false,
            components: false,
            sprints: false,
            currentUser: false
        });
        setErrorStates({
            projects: '',
            issueTypes: '',
            priorities: '',
            users: '',
            components: '',
            sprints: '',
            currentUser: ''
        });
    };

    // Load current user on mount
    useEffect(() => {
        if (isOpen) {
            loadCurrentUser();
        }
    }, [isOpen]); // loadCurrentUser is stable within this hook scope

    // Load projects on mount
    useEffect(() => {
        if (isOpen) {
            loadProjects();
        }
    }, [isOpen, defaultProject]); // defaultProject affects loadProjects behavior

    return {
        // Data
        currentUser,
        formData,
        projects,
        issueTypes,
        priorities,
        users,
        components,
        sprints,

        // States
        loadingStates,
        errorStates,

        // Actions
        handleFieldChange,
        resetData,
        loadProjectMetadata
    };
};