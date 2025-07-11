import { ColumnConfig } from '../components/ColumnSelector';
import { DEFAULT_COLUMN_SETTINGS } from '../constants/columnConfig';
import { JiraCredentials } from '../types/jira';
import { handleError } from '../utils/errorHandler';

interface SessionData {
    credentials: JiraCredentials;
    lastJQL: string;
    columnSettings: ColumnConfig[];
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
            throw new Error(`Failed to decode session data: ${error}`);
        }
    }

    /**
     * Save session data to localStorage
     */
    async saveSession(credentials: JiraCredentials, lastJQL: string = '', columnSettings?: ColumnConfig[]): Promise<void> {
        try {
            const sessionData: SessionData = {
                credentials,
                lastJQL,
                columnSettings: columnSettings || DEFAULT_COLUMN_SETTINGS
            };

            const jsonData = JSON.stringify(sessionData);
            const obfuscatedData = this.obfuscate(jsonData);

            localStorage.setItem(this.STORAGE_KEY, obfuscatedData);
        } catch (error) {
            handleError('Save Session', error);
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
            const parsedData = JSON.parse(jsonData);

            // Handle backward compatibility - add default column settings if missing
            const sessionData: SessionData = {
                credentials: parsedData.credentials,
                lastJQL: parsedData.lastJQL || '',
                columnSettings: parsedData.columnSettings || DEFAULT_COLUMN_SETTINGS
            };

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
                await this.saveSession(currentSession.credentials, lastJQL, currentSession.columnSettings);
            }
        } catch (error) {
            console.error('Failed to update last JQL:', error);
        }
    }

    /**
     * Update column settings in the session
     */
    async updateColumnSettings(columnSettings: ColumnConfig[]): Promise<void> {
        try {
            const currentSession = await this.loadSession();
            if (currentSession) {
                await this.saveSession(currentSession.credentials, currentSession.lastJQL, columnSettings);
            }
        } catch (error) {
            console.error('Failed to update column settings:', error);
        }
    }

    /**
     * Clear session data
     */
    clearSession(): void {
        localStorage.removeItem(this.STORAGE_KEY);
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