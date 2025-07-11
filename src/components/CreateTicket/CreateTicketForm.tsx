import { Button, Form, Input, message } from 'antd';
import {
    Calendar,
    Component,
    FileText,
    Flag,
    FolderOpen,
    User
} from 'lucide-react';
import React from 'react';
import { CreateTicketData, useCreateTicketData } from '../../hooks/useCreateTicketData';
import { TicketApiService } from '../../services/ticketApiService';
import { handleError } from '../../utils/errorHandler';
import { TagField } from './TagField';

const { TextArea } = Input;

interface CreateTicketFormProps {
    ticketData: ReturnType<typeof useCreateTicketData>;
    onSubmit: (ticketData: CreateTicketData) => void;
    onClose: () => void;
}

export const CreateTicketForm: React.FC<CreateTicketFormProps> = ({
    ticketData,
    onSubmit,
    onClose
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = React.useState(false);

    const {
        formData,
        projects,
        issueTypes,
        priorities,
        users,
        components,
        sprints,
        loadingStates,
        errorStates,
        handleFieldChange
    } = ticketData;

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
            onClose();
        } catch (error) {
            const errorMessage = handleError('createTicket', error);
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
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
                    onChange={(value: string | string[]) => handleFieldChange('project', value)}
                />

                <TagField
                    icon={<FileText className="w-4 h-4" />}
                    label="Issue Type"
                    value={formData.issueType}
                    placeholder="Select issue type"
                    options={issueTypes}
                    loading={loadingStates.issueTypes}
                    error={errorStates.issueTypes}
                    onChange={(value: string | string[]) => handleFieldChange('issueType', value)}
                />

                <TagField
                    icon={<Flag className="w-4 h-4" />}
                    label="Priority"
                    value={formData.priority}
                    placeholder="Select priority"
                    options={priorities}
                    loading={loadingStates.priorities}
                    error={errorStates.priorities}
                    onChange={(value: string | string[]) => handleFieldChange('priority', value)}
                />

                <TagField
                    icon={<User className="w-4 h-4" />}
                    label="Assignee"
                    value={formData.assignee}
                    placeholder="Select assignee"
                    options={users}
                    loading={loadingStates.users}
                    error={errorStates.users}
                    onChange={(value: string | string[]) => handleFieldChange('assignee', value)}
                />

                <TagField
                    icon={<User className="w-4 h-4" />}
                    label="Reporter"
                    value={formData.reporter}
                    placeholder="Select reporter"
                    options={users}
                    loading={loadingStates.users}
                    error={errorStates.users}
                    onChange={(value: string | string[]) => handleFieldChange('reporter', value)}
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
                    onChange={(value: string | string[]) => handleFieldChange('components', value)}
                />

                <TagField
                    icon={<Calendar className="w-4 h-4" />}
                    label="Sprint"
                    value={formData.sprint}
                    placeholder="Select sprint"
                    options={sprints}
                    loading={loadingStates.sprints}
                    error={errorStates.sprints}
                    onChange={(value: string | string[]) => handleFieldChange('sprint', value)}
                />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button onClick={onClose}>
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
    );
};