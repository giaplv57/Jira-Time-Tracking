import { useCallback, useEffect, useState } from 'react';
import { JiraTicket, TimerState } from '../types/jira';

const ANIMATION_DELAY = 300;

interface UseTicketTimerReturn {
    selectedTicket: string | null;
    timer: TimerState | null;
    animatingTicket: string | null;
    handleTicketClick: (ticketId: string) => void;
    switchToTicket: (ticketId: string) => void;
    toggleTimer: () => void;
    formatTime: (milliseconds: number) => string;
}

export const useTicketTimer = (
    onTimerUpdate: (ticketId: string, ticketKey: string, elapsedTime: number) => void,
    onShowWorklog: (newTicketId: string) => void,
    onStopTracking: () => void,
    isWorklogModalOpen: boolean,
    worklogAction: 'stop' | 'switch',
    pendingTicketSwitch: string | null,
    tickets: JiraTicket[]
): UseTicketTimerReturn => {
    const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
    const [timer, setTimer] = useState<TimerState | null>(null);
    const [animatingTicket, setAnimatingTicket] = useState<string | null>(null);

    const switchToTicket = useCallback((ticketId: string) => {
        // Start animation
        setAnimatingTicket(ticketId);

        // After a brief delay, update the selected ticket and start timer
        setTimeout(() => {
            setSelectedTicket(ticketId);
            setTimer({
                ticketId,
                startTime: Date.now(),
                elapsedTime: 0,
                isRunning: true
            });
            setAnimatingTicket(null);
        }, ANIMATION_DELAY);
    }, []);

    // Handle pending ticket switch after worklog modal closes
    useEffect(() => {
        if (pendingTicketSwitch && !isWorklogModalOpen && worklogAction === 'switch') {
            switchToTicket(pendingTicketSwitch);
        }
    }, [pendingTicketSwitch, isWorklogModalOpen, worklogAction, switchToTicket]);

    // Handle timer stop after worklog modal closes
    useEffect(() => {
        if (!isWorklogModalOpen && worklogAction === 'stop' && !pendingTicketSwitch) {
            setTimer(null);
            setSelectedTicket(null);
        }
    }, [isWorklogModalOpen, worklogAction, pendingTicketSwitch]);

    // Timer interval effect with proper cleanup
    useEffect(() => {
        if (!timer?.isRunning || isWorklogModalOpen) return;

        const interval = setInterval(() => {
            setTimer(prev => {
                if (prev) {
                    const newElapsedTime = Date.now() - prev.startTime;
                    const currentTicket = tickets.find(t => t.id === prev.ticketId);
                    if (currentTicket) {
                        onTimerUpdate(prev.ticketId, currentTicket.key, newElapsedTime);
                    }
                    return {
                        ...prev,
                        elapsedTime: newElapsedTime
                    };
                }
                return prev;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [timer?.isRunning, isWorklogModalOpen, onTimerUpdate, tickets]);

    const handleTicketClick = useCallback((ticketId: string) => {
        if (selectedTicket === ticketId) return;

        // If there's already a timer running, show worklog modal first
        if (timer?.isRunning && selectedTicket && !isWorklogModalOpen) {
            onShowWorklog(ticketId);
            return;
        }

        // If worklog modal is not open, proceed with normal switch
        if (!isWorklogModalOpen) {
            switchToTicket(ticketId);
        }
    }, [selectedTicket, timer?.isRunning, isWorklogModalOpen, onShowWorklog, switchToTicket]);

    const toggleTimer = useCallback(() => {
        if (timer && !isWorklogModalOpen) {
            setTimer({
                ...timer,
                isRunning: !timer.isRunning,
                startTime: timer.isRunning ? timer.startTime : Date.now() - timer.elapsedTime
            });
        }
    }, [timer, isWorklogModalOpen]);

    const formatTime = useCallback((milliseconds: number) => {
        const seconds = Math.floor(milliseconds / 1000) % 60;
        const minutes = Math.floor(milliseconds / (1000 * 60)) % 60;
        const hours = Math.floor(milliseconds / (1000 * 60 * 60));

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, []);

    return {
        selectedTicket,
        timer,
        animatingTicket,
        handleTicketClick,
        switchToTicket,
        toggleTimer,
        formatTime
    };
};