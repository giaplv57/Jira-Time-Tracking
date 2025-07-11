import { useCallback, useEffect, useState } from 'react';
import { ColumnConfig } from '../components/ColumnSelector';
import { DEFAULT_COLUMN_SETTINGS } from '../constants/columnConfig';
import { sessionService } from '../services/sessionService';
import { JiraCredentials } from '../types/jira';
import { handleError } from '../utils/errorHandler';

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
    const [state, setState] = useState<SessionState>({
        isLoading: true,
        isAuthenticated: false,
        credentials: null,
        lastJQL: '',
        columnSettings: DEFAULT_COLUMN_SETTINGS
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
            handleError('Save Session', error);
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
            handleError('Update Last JQL', error);
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
            handleError('Update Column Settings', error);
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
            columnSettings: DEFAULT_COLUMN_SETTINGS
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
            handleError('Restore Session', error);
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