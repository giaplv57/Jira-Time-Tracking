import { useCallback, useEffect, useState } from 'react';
import { sessionService } from '../services/sessionService';
import { JiraCredentials } from '../types/jira';

interface SessionState {
    isLoading: boolean;
    isAuthenticated: boolean;
    credentials: JiraCredentials | null;
    lastJQL: string;
}

interface UseSessionReturn extends SessionState {
    saveSession: (credentials: JiraCredentials, lastJQL?: string) => Promise<void>;
    updateLastJQL: (jql: string) => Promise<void>;
    logout: () => void;
    restoreSession: () => Promise<boolean>;
}

export const useSession = (): UseSessionReturn => {
    const [state, setState] = useState<SessionState>({
        isLoading: true,
        isAuthenticated: false,
        credentials: null,
        lastJQL: ''
    });

    /**
     * Save session data
     */
    const saveSession = useCallback(async (credentials: JiraCredentials, lastJQL: string = '') => {
        try {
            await sessionService.saveSession(credentials, lastJQL);
            setState(prev => ({
                ...prev,
                isAuthenticated: true,
                credentials,
                lastJQL
            }));
        } catch (error) {
            console.error('Failed to save session:', error);
        }
    }, []);

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
     * Logout and clear session
     */
    const logout = useCallback(() => {
        sessionService.clearSession();
        setState({
            isLoading: false,
            isAuthenticated: false,
            credentials: null,
            lastJQL: ''
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
                    lastJQL: sessionData.lastJQL
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
        logout,
        restoreSession
    };
};