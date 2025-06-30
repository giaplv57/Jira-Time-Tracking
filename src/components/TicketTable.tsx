import { AlertCircle, AlertTriangle, Calendar, CheckCircle, Clock, Flag, Loader2, Pause, Square, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { jiraApi } from '../services/jiraApi';
import { JiraCredentials, JiraTicket, TimerState } from '../types/jira';
import { ColumnConfig, ColumnSelector } from './ColumnSelector';

interface TicketTableProps {
  jql: string;
  filter: string;
  credentials: JiraCredentials;
  onTimerUpdate: (ticketId: string, ticketKey: string, elapsedTime: number) => void;
  onShowWorklog: (newTicketId: string) => void;
  onStopTracking: () => void;
  activeTimer: { ticketId: string; ticketKey: string; elapsedTime: number } | null;
  pendingTicketSwitch: string | null;
  isWorklogModalOpen: boolean;
  worklogAction: 'stop' | 'switch';
}

export const TicketTable: React.FC<TicketTableProps> = ({
  jql,
  filter,
  credentials,
  onTimerUpdate,
  onShowWorklog,
  onStopTracking,
  activeTimer,
  pendingTicketSwitch,
  isWorklogModalOpen,
  worklogAction
}) => {
  const [tickets, setTickets] = useState<JiraTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [timer, setTimer] = useState<TimerState | null>(null);
  const [animatingTicket, setAnimatingTicket] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [columns, setColumns] = useState<ColumnConfig[]>([
    { key: 'ticket', label: 'Ticket', visible: true, required: true },
    { key: 'summary', label: 'Summary', visible: true, required: true },
    { key: 'status', label: 'Status', visible: true },
    { key: 'priority', label: 'Priority', visible: true },
    { key: 'assignee', label: 'Assignee', visible: true },
    { key: 'reporter', label: 'Reporter', visible: false },
    { key: 'created', label: 'Created', visible: false },
    { key: 'updated', label: 'Updated', visible: true },
    { key: 'time', label: 'Time', visible: true, required: true },
  ]);

  // Load tickets from Jira API when JQL changes
  useEffect(() => {
    const loadTickets = async () => {
      if (!jql.trim()) return;

      setLoading(true);
      setError(null);

      try {
        // Set credentials in the API service
        jiraApi.setCredentials(credentials);

        // Search for issues using the provided JQL
        const response = await jiraApi.searchIssues(jql, 0, 50);

        // Convert Jira issues to our internal format
        const convertedTickets = response.issues.map(issue =>
          jiraApi.convertJiraIssueToTicket(issue)
        );

        setTickets(convertedTickets);
      } catch (err) {
        console.error('Failed to load tickets:', err);
        setError(err instanceof Error ? err.message : 'Failed to load tickets from Jira');
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, [jql, credentials]);

  const filteredTickets = tickets.filter(ticket =>
    ticket.summary.toLowerCase().includes(filter.toLowerCase()) ||
    ticket.key.toLowerCase().includes(filter.toLowerCase()) ||
    ticket.status.toLowerCase().includes(filter.toLowerCase())
  );

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    if (selectedTicket === a.id) return -1;
    if (selectedTicket === b.id) return 1;
    return 0;
  });

  // Handle pending ticket switch after worklog modal closes
  useEffect(() => {
    if (pendingTicketSwitch && !isWorklogModalOpen && worklogAction === 'switch') {
      switchToTicket(pendingTicketSwitch);
    }
  }, [pendingTicketSwitch, isWorklogModalOpen, worklogAction]);

  // Handle timer stop after worklog modal closes
  useEffect(() => {
    if (!isWorklogModalOpen && worklogAction === 'stop' && !pendingTicketSwitch) {
      // Timer should be stopped - this is handled in MainScreen
      setTimer(null);
      setSelectedTicket(null);
    }
  }, [isWorklogModalOpen, worklogAction, pendingTicketSwitch]);

  useEffect(() => {
    let interval: number;
    if (timer?.isRunning && !isWorklogModalOpen) {
      interval = setInterval(() => {
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
    }
    return () => clearInterval(interval);
  }, [timer?.isRunning, tickets, onTimerUpdate, isWorklogModalOpen]);

  const handleTicketClick = (ticketId: string) => {
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
  };

  const switchToTicket = (ticketId: string) => {
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
    }, 300);
  };

  const toggleTimer = () => {
    if (timer && !isWorklogModalOpen) {
      setTimer({
        ...timer,
        isRunning: !timer.isRunning,
        startTime: timer.isRunning ? timer.startTime : Date.now() - timer.elapsedTime
      });
    }
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000) % 60;
    const minutes = Math.floor(milliseconds / (1000 * 60)) % 60;
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'to do': return 'bg-gray-100 text-gray-700';
      case 'in progress': return 'bg-blue-100 text-blue-700';
      case 'in review': return 'bg-yellow-100 text-yellow-700';
      case 'done': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Bug': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'Story': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'Task': return <Clock className="w-4 h-4 text-green-500" />;
      case 'Epic': return <User className="w-4 h-4 text-purple-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const visibleColumns = columns.filter(col => col.visible);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Tickets ({sortedTickets.length})</h3>
        <div className="flex items-center space-x-3">
          {timer?.isRunning && (
            <button
              onClick={onStopTracking}
              className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
            >
              <Square className="w-4 h-4" />
              <span className="text-sm">Stop Tracking</span>
            </button>
          )}
          <ColumnSelector columns={columns} onColumnsChange={setColumns} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/80">
            <tr>
              {visibleColumns.map((column) => (
                <th key={column.key} className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedTickets.map((ticket) => {
              const isSelected = activeTimer?.ticketId === ticket.id;
              const isAnimating = animatingTicket === ticket.id;

              return (
                <tr
                  key={ticket.id}
                  onClick={() => handleTicketClick(ticket.id)}
                  className={`cursor-pointer transition-all duration-500 ease-in-out hover:bg-blue-50 ${isSelected
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500 shadow-lg transform scale-[1.01]'
                    : 'hover:shadow-md'
                    } ${isAnimating ? 'animate-pulse bg-blue-100' : ''
                    }`}
                  style={{
                    transform: isSelected ? 'translateY(-2px)' : 'translateY(0)',
                    boxShadow: isSelected ? '0 8px 25px rgba(59, 130, 246, 0.15)' : undefined,
                    zIndex: isSelected ? 10 : 1,
                    position: 'relative'
                  }}
                >
                  {visibleColumns.map((column) => {
                    switch (column.key) {
                      case 'ticket':
                        return (
                          <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              {getTypeIcon(ticket.type)}
                              <div>
                                <div className="text-sm font-medium text-gray-900">{ticket.key}</div>
                                <div className="text-xs text-gray-500 capitalize">{ticket.type}</div>
                              </div>
                            </div>
                          </td>
                        );
                      case 'summary':
                        return (
                          <td key={column.key} className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900 max-w-md truncate">
                              {ticket.summary}
                            </div>
                          </td>
                        );
                      case 'status':
                        return (
                          <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                              {ticket.status}
                            </span>
                          </td>
                        );
                      case 'priority':
                        return (
                          <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <Flag className={`w-4 h-4 ${getPriorityColor(ticket.priority)}`} />
                              <span className={`text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                                {ticket.priority}
                              </span>
                            </div>
                          </td>
                        );
                      case 'assignee':
                        return (
                          <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-gray-600" />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{ticket.assignee}</div>
                              </div>
                            </div>
                          </td>
                        );
                      case 'reporter':
                        return (
                          <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                <User className="w-3 h-3 text-gray-500" />
                              </div>
                              <div className="ml-2">
                                <div className="text-sm text-gray-700">{ticket.reporter}</div>
                              </div>
                            </div>
                          </td>
                        );
                      case 'created':
                        return (
                          <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <div className="text-sm text-gray-700">
                                {new Date(ticket.created).toLocaleDateString()}
                              </div>
                            </div>
                          </td>
                        );
                      case 'updated':
                        return (
                          <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                            <div className="text-xs text-gray-500">
                              Updated {new Date(ticket.updated).toLocaleDateString()}
                            </div>
                          </td>
                        );
                      case 'time':
                        return (
                          <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                            {isSelected && activeTimer ? (
                              <div className="flex items-center space-x-3">
                                <div className="bg-blue-100 px-3 py-1 rounded-lg">
                                  <span className="text-blue-800 font-mono text-sm font-medium">
                                    {formatTime(activeTimer.elapsedTime)}
                                  </span>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleTimer();
                                  }}
                                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                                  disabled={isWorklogModalOpen}
                                >
                                  <Pause className="w-4 h-4 text-gray-600" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">Click to start</span>
                            )}
                          </td>
                        );
                      default:
                        return null;
                    }
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {loading && (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <div className="text-gray-500 mb-2">Loading tickets...</div>
          <div className="text-sm text-gray-400">Searching Jira with your query</div>
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-12">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <div className="text-red-600 mb-2">Failed to load tickets</div>
          <div className="text-sm text-gray-500 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && sortedTickets.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-2">No tickets found</div>
          <div className="text-sm text-gray-400">Try adjusting your search filters or JQL query</div>
        </div>
      )}
    </div>
  );
};