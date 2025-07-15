import { useCallback, useEffect, useState } from 'react';
import { jiraApi } from '../services/jiraApi';
import { CalendarWorklogEvent, JiraCredentials, JiraTicket, JiraWorklog } from '../types/jira';

interface UseWorklogDataReturn {
    events: CalendarWorklogEvent[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export const useWorklogData = (
    tickets: JiraTicket[],
    credentials: JiraCredentials
): UseWorklogDataReturn => {
    const [events, setEvents] = useState<CalendarWorklogEvent[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const transformWorklogToEvent = useCallback((worklog: JiraWorklog, ticket: JiraTicket): CalendarWorklogEvent => {
        const startDate = new Date(worklog.started);
        const endDate = new Date(startDate.getTime() + (worklog.timeSpentSeconds * 1000));

        return {
            id: `${worklog.issueId}-${worklog.id}`,
            title: `${ticket.key}: ${worklog.comment || ticket.summary}`,
            start: startDate,
            end: endDate,
            worklog,
            ticket,
            resource: {
                priority: ticket.priority,
                type: ticket.type,
                status: ticket.status
            }
        };
    }, []);

    const loadWorklogs = useCallback(async () => {
        if (!tickets.length) {
            setEvents([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Set credentials in the API service
            jiraApi.setCredentials(credentials);

            // Get all ticket keys
            const ticketKeys = tickets.map(ticket => ticket.key);

            // Fetch worklogs for all tickets
            const allWorklogs = await jiraApi.getWorklogsForIssues(ticketKeys);

            // Transform worklogs to calendar events
            const calendarEvents: CalendarWorklogEvent[] = [];

            for (const worklog of allWorklogs) {
                // Find the corresponding ticket for this worklog
                const ticket = tickets.find(t => t.id === worklog.issueId);
                if (ticket) {
                    const event = transformWorklogToEvent(worklog, ticket);
                    calendarEvents.push(event);
                }
            }

            // Sort events by start date (newest first)
            calendarEvents.sort((a, b) => b.start.getTime() - a.start.getTime());

            setEvents(calendarEvents);
        } catch (err) {
            console.error('Failed to load worklogs:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to load worklogs from Jira';
            setError(errorMessage);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    }, [tickets, credentials, transformWorklogToEvent]);

    const refetch = useCallback(() => {
        loadWorklogs();
    }, [loadWorklogs]);

    useEffect(() => {
        loadWorklogs();
    }, [loadWorklogs]);

    return {
        events,
        loading,
        error,
        refetch
    };
};