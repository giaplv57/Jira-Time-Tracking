import { App } from 'antd';
import { Calendar, Clock, LogOut, Plus, Search } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useSession } from '../hooks/useSession';
import { useTicketData } from '../hooks/useTicketData';
import { jiraApi } from '../services/jiraApi';
import { JiraCredentials } from '../types/jira';
import { JQLModal } from './JQLModal';
import { TicketTable } from './TicketTable';
import { WorklogCalendar } from './WorklogCalendar';
import { WorklogData, WorklogModal } from './WorklogModal';

interface MainScreenProps {
  credentials: JiraCredentials;
  lastJQL: string;
  onLogout: () => void;
}

export const MainScreen: React.FC<MainScreenProps> = ({ credentials, lastJQL, onLogout }) => {
  const { notification } = App.useApp();
  const { updateLastJQL, columnSettings, updateColumnSettings } = useSession();
  const [jql, setJql] = useState(lastJQL);
  const [showTickets, setShowTickets] = useState(!!lastJQL);
  const [showJQLModal, setShowJQLModal] = useState(false);
  const [showWorklogModal, setShowWorklogModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [activeTimer, setActiveTimer] = useState<{ ticketId: string; ticketKey: string; elapsedTime: number; startTime: number; isRunning: boolean } | null>(null);
  const [pendingNewTask, setPendingNewTask] = useState<string | null>(null);

  // Fetch ticket data for calendar (only when we have tickets to show)
  const { tickets } = useTicketData(showTickets ? jql : '', credentials);

  // Initialize tickets display if we have a saved JQL
  useEffect(() => {
    if (lastJQL) {
      setShowTickets(true);
    }
  }, [lastJQL]);

  // Timer interval effect
  useEffect(() => {
    if (!activeTimer?.isRunning) return;

    const interval = setInterval(() => {
      setActiveTimer(prev => {
        if (prev && prev.isRunning) {
          const newElapsedTime = Date.now() - prev.startTime;
          return { ...prev, elapsedTime: newElapsedTime };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer?.isRunning]);

  const handleJQLSubmit = async (newJQL: string) => {
    setJql(newJQL);
    setShowTickets(true);
    setShowJQLModal(false);

    // Save the JQL to session
    await updateLastJQL(newJQL);
  };

  const handleTimerUpdate = (ticketId: string, ticketKey: string, elapsedTime: number) => {
    setActiveTimer(prev => {
      if (prev && prev.ticketId === ticketId) {
        return { ...prev, elapsedTime };
      }
      // If it's a new timer, create it with current time as start
      return {
        ticketId,
        ticketKey,
        elapsedTime,
        startTime: Date.now() - elapsedTime,
        isRunning: true
      };
    });
  };

  const handleToggleTimer = useCallback(() => {
    if (!activeTimer) return;

    setActiveTimer(prev => {
      if (!prev) return prev;

      if (prev.isRunning) {
        // Pausing: update elapsed time and stop running
        const currentElapsedTime = Date.now() - prev.startTime;
        return {
          ...prev,
          elapsedTime: currentElapsedTime,
          isRunning: false
        };
      } else {
        // Resuming: set new start time based on current elapsed time
        return {
          ...prev,
          startTime: Date.now() - prev.elapsedTime,
          isRunning: true
        };
      }
    });
  }, [activeTimer]);

  const startNewTimer = useCallback((ticketId: string) => {
    // For now, we'll use the ticketId as the key since we don't have access to tickets data here
    // This will be improved when we refactor to use the useTicketTimer hook properly
    setActiveTimer({
      ticketId,
      ticketKey: ticketId, // Using ticketId as fallback - this should be the actual ticket key
      elapsedTime: 0,
      startTime: Date.now(),
      isRunning: true
    });
  }, []);

  const handleStopTracking = () => {
    if (activeTimer) {
      setShowWorklogModal(true);
    }
  };

  const handleWorklogSubmit = async (worklog: WorklogData) => {
    if (!activeTimer) return;

    try {
      // Set credentials in the API service
      jiraApi.setCredentials(credentials);

      // Convert the worklog data to Jira format
      const jiraWorklog = {
        timeSpent: jiraApi.convertTimeSpentToJiraFormat(worklog.timeSpent),
        started: `${worklog.dateStarted}:00.000+0000`,
        comment: worklog.description
      };      // Submit the worklog to Jira
      await jiraApi.createWorklog(activeTimer.ticketKey, jiraWorklog);
      // Worklog successfully submitted to Jira

      // Show success notification
      notification.success({
        message: 'Worklog Submitted',
        description: `Worklog submitted successfully for ${activeTimer.ticketKey}!`,
        placement: 'topRight',
        duration: 4
      });

      // Clear current timer
      setActiveTimer(null);

      // Start new timer if there's a pending task
      if (pendingNewTask) {
        // We need to get tickets data to pass to startNewTimer
        // For now, we'll call it without tickets and let it fallback to ticketId
        startNewTimer(pendingNewTask);
        setPendingNewTask(null);
      }

      setShowWorklogModal(false);
    } catch (error) {
      console.error('Failed to submit worklog to Jira:', error);

      // Show error notification
      notification.error({
        message: 'Worklog Submission Failed',
        description: `Failed to submit worklog: ${error instanceof Error ? error.message : 'Unknown error'}`,
        placement: 'topRight',
        duration: 6
      });
    }
  };

  const handleWorklogModalClose = () => {
    // Cancel button: Just close modal, preserve timer state
    setShowWorklogModal(false);
    // Clear pending task since user cancelled
    setPendingNewTask(null);
  };

  const handleDropWork = () => {
    // Drop Work button: Discard current timer
    setActiveTimer(null);
    setShowWorklogModal(false);

    // Start new timer if there's a pending task
    if (pendingNewTask) {
      startNewTimer(pendingNewTask);
      setPendingNewTask(null);
    }
  };

  const handleTicketSwitch = (newTicketId: string) => {
    setPendingNewTask(newTicketId);
    setShowWorklogModal(true);
  };

  const handleZenModeToggle = () => {
    setZenMode(!zenMode);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {!zenMode && (
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Jira Time Tracker</h1>
                  <p className="text-sm text-gray-500">Connected to {new URL(credentials.endpoint).hostname}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowJQLModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Enter JQL</span>
                </button>

                {showTickets && (
                  <button
                    onClick={() => setShowCalendarModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Calendar</span>
                  </button>
                )}


                <button
                  onClick={onLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className={`max-w-7xl mx-auto px-6 ${zenMode ? 'py-4' : 'py-8'}`}>

        {showTickets ? (
          <TicketTable
            jql={jql}
            credentials={credentials}
            onTimerUpdate={handleTimerUpdate}
            onToggleTimer={handleToggleTimer}
            onShowWorklog={handleTicketSwitch}
            onStopTracking={handleStopTracking}
            activeTimer={activeTimer}
            isWorklogModalOpen={showWorklogModal}
            columnSettings={columnSettings}
            onColumnSettingsChange={updateColumnSettings}
            zenMode={zenMode}
            onZenModeToggle={handleZenModeToggle}
          />
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Track Time</h2>
            <p className="text-gray-600 mb-6">Click "Enter JQL" to search for Jira tickets and start tracking your time</p>
            <button
              onClick={() => setShowJQLModal(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              <span>Enter JQL Query</span>
            </button>
          </div>
        )}
      </main>

      <JQLModal
        isOpen={showJQLModal}
        onClose={() => setShowJQLModal(false)}
        onSubmit={handleJQLSubmit}
        currentJQL={jql}
      />

      {activeTimer && (
        <WorklogModal
          isOpen={showWorklogModal}
          onClose={handleWorklogModalClose}
          onDropWork={handleDropWork}
          onSubmit={handleWorklogSubmit}
          ticketKey={activeTimer.ticketKey}
          elapsedTime={activeTimer.elapsedTime}
        />
      )}


      <WorklogCalendar
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        tickets={tickets}
        credentials={credentials}
      />

    </div>
  );
};