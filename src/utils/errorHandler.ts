/**
 * Simple error handling utilities for consistent error management
 */

/**
 * Extract a user-friendly error message from any error type
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return 'An unexpected error occurred';
}

/**
 * Log error consistently across the application
 */
export function logError(operation: string, error: unknown, context?: Record<string, unknown>): void {
    console.error(`[${operation}] Error:`, {
        message: getErrorMessage(error),
        error,
        context,
        timestamp: new Date().toISOString()
    });
}

/**
 * Handle and log error, return user-friendly message
 */
export function handleError(operation: string, error: unknown, context?: Record<string, unknown>): string {
    logError(operation, error, context);
    return getErrorMessage(error);
}