import { useMemo } from 'react';
import { JiraTicket } from '../types/jira';

interface UseTicketFilteringReturn {
    filteredTickets: JiraTicket[];
}

export const useTicketFiltering = (
    tickets: JiraTicket[],
    filter: string
): UseTicketFilteringReturn => {
    const filteredTickets = useMemo(() => {
        if (!filter.trim()) return tickets;

        const lowerFilter = filter.toLowerCase();
        return tickets.filter(ticket =>
            ticket.summary.toLowerCase().includes(lowerFilter) ||
            ticket.key.toLowerCase().includes(lowerFilter) ||
            ticket.status.toLowerCase().includes(lowerFilter)
        );
    }, [tickets, filter]);

    return {
        filteredTickets
    };
};