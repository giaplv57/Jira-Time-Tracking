import { Clock, LogOut, Plus, Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useSession } from '../hooks/useSession';
import { jiraApi } from '../services/jiraApi';
import { JiraCredentials } from '../types/jira';
import { JQLModal } from './JQLModal';
import { TicketTable } from './TicketTable';
import { Toast } from './Toast';
import { WorklogData, WorklogModal } from './WorklogModal';

interface MainScreenProps {
  credentials: JiraCredentials;
  lastJQL: string;
  onLogout: () => void;
}

export const MainScreen: React.FC<MainScreenProps> = ({ credentials, lastJQL, onLogout }) => {
  const { updateLastJQL, columnSettings, updateColumnSettings } = useSession();
  const [jql, setJql] = useState(lastJQL);
  const [showTickets, setShowTickets] = useState(!!lastJQL);
  const [showJQLModal, setShowJQLModal] = useState(false);
  const [showWorklogModal, setShowWorklogModal] = useState(false);
  const [activeTimer, setActiveTimer] = useState<{ ticketId: string; ticketKey: string; elapsedTime: number } | null>(null);
  const [pendingTicketSwitch, setPendingTicketSwitch] = useState<string | null>(null);
  const [worklogAction, setWorklogAction] = useState<'stop' | 'switch'>('stop');
  const [shouldDropWork, setShouldDropWork] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Initialize tickets display if we have a saved JQL
  useEffect(() => {
    if (lastJQL) {
      setShowTickets(true);
    }
  }, [lastJQL]);

  const handleJQLSubmit = async (newJql: string) => {
    setJql(newJql);
    setShowTickets(true);
    setShowJQLModal(false);

    // Save the JQL to session
    await updateLastJQL(newJql);
  };

  const handleTimerUpdate = (ticketId: string, ticketKey: string, elapsedTime: number) => {
    setActiveTimer({ ticketId, ticketKey, elapsedTime });
  };

  const handleStopTracking = () => {
    if (activeTimer) {
      setWorklogAction('stop');
      setShowWorklogModal(true);
    }
  };

  const handleWorklogSubmit = async (worklog: WorklogData) => {
    if (!activeTimer) return;

    try {
      // Set credentials in the API service
      jiraApi.setCredentials(credentials);

      // Calculate the actual start time by subtracting elapsed time from current time
      const actualStartTime = new Date(Date.now() - (activeTimer.elapsedTime * 1000));

      // Convert the worklog data to Jira format
      const jiraWorklog = {
        timeSpent: jiraApi.convertTimeSpentToJiraFormat(worklog.timeSpent),
        started: actualStartTime.toISOString().replace('Z', '+0000'),
        comment: worklog.description
      };

      // Submit the worklog to Jira
      await jiraApi.createWorklog(activeTimer.ticketKey, jiraWorklog);

      console.log('Worklog successfully submitted to Jira:', {
        ticket: activeTimer.ticketKey,
        action: worklogAction,
        actualStartTime: actualStartTime.toISOString(),
        ...jiraWorklog
      });

      // Show success toast
      setToast({
        message: `Worklog submitted successfully for ${activeTimer.ticketKey}!`,
        type: 'success'
      });

      if (worklogAction === 'stop') {
        // Stop the current timer completely
        setActiveTimer(null);
      } else if (worklogAction === 'switch' && pendingTicketSwitch) {
        // Switch to the new ticket - this will be handled by TicketTable
        // The timer will be reset there
      }

      setShowWorklogModal(false);
      setPendingTicketSwitch(null);
    } catch (error) {
      console.error('Failed to submit worklog to Jira:', error);

      // Show error toast
      setToast({
        message: `Failed to submit worklog: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
      });
    }
  };

  const handleWorklogModalClose = () => {
    // Cancel button: Just close modal, preserve timer state and pending switch
    setShouldDropWork(false);
    setShowWorklogModal(false);
    // Note: We don't clear pendingTicketSwitch or activeTimer here
  };

  const handleDropWork = () => {
    // Drop Work button: Discard timer and close modal (old Cancel behavior)
    setShouldDropWork(true);
    setActiveTimer(null); // Clear the active timer display
    setShowWorklogModal(false);
    setPendingTicketSwitch(null);
  };

  const handleTicketSwitch = (newTicketId: string) => {
    setWorklogAction('switch');
    setPendingTicketSwitch(newTicketId);
    setShowWorklogModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
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

      <main className="max-w-7xl mx-auto px-6 py-8">
        {showTickets && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Search Results</h2>
                <p className="text-gray-600 mt-1">JQL: <code className="bg-gray-100 px-2 py-1 rounded text-sm">{jql}</code></p>
              </div>
            </div>
          </div>
        )}

        {showTickets ? (
          <TicketTable
            jql={jql}
            credentials={credentials}
            onTimerUpdate={handleTimerUpdate}
            onShowWorklog={handleTicketSwitch}
            onStopTracking={handleStopTracking}
            activeTimer={activeTimer}
            pendingTicketSwitch={pendingTicketSwitch}
            isWorklogModalOpen={showWorklogModal}
            worklogAction={worklogAction}
            shouldDropWork={shouldDropWork}
            columnSettings={columnSettings}
            onColumnSettingsChange={updateColumnSettings}
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

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};