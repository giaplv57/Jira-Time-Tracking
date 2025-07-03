import { useCallback, useEffect, useState } from 'react';
import { ColumnConfig } from '../components/ColumnSelector';
import { sessionService } from '../services/sessionService';
import { JiraCredentials } from '../types/jira';

interface SessionState {
    isLoading: boolean;
    isAuthenticated: boolean;
    credentials: JiraCredentials | null;
    lastJQL: string;
    columnSettings: ColumnConfig[];
}

interface UseSessionReturn extends SessionState {
    saveSession: (credentials: JiraCredentials, lastJQL?: string, columnSettings?: ColumnConfig[]) => Promise<void>;
    updateLastJQL: (jql: string) => Promise<void>;
    updateColumnSettings: (columnSettings: ColumnConfig[]) => Promise<void>;
    logout: () => void;
    restoreSession: () => Promise<boolean>;
}

export const useSession = (): UseSessionReturn => {
    // Default column settings
    const getDefaultColumnSettings = (): ColumnConfig[] => [
        { key: 'ticket', label: 'Ticket', visible: true, required: true },
        { key: 'type', label: 'Type', visible: true },
        { key: 'summary', label: 'Summary', visible: true, required: true },
        { key: 'status', label: 'Status', visible: true },
        { key: 'priority', label: 'Priority', visible: true },
        { key: 'assignee', label: 'Assignee', visible: true },
        { key: 'reporter', label: 'Reporter', visible: false },
        { key: 'created', label: 'Created', visible: false },
        { key: 'updated', label: 'Updated', visible: true },
    ];

    const [state, setState] = useState<SessionState>({
        isLoading: true,
        isAuthenticated: false,
        credentials: null,
        lastJQL: '',
        columnSettings: getDefaultColumnSettings()
    });

    /**
     * Save session data
     */
    const saveSession = useCallback(async (credentials: JiraCredentials, lastJQL: string = '', columnSettings?: ColumnConfig[]) => {
        try {
            const settingsToSave = columnSettings || state.columnSettings;
            await sessionService.saveSession(credentials, lastJQL, settingsToSave);
            setState(prev => ({
                ...prev,
                isAuthenticated: true,
                credentials,
                lastJQL,
                columnSettings: settingsToSave
            }));
        } catch (error) {
            console.error('Failed to save session:', error);
        }
    }, [state.columnSettings]);

    /**
     * Update the last JQL query
     */
    const updateLastJQL = useCallback(async (jql: string) => {
        try {
            await sessionService.updateLastJQL(jql);
            setState(prev => ({
                ...prev,
                lastJQL: jql
            }));
        } catch (error) {
            console.error('Failed to update last JQL:', error);
        }
    }, []);

    /**
     * Update column settings
     */
    const updateColumnSettings = useCallback(async (columnSettings: ColumnConfig[]) => {
        try {
            await sessionService.updateColumnSettings(columnSettings);
            setState(prev => ({
                ...prev,
                columnSettings
            }));
        } catch (error) {
            console.error('Failed to update column settings:', error);
        }
    }, []);

    /**
     * Logout and clear session
     */
    const logout = useCallback(() => {
        sessionService.clearSession();
        setState({
            isLoading: false,
            isAuthenticated: false,
            credentials: null,
            lastJQL: '',
            columnSettings: getDefaultColumnSettings()
        });
    }, []);

    /**
     * Restore session from storage
     */
    const restoreSession = useCallback(async (): Promise<boolean> => {
        try {
            setState(prev => ({ ...prev, isLoading: true }));

            const sessionData = await sessionService.loadSession();

            if (sessionData) {
                setState({
                    isLoading: false,
                    isAuthenticated: true,
                    credentials: sessionData.credentials,
                    lastJQL: sessionData.lastJQL,
                    columnSettings: sessionData.columnSettings
                });
                return true;
            } else {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    isAuthenticated: false
                }));
                return false;
            }
        } catch (error) {
            console.error('Failed to restore session:', error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                isAuthenticated: false
            }));
            return false;
        }
    }, []);

    /**
     * Initialize session on mount
     */
    useEffect(() => {
        restoreSession();
    }, [restoreSession]);

    return {
        ...state,
        saveSession,
        updateLastJQL,
        updateColumnSettings,
        logout,
        restoreSession
    };
};