import { useMemo, useState } from 'react';
import { JiraTicket } from '../types/jira';

const PRIORITY_VALUES: Record<string, number> = {
    'critical': 4,
    'high': 3,
    'medium': 2,
    'normal': 2, // Map both medium and normal to same value
    'low': 1
};

interface UseTicketSortingReturn {
    sortColumn: string;
    sortDirection: 'asc' | 'desc';
    sortedTickets: JiraTicket[];
    handleSort: (columnKey: string) => void;
}

export const useTicketSorting = (
    tickets: JiraTicket[],
    selectedTicket: string | null
): UseTicketSortingReturn => {
    const [sortColumn, setSortColumn] = useState<string>('priority');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const getPriorityValue = (priority: string): number => {
        return PRIORITY_VALUES[priority.toLowerCase()] || 0;
    };

    const handleSort = (columnKey: string) => {
        if (sortColumn === columnKey) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(columnKey);
            setSortDirection('desc');
        }
    };

    const sortedTickets = useMemo(() => {
        return [...tickets].sort((a, b) => {
            // Always keep selected ticket at top
            if (selectedTicket === a.id) return -1;
            if (selectedTicket === b.id) return 1;

            let comparison = 0;

            switch (sortColumn) {
                case 'ticket':
                    comparison = a.key.localeCompare(b.key);
                    break;
                case 'type':
                    comparison = a.type.localeCompare(b.type);
                    break;
                case 'summary':
                    comparison = a.summary.localeCompare(b.summary);
                    break;
                case 'status':
                    comparison = a.status.localeCompare(b.status);
                    break;
                case 'priority':
                    comparison = getPriorityValue(a.priority) - getPriorityValue(b.priority);
                    break;
                case 'assignee':
                    comparison = a.assignee.localeCompare(b.assignee);
                    break;
                case 'reporter':
                    comparison = a.reporter.localeCompare(b.reporter);
                    break;
                case 'created':
                    comparison = new Date(a.created).getTime() - new Date(b.created).getTime();
                    break;
                case 'updated':
                    comparison = new Date(a.updated).getTime() - new Date(b.updated).getTime();
                    break;
                default:
                    comparison = 0;
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [tickets, sortColumn, sortDirection, selectedTicket]);

    return {
        sortColumn,
        sortDirection,
        sortedTickets,
        handleSort
    };
};