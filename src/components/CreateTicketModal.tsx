import { Alert, Button, Form, Input, message, Popover, Select, Skeleton } from 'antd';
import {
    AlertCircle,
    Calendar,
    ChevronDown,
    Component,
    FileText,
    Flag,
    FolderOpen,
    User,
    X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { TicketApiService } from '../services/ticketApiService';

const { TextArea } = Input;

interface CreateTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (ticketData: CreateTicketData) => void;
    defaultProject?: string;
}

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

interface OptionType {
    value: string;
    label: string;
    icon?: string;
}

interface TagFieldProps {
    icon: React.ReactNode;
    label: string;
    value?: string | string[];
    placeholder: string;
    options: OptionType[];
    mode?: 'single' | 'multiple';
    loading?: boolean;
    error?: string;
    onChange: (value: string | string[]) => void;
}

const TagField: React.FC<TagFieldProps> = ({
    icon,
    label,
    value,
    placeholder,
    options,
    mode = 'single',
    loading = false,
    error,
    onChange
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasValue = mode === 'multiple' ? value && value.length > 0 : value;

    const displayValue = () => {
        if (loading) return 'Loading...';
        if (error) return 'Error loading data';
        if (!hasValue) return placeholder;

        if (mode === 'multiple' && Array.isArray(value)) {
            return value.length === 1
                ? options.find(opt => opt.value === value[0])?.label || value[0]
                : `${value.length} selected`;
        }

        if (typeof value === 'string') {
            const option = options.find(opt => opt.value === value);
            return option ? `${option.icon || ''} ${option.label}`.trim() : value;
        }

        return placeholder;
    };

    const selectContent = loading ? (
        <div style={{ width: '200px', padding: '8px' }}>
            <Skeleton active paragraph={{ rows: 3 }} />
        </div>
    ) : error ? (
        <div style={{ width: '200px', padding: '8px' }}>
            <Alert
                message="Loading Error"
                description={error}
                type="error"
                showIcon
            />
        </div>
    ) : (
        <Select
            value={value}
            onChange={(newValue) => {
                onChange(newValue);
                if (mode !== 'multiple') {
                    setIsOpen(false);
                }
            }}
            placeholder={placeholder}
            mode={mode === 'multiple' ? 'multiple' : undefined}
            style={{ width: '200px' }}
            showSearch
            filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={options.map(opt => ({
                value: opt.value,
                label: opt.icon ? `${opt.icon} ${opt.label}` : opt.label
            }))}
        />
    );

    return (
        <Popover
            content={selectContent}
            trigger="click"
            open={isOpen}
            onOpenChange={setIsOpen}
            placement="bottomLeft"
        >
            <div
                className={`
          flex items-center space-x-2 px-3 py-2 rounded-lg border cursor-pointer transition-all
          ${hasValue
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : error
                            ? 'bg-red-50 border-red-200 text-red-600'
                            : loading
                                ? 'bg-gray-50 border-gray-200 text-gray-400'
                                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }
        `}
            >
                <div className="text-gray-500">{icon}</div>
                <span className="text-sm font-medium">{label}:</span>
                <span className="text-sm flex-1">{displayValue()}</span>
                {error && <AlertCircle className="w-4 h-4 text-red-500" />}
                <ChevronDown
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </div>
        </Popover>
    );
};

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    defaultProject = 'WQLEGEND'
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<{ accountId: string; displayName: string } | null>(null);

    // Form data state
    const [formData, setFormData] = useState<Partial<CreateTicketData>>({});

    // Options state
    const [projects, setProjects] = useState<OptionType[]>([]);
    const [issueTypes, setIssueTypes] = useState<OptionType[]>([]);
    const [priorities, setPriorities] = useState<OptionType[]>([]);
    const [users, setUsers] = useState<OptionType[]>([]);
    const [components, setComponents] = useState<OptionType[]>([]);
    const [sprints, setSprints] = useState<OptionType[]>([]);

    // Loading states
    const [loadingStates, setLoadingStates] = useState({
        projects: false,
        issueTypes: false,
        priorities: false,
        users: false,
        components: false,
        sprints: false,
        currentUser: false
    });

    // Error states
    const [errorStates, setErrorStates] = useState({
        projects: '',
        issueTypes: '',
        priorities: '',
        users: '',
        components: '',
        sprints: '',
        currentUser: ''
    });

    // Helper to update loading state
    const setLoadingState = (key: keyof typeof loadingStates, value: boolean) => {
        setLoadingStates(prev => ({ ...prev, [key]: value }));
    };

    // Helper to update error state
    const setErrorState = (key: keyof typeof errorStates, value: string) => {
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
            setErrorState('currentUser', error instanceof Error ? error.message : 'Failed to load current user');
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
            setErrorState('projects', error instanceof Error ? error.message : 'Failed to load projects');
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
            setErrorState('issueTypes', error instanceof Error ? error.message : 'Failed to load issue types');
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
            setErrorState('priorities', error instanceof Error ? error.message : 'Failed to load priorities');
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
            setErrorState('users', error instanceof Error ? error.message : 'Failed to load users');
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
            setErrorState('components', error instanceof Error ? error.message : 'Failed to load components');
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
            setErrorState('sprints', error instanceof Error ? error.message : 'Failed to load sprints');
        } finally {
            setLoadingState('sprints', false);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // Validate required fields
            if (!formData.issueType) {
                message.error('Please select an issue type');
                return;
            }

            setLoading(true);

            // Validate that a project is selected
            if (!formData.project) {
                message.error('Please select a project');
                return;
            }

            const ticketData: CreateTicketData = {
                summary: values.summary,
                description: values.description,
                project: formData.project,
                issueType: formData.issueType,
                reporter: formData.reporter,
                assignee: formData.assignee,
                priority: formData.priority,
                components: formData.components,
                sprint: formData.sprint,
            };

            // Create the ticket using real API
            const result = await TicketApiService.createIssue(ticketData);

            message.success(`Ticket ${result.key} created successfully!`);
            onSubmit(ticketData);
            handleClose();
        } catch (error) {
            console.error('Failed to create ticket:', error);
            message.error(error instanceof Error ? error.message : 'Failed to create ticket');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        form.resetFields();
        setFormData({});
        // Reset all states
        setProjects([]);
        setIssueTypes([]);
        setPriorities([]);
        setUsers([]);
        setComponents([]);
        setSprints([]);
        setCurrentUser(null);
        onClose();
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

    // Load current user on mount
    useEffect(() => {
        if (isOpen) {
            loadCurrentUser();
        }
    }, [isOpen]);

    // Load projects on mount
    useEffect(() => {
        if (isOpen) {
            loadProjects();
        }
    }, [isOpen]);

    // Load project-specific data when project changes (but not on initial mount)
    useEffect(() => {
        if (isOpen && formData.project && projects.length > 0) {
            loadProjectMetadata(formData.project);
        }
    }, [isOpen, formData.project]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleClose}></div>

                <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                                <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Create New Ticket</h3>
                                <p className="text-sm text-gray-500">Add a new ticket to your project</p>
                            </div>
                        </div>
                        <Button
                            type="text"
                            icon={<X className="w-4 h-4" />}
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600"
                        />
                    </div>

                    <Form form={form} layout="vertical" onFinish={handleSubmit}>
                        {/* Summary */}
                        <Form.Item
                            name="summary"
                            label="Summary"
                            rules={[{ required: true, message: 'Please enter a summary' }]}
                        >
                            <Input placeholder="Enter ticket summary" />
                        </Form.Item>

                        {/* Description */}
                        <Form.Item
                            name="description"
                            label="Description"
                            rules={[{ required: true, message: 'Please enter a description' }]}
                        >
                            <TextArea rows={4} placeholder="Enter ticket description" />
                        </Form.Item>

                        {/* Tags Section */}
                        <div className="space-y-3 mb-6">
                            <TagField
                                icon={<FolderOpen className="w-4 h-4" />}
                                label="Project"
                                value={formData.project}
                                placeholder="Select project"
                                options={projects}
                                loading={loadingStates.projects}
                                error={errorStates.projects}
                                onChange={(value) => handleFieldChange('project', value)}
                            />

                            <TagField
                                icon={<FileText className="w-4 h-4" />}
                                label="Issue Type"
                                value={formData.issueType}
                                placeholder="Select issue type"
                                options={issueTypes}
                                loading={loadingStates.issueTypes}
                                error={errorStates.issueTypes}
                                onChange={(value) => handleFieldChange('issueType', value)}
                            />

                            <TagField
                                icon={<Flag className="w-4 h-4" />}
                                label="Priority"
                                value={formData.priority}
                                placeholder="Select priority"
                                options={priorities}
                                loading={loadingStates.priorities}
                                error={errorStates.priorities}
                                onChange={(value) => handleFieldChange('priority', value)}
                            />

                            <TagField
                                icon={<User className="w-4 h-4" />}
                                label="Assignee"
                                value={formData.assignee}
                                placeholder="Select assignee"
                                options={users}
                                loading={loadingStates.users}
                                error={errorStates.users}
                                onChange={(value) => handleFieldChange('assignee', value)}
                            />

                            <TagField
                                icon={<User className="w-4 h-4" />}
                                label="Reporter"
                                value={formData.reporter}
                                placeholder="Select reporter"
                                options={users}
                                loading={loadingStates.users}
                                error={errorStates.users}
                                onChange={(value) => handleFieldChange('reporter', value)}
                            />

                            <TagField
                                icon={<Component className="w-4 h-4" />}
                                label="Components"
                                value={formData.components}
                                placeholder="Select components"
                                options={components}
                                mode="multiple"
                                loading={loadingStates.components}
                                error={errorStates.components}
                                onChange={(value) => handleFieldChange('components', value)}
                            />

                            <TagField
                                icon={<Calendar className="w-4 h-4" />}
                                label="Sprint"
                                value={formData.sprint}
                                placeholder="Select sprint"
                                options={sprints}
                                loading={loadingStates.sprints}
                                error={errorStates.sprints}
                                onChange={(value) => handleFieldChange('sprint', value)}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end space-x-3 pt-4 border-t">
                            <Button onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
                            >
                                Create Ticket
                            </Button>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    );
};