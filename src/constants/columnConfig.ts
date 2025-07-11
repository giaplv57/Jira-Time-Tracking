import { ColumnConfig } from '../components/ColumnSelector';

/**
 * Default column configuration for the ticket table
 * Order is optimized for user scanning: ticket identifier, summary, then metadata
 */
export const DEFAULT_COLUMN_SETTINGS: ColumnConfig[] = [
    { key: 'ticket', label: 'Ticket', visible: true, required: true },
    { key: 'summary', label: 'Summary', visible: true, required: true },
    { key: 'type', label: 'Type', visible: true },
    { key: 'status', label: 'Status', visible: true },
    { key: 'priority', label: 'Priority', visible: true },
    { key: 'assignee', label: 'Assignee', visible: true },
    { key: 'reporter', label: 'Reporter', visible: false },
    { key: 'created', label: 'Created', visible: false },
    { key: 'updated', label: 'Updated', visible: true },
];