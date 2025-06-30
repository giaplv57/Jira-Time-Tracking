import { JiraCredentials } from '../types/jira';

interface SessionData {
    credentials: JiraCredentials;
    lastJQL: string;
}

class SessionService {
    private readonly STORAGE_KEY = 'jira_time_tracker_session';

    /**
     * Simple obfuscation for basic security (not encryption)
     */
    private obfuscate(data: string): string {
        return btoa(data);
    }

    /**
     * Reverse the obfuscation
     */
    private deobfuscate(data: string): string {
        try {
            return atob(data);
        } catch (error) {
            throw new Error('Failed to decode session data');
        }
    }

    /**
     * Save session data to localStorage
     */
    async saveSession(credentials: JiraCredentials, lastJQL: string = ''): Promise<void> {
        try {
            const sessionData: SessionData = {
                credentials,
                lastJQL
            };

            const jsonData = JSON.stringify(sessionData);
            const obfuscatedData = this.obfuscate(jsonData);

            localStorage.setItem(this.STORAGE_KEY, obfuscatedData);
            console.log('Session saved successfully');
        } catch (error) {
            console.error('Failed to save session:', error);
            // Don't throw error to avoid breaking the app
        }
    }

    /**
     * Load session data from localStorage
     */
    async loadSession(): Promise<SessionData | null> {
        try {
            const obfuscatedData = localStorage.getItem(this.STORAGE_KEY);
            if (!obfuscatedData) {
                return null;
            }

            const jsonData = this.deobfuscate(obfuscatedData);
            const sessionData: SessionData = JSON.parse(jsonData);

            console.log('Session loaded successfully');
            return sessionData;
        } catch (error) {
            console.error('Failed to load session:', error);
            // Clear corrupted session data
            this.clearSession();
            return null;
        }
    }

    /**
     * Update the last JQL query in the session
     */
    async updateLastJQL(lastJQL: string): Promise<void> {
        try {
            const currentSession = await this.loadSession();
            if (currentSession) {
                await this.saveSession(currentSession.credentials, lastJQL);
            }
        } catch (error) {
            console.error('Failed to update last JQL:', error);
        }
    }

    /**
     * Clear session data
     */
    clearSession(): void {
        localStorage.removeItem(this.STORAGE_KEY);
        console.log('Session cleared');
    }

    /**
     * Check if a valid session exists
     */
    async hasValidSession(): Promise<boolean> {
        const session = await this.loadSession();
        return session !== null;
    }
}

export const sessionService = new SessionService();