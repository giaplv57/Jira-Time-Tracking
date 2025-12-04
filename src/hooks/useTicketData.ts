import { useCallback, useEffect, useState } from 'react';
import { jiraApi } from '../services/jiraApi';
import { JiraCredentials, JiraTicket } from '../types/jira';

interface UseTicketDataReturn {
    tickets: JiraTicket[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export const useTicketData = (
    jql: string,
    credentials: JiraCredentials
): UseTicketDataReturn => {
    const [tickets, setTickets] = useState<JiraTicket[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const TICKETS_PER_PAGE = 50;

    const loadTickets = useCallback(async () => {
        if (!jql.trim()) return;

        setLoading(true);
        setError(null);

        try {
            // Set credentials in the API service
            jiraApi.setCredentials(credentials);

            // Search for issues using the provided JQL
            const response = await jiraApi.searchIssues(jql, 0, TICKETS_PER_PAGE);

            // Convert Jira issues to our internal format
            const convertedTickets = response.issues.map(issue =>
                jiraApi.convertJiraIssueToTicket(issue)
            );

            // Collect unique Epic keys that don't have summaries
            const epicKeys = [...new Set(
                convertedTickets
                    .filter(ticket => ticket.epicLink && !ticket.epicSummary)
                    .map(ticket => ticket.epicLink as string)
            )];

            // Fetch Epic summaries if there are any Epic keys
            if (epicKeys.length > 0) {
                const epicSummaries = await jiraApi.fetchEpicSummaries(epicKeys);

                // Update tickets with Epic summaries
                convertedTickets.forEach(ticket => {
                    if (ticket.epicLink && epicSummaries.has(ticket.epicLink)) {
                        ticket.epicSummary = epicSummaries.get(ticket.epicLink);
                    }
                });
            }

            setTickets(convertedTickets);
        } catch (err) {
            console.error('Failed to load tickets:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to load tickets from Jira';
            setError(errorMessage);
            setTickets([]);
        } finally {
            setLoading(false);
        }
    }, [jql, credentials]);

    const refetch = useCallback(() => {
        loadTickets();
    }, [loadTickets]);

    useEffect(() => {
        loadTickets();
    }, [loadTickets]);

    return {
        tickets,
        loading,
        error,
        refetch
    };
};