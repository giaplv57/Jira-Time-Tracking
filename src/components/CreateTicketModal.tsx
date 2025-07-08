import { Button, Form, Input, message, Popover, Select } from 'antd';
import {
    Calendar,
    ChevronDown,
    Component,
    FileText,
    Flag,
    FolderOpen,
    User,
    X
} from 'lucide-react';
import React, { useState } from 'react';
import {
    mockComponents,
    mockIssueTypes,
    mockPriorities,
    mockProjects,
    mockSprints,
    mockUsers
} from '../services/ticketDefaultsService';

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
    issueType?: string;
    reporter?: string;
    assignee?: string;
    priority?: string;
    components?: string[];
    sprint?: string;
    project: string;
}


interface TagFieldProps {
    icon: React.ReactNode;
    label: string;
    value?: string | string[];
    placeholder: string;
    options: Array<{ value: string; label: string; icon?: string }>;
    mode?: 'single' | 'multiple';
    onChange: (value: string | string[]) => void;
}

const TagField: React.FC<TagFieldProps> = ({
    icon,
    label,
    value,
    placeholder,
    options,
    mode = 'single',
    onChange
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasValue = mode === 'multiple' ? value && value.length > 0 : value;

    const displayValue = () => {
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

    const selectContent = (
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
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }
        `}
            >
                <div className="text-gray-500">{icon}</div>
                <span className="text-sm font-medium">{label}:</span>
                <span className="text-sm flex-1">{displayValue()}</span>
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
    defaultProject = 'WQLegend'
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<CreateTicketData>>({
        project: defaultProject
    });

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const ticketData: CreateTicketData = {
                summary: values.summary,
                description: values.description,
                project: formData.project || defaultProject,
                issueType: formData.issueType,
                reporter: formData.reporter,
                assignee: formData.assignee,
                priority: formData.priority,
                components: formData.components,
                sprint: formData.sprint,
            };

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            message.success('Ticket created successfully!');
            onSubmit(ticketData);
            handleClose();
        } catch (error) {
            console.error('Form validation failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        form.resetFields();
        setFormData({ project: defaultProject });
        onClose();
    };

    const handleFieldChange = (field: string, value: string | string[]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

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
                                <p className="text-sm text-gray-500">Quickly create a new Jira ticket</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <Form form={form} layout="vertical" className="space-y-6">
                        {/* Required Fields */}
                        <div className="space-y-4">
                            <Form.Item
                                name="summary"
                                label="Summary"
                                rules={[{ required: true, message: 'Please enter a summary' }]}
                            >
                                <Input
                                    placeholder="Brief description of the issue"
                                    className="rounded-lg"
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item
                                name="description"
                                label="Description"
                                rules={[{ required: true, message: 'Please enter a description' }]}
                            >
                                <TextArea
                                    placeholder="Detailed description of the issue"
                                    rows={4}
                                    className="rounded-lg"
                                />
                            </Form.Item>
                        </div>

                        {/* Dynamic Tag-Based Fields */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Additional Details</h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <TagField
                                    icon={<FileText className="w-4 h-4" />}
                                    label="Issue Type"
                                    value={formData.issueType}
                                    placeholder="Select issue type"
                                    options={mockIssueTypes}
                                    onChange={(value) => handleFieldChange('issueType', value)}
                                />

                                <TagField
                                    icon={<Flag className="w-4 h-4" />}
                                    label="Priority"
                                    value={formData.priority}
                                    placeholder="Select priority"
                                    options={mockPriorities}
                                    onChange={(value) => handleFieldChange('priority', value)}
                                />

                                <TagField
                                    icon={<User className="w-4 h-4" />}
                                    label="Reporter"
                                    value={formData.reporter}
                                    placeholder="Select reporter"
                                    options={mockUsers}
                                    onChange={(value) => handleFieldChange('reporter', value)}
                                />

                                <TagField
                                    icon={<User className="w-4 h-4" />}
                                    label="Assignee"
                                    value={formData.assignee}
                                    placeholder="Select assignee"
                                    options={mockUsers}
                                    onChange={(value) => handleFieldChange('assignee', value)}
                                />

                                <TagField
                                    icon={<Component className="w-4 h-4" />}
                                    label="Components"
                                    value={formData.components}
                                    placeholder="Select components"
                                    options={mockComponents}
                                    mode="multiple"
                                    onChange={(value) => handleFieldChange('components', value)}
                                />

                                <TagField
                                    icon={<Calendar className="w-4 h-4" />}
                                    label="Sprint"
                                    value={formData.sprint}
                                    placeholder="Select sprint"
                                    options={mockSprints}
                                    onChange={(value) => handleFieldChange('sprint', value)}
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                            <div className="flex items-center space-x-2">
                                <FolderOpen className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-600">Project:</span>
                                <Select
                                    value={formData.project}
                                    onChange={(value) => handleFieldChange('project', value)}
                                    options={mockProjects}
                                    className="min-w-[120px]"
                                    size="small"
                                />
                            </div>

                            <div className="flex space-x-3">
                                <Button onClick={handleClose}>
                                    Cancel
                                </Button>
                                <Button
                                    type="primary"
                                    loading={loading}
                                    onClick={handleSubmit}
                                    className="bg-gradient-to-r from-green-600 to-emerald-600 border-none hover:from-green-700 hover:to-emerald-700"
                                >
                                    Create Ticket
                                </Button>
                            </div>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    );
};