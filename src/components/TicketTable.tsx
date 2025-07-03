import type { TableColumnsType } from 'antd';
import { Table } from 'antd';
import { AlertTriangle, Calendar, Clock, Pause, Play, User } from 'lucide-react';
import React, { useCallback, useMemo } from 'react';
import { useTicketData } from '../hooks/useTicketData';
import { JiraCredentials, JiraTicket } from '../types/jira';
import { getPriorityColor, getPriorityIcon, getStatusColor, getTypeIcon } from '../utils/ticketHelpers';
import { ColumnConfig, ColumnSelector } from './ColumnSelector';

interface TicketTableProps {
  jql: string;
  credentials: JiraCredentials;
  onTimerUpdate: (ticketId: string, ticketKey: string, elapsedTime: number) => void;
  onToggleTimer: () => void;
  onShowWorklog: (newTicketId: string) => void;
  onStopTracking: () => void;
  activeTimer: { ticketId: string; ticketKey: string; elapsedTime: number; startTime: number; isRunning: boolean } | null;
  pendingNewTask: string | null;
  isWorklogModalOpen: boolean;
  columnSettings: ColumnConfig[];
  onColumnSettingsChange: (columnSettings: ColumnConfig[]) => void;
}

export const TicketTable: React.FC<TicketTableProps> = ({
  jql,
  credentials,
  onTimerUpdate: _onTimerUpdate,
  onToggleTimer,
  onShowWorklog,
  onStopTracking,
  activeTimer,
  pendingNewTask: _pendingNewTask, // eslint-disable-line @typescript-eslint/no-unused-vars
  isWorklogModalOpen,
  columnSettings,
  onColumnSettingsChange
}) => {
  // Use custom hooks for data management
  const { tickets, loading, error, refetch } = useTicketData(jql, credentials);

  // Timer logic is now handled in MainScreen
  const selectedTicket = activeTimer?.ticketId || null;
  const timer = useMemo(() => activeTimer ? {
    ticketId: activeTimer.ticketId,
    startTime: activeTimer.startTime,
    elapsedTime: activeTimer.elapsedTime,
    isRunning: activeTimer.isRunning
  } : null, [activeTimer]);

  const formatTime = useCallback((milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000) % 60;
    const minutes = Math.floor(milliseconds / (1000 * 60)) % 60;
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const getPriorityValue = useCallback((priority: string): number => {
    // Priority values for sorting
    const PRIORITY_VALUES: Record<string, number> = {
      'critical': 4,
      'high': 3,
      'medium': 2,
      'normal': 2,
      'low': 1
    };
    return PRIORITY_VALUES[priority.toLowerCase()] || 0;
  }, []);

  // Sort tickets to keep selected ticket at top
  const sortedTickets = useMemo(() => {
    return [...tickets].sort((a, b) => {
      // Always keep selected ticket at top
      if (selectedTicket === a.id) return -1;
      if (selectedTicket === b.id) return 1;

      // Default sort by priority (high to low)
      return getPriorityValue(b.priority) - getPriorityValue(a.priority);
    });
  }, [tickets, selectedTicket, getPriorityValue]);

  // Simplified handlers - timer logic is now in MainScreen
  const handleTicketClickCallback = useCallback((ticketId: string) => {
    if (activeTimer && activeTimer.ticketId !== ticketId) {
      // If there's an active timer for a different ticket, show worklog modal
      onShowWorklog(ticketId);
    } else if (!activeTimer) {
      // If no active timer, start a new timer by calling onTimerUpdate
      // Find the ticket to get its key
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket) {
        _onTimerUpdate(ticketId, ticket.key, 0);
      }
    }
    // If same ticket is clicked, do nothing (timer is already running)
  }, [activeTimer, onShowWorklog, _onTimerUpdate, tickets]);

  const handleToggleTimerCallback = useCallback(() => {
    onToggleTimer();
  }, [onToggleTimer]);

  const handleRetryCallback = useCallback(() => {
    refetch();
  }, [refetch]);


  const visibleColumns = columnSettings.filter(col => col.visible);

  // Define Ant Design Table columns
  const columns: TableColumnsType<JiraTicket> = useMemo(() => {
    return visibleColumns.map((column) => {
      const baseColumn = {
        key: column.key,
        title: column.label,
        dataIndex: column.key,
        sorter: (a: JiraTicket, b: JiraTicket) => {
          // Handle priority sorting specially
          if (column.key === 'priority') {
            return getPriorityValue(a.priority) - getPriorityValue(b.priority);
          }

          // Handle ticket column (maps to 'key' field)
          if (column.key === 'ticket') {
            return a.key.localeCompare(b.key);
          }

          // For all other columns, use alphabetical sorting
          const aValue = String(a[column.key as keyof JiraTicket] || '');
          const bValue = String(b[column.key as keyof JiraTicket] || '');
          return aValue.localeCompare(bValue);
        },
      };

      switch (column.key) {
        case 'ticket':
          return {
            ...baseColumn,
            dataIndex: 'key',
            render: (key: string) => (
              <div className="text-sm font-semibold text-gray-900">{key}</div>
            ),
            width: 120,
          };

        case 'type':
          return {
            ...baseColumn,
            dataIndex: 'type',
            render: (type: string) => (
              <div className="flex items-center space-x-2">
                {getTypeIcon(type)}
                <span className="text-sm font-semibold text-gray-900 capitalize">{type}</span>
              </div>
            ),
            width: 150,
          };

        case 'summary':
          return {
            ...baseColumn,
            dataIndex: 'summary',
            render: (summary: string) => (
              <div className="text-sm font-semibold text-gray-900 max-w-md truncate">
                {summary}
              </div>
            ),
            ellipsis: true,
          };

        case 'status':
          return {
            ...baseColumn,
            dataIndex: 'status',
            render: (status: string) => (
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
                {status}
              </span>
            ),
            width: 130,
          };

        case 'priority':
          return {
            ...baseColumn,
            dataIndex: 'priority',
            render: (priority: string) => (
              <div className="flex items-center space-x-2">
                <span className={getPriorityColor(priority)}>
                  {getPriorityIcon(priority)}
                </span>
                <span className={`text-sm font-semibold ${getPriorityColor(priority)}`}>
                  {priority}
                </span>
              </div>
            ),
            width: 120,
          };

        case 'assignee':
          return {
            ...baseColumn,
            dataIndex: 'assignee',
            render: (assignee: string) => (
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <div className="ml-3">
                  <div className="text-sm font-semibold text-gray-900">{assignee}</div>
                </div>
              </div>
            ),
            width: 150,
          };

        case 'reporter':
          return {
            ...baseColumn,
            dataIndex: 'reporter',
            render: (reporter: string) => (
              <div className="flex items-center">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-3 h-3 text-gray-500" />
                </div>
                <div className="ml-2">
                  <div className="text-sm text-gray-700">{reporter}</div>
                </div>
              </div>
            ),
            width: 130,
          };

        case 'created':
          return {
            ...baseColumn,
            dataIndex: 'created',
            render: (created: string) => (
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div className="text-sm text-gray-700">
                  {new Date(created).toLocaleDateString()}
                </div>
              </div>
            ),
            width: 130,
          };

        case 'updated':
          return {
            ...baseColumn,
            dataIndex: 'updated',
            render: (updated: string) => (
              <div className="text-xs text-gray-500">
                Updated {new Date(updated).toLocaleDateString()}
              </div>
            ),
            width: 130,
          };

        case 'time':
          return {
            ...baseColumn,
            dataIndex: 'id',
            render: (ticketId: string) => {
              const isSelected = activeTimer?.ticketId === ticketId;
              const isTimerRunning = timer?.isRunning ?? false;

              return isSelected && activeTimer ? (
                <div className="flex items-center space-x-3">
                  <div className={`px-3 py-1 rounded-lg ${isTimerRunning ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <span className={`font-mono text-sm font-semibold ${isTimerRunning ? 'text-blue-800' : 'text-gray-500'}`}>
                      {formatTime(activeTimer.elapsedTime)}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleTimerCallback();
                    }}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    disabled={isWorklogModalOpen}
                    aria-label={isTimerRunning ? "Pause timer" : "Resume timer"}
                  >
                    {isTimerRunning ? (
                      <Pause className="w-4 h-4 text-gray-600" />
                    ) : (
                      <Play className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                </div>
              ) : (
                <span className="text-gray-400 text-sm">Click to start</span>
              );
            },
            width: 150,
          };

        default:
          return baseColumn;
      }
    });
  }, [visibleColumns, activeTimer, timer, isWorklogModalOpen, formatTime, handleToggleTimerCallback, getPriorityValue]);

  // Handle row click
  const handleRowClick = (record: JiraTicket) => {
    handleTicketClickCallback(record.id);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Tickets ({sortedTickets.length})</h3>
        <div className="flex items-center space-x-3">
          {timer && (
            <button
              onClick={onStopTracking}
              className="flex items-center space-x-2 px-3 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors border border-green-700"
              aria-label="Log work time"
            >
              <Clock className="w-4 h-4" />
              <span className="text-sm">Log / Drop Work</span>
            </button>
          )}
          <ColumnSelector columns={columnSettings} onColumnsChange={onColumnSettingsChange} />
        </div>
      </div>

      <div className="overflow-hidden">
        <Table<JiraTicket>
          columns={columns}
          dataSource={sortedTickets}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ x: 'max-content' }}
          size="middle"
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            className: `cursor-pointer transition-all duration-500 ease-in-out hover:bg-blue-50 ${activeTimer?.ticketId === record.id
              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500 shadow-lg transform scale-[1.01]'
              : 'hover:shadow-md'
              }`,
            style: {
              transform: activeTimer?.ticketId === record.id ? 'translateY(-2px)' : 'translateY(0)',
              boxShadow: activeTimer?.ticketId === record.id ? '0 8px 25px rgba(59, 130, 246, 0.15)' : undefined,
              zIndex: activeTimer?.ticketId === record.id ? 10 : 1,
              position: 'relative' as const,
            },
          })}
          locale={{
            emptyText: !loading && !error ? (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-2">No tickets found</div>
                <div className="text-sm text-gray-400">Try adjusting your JQL query</div>
              </div>
            ) : null,
          }}
        />
      </div>

      {error && !loading && (
        <div className="text-center py-12" role="alert" aria-live="assertive">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" aria-hidden="true" />
          <div className="text-red-600 mb-2">Failed to load tickets</div>
          <div className="text-sm text-gray-500 mb-4">{error}</div>
          <button
            onClick={handleRetryCallback}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label="Retry loading tickets"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};