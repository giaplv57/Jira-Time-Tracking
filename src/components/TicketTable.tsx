import type { TableColumnsType } from 'antd';
import { Table } from 'antd';
import { AlertTriangle, Calendar, Maximize2, Minimize2, User } from 'lucide-react';
import React, { useCallback, useMemo } from 'react';
import { useTicketData } from '../hooks/useTicketData';
import { JiraCredentials, JiraTicket } from '../types/jira';
import { getPriorityColor, getPriorityIcon, getStatusColor, getTypeIcon } from '../utils/ticketHelpers';
import { ColumnConfig, ColumnSelector } from './ColumnSelector';
import { CompactTimerWidget } from './CompactTimerWidget';

interface TicketTableProps {
  jql: string;
  credentials: JiraCredentials;
  onTimerUpdate: (ticketId: string, ticketKey: string, elapsedTime: number) => void;
  onToggleTimer: () => void;
  onShowWorklog: (newTicketId: string) => void;
  onStopTracking: () => void;
  activeTimer: { ticketId: string; ticketKey: string; elapsedTime: number; startTime: number; isRunning: boolean } | null;
  isWorklogModalOpen: boolean;
  columnSettings: ColumnConfig[];
  onColumnSettingsChange: (columnSettings: ColumnConfig[]) => void;
  zenMode: boolean;
  onZenModeToggle: () => void;
}

export const TicketTable: React.FC<TicketTableProps> = ({
  jql,
  credentials,
  onTimerUpdate: _onTimerUpdate,
  onToggleTimer,
  onShowWorklog,
  onStopTracking,
  activeTimer,
  isWorklogModalOpen,
  columnSettings,
  onColumnSettingsChange,
  zenMode,
  onZenModeToggle
}) => {
  // Use custom hooks for data management
  const { tickets, loading, error, refetch } = useTicketData(jql, credentials);

  // Timer logic is now handled in MainScreen
  const selectedTicket = activeTimer?.ticketId || null;

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
  const handleTicketClick = useCallback((ticketId: string) => {
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

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);


  const visibleColumns = columnSettings.filter(col => col.visible);

  // Define Ant Design Table columns with responsive widths
  const columns: TableColumnsType<JiraTicket> = useMemo(() => {
    const totalColumns = visibleColumns.length;

    // Calculate responsive widths based on column importance
    const getColumnWidth = (columnKey: string): string => {
      switch (columnKey) {
        case 'summary': return '40%'; // Priority space for Summary
        case 'ticket': return '15%';
        case 'type': return '10%';
        case 'status': return '10%';
        case 'priority': return '10%';
        case 'assignee': return '15%';
        case 'reporter': return '15%';
        case 'created': return '10%';
        case 'updated': return '10%';
        default: return `${Math.floor(100 / totalColumns)}%`;
      }
    };

    return visibleColumns.map((column) => {
      const baseColumn = {
        key: column.key,
        title: column.label,
        dataIndex: column.key,
        width: getColumnWidth(column.key),
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
              <a
                href={`${credentials.endpoint}/browse/${key}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline truncate transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {key}
              </a>
            ),
          };

        case 'type':
          return {
            ...baseColumn,
            dataIndex: 'type',
            render: (type: string) => (
              <div className="flex items-center space-x-1">
                {getTypeIcon(type)}
                <span className="text-sm font-semibold text-gray-900 capitalize truncate">{type}</span>
              </div>
            ),
          };

        case 'summary':
          return {
            ...baseColumn,
            dataIndex: 'summary',
            render: (summary: string) => (
              <div className="text-sm font-semibold text-gray-900 truncate" title={summary}>
                {summary}
              </div>
            ),
            ellipsis: {
              showTitle: false,
            },
          };

        case 'status':
          return {
            ...baseColumn,
            dataIndex: 'status',
            render: (status: string) => (
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full truncate ${getStatusColor(status)}`}>
                {status}
              </span>
            ),
          };

        case 'priority':
          return {
            ...baseColumn,
            dataIndex: 'priority',
            render: (priority: string) => (
              <div className="flex items-center space-x-1">
                <span className={getPriorityColor(priority)}>
                  {getPriorityIcon(priority)}
                </span>
                <span className={`text-sm font-semibold truncate ${getPriorityColor(priority)}`}>
                  {priority}
                </span>
              </div>
            ),
          };

        case 'assignee':
          return {
            ...baseColumn,
            dataIndex: 'assignee',
            render: (assignee: string) => (
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-3 h-3 text-gray-600" />
                </div>
                <div className="text-sm font-semibold text-gray-900 truncate" title={assignee}>
                  {assignee}
                </div>
              </div>
            ),
          };

        case 'reporter':
          return {
            ...baseColumn,
            dataIndex: 'reporter',
            render: (reporter: string) => (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-2.5 h-2.5 text-gray-500" />
                </div>
                <div className="text-sm text-gray-700 truncate" title={reporter}>
                  {reporter}
                </div>
              </div>
            ),
          };

        case 'created':
          return {
            ...baseColumn,
            dataIndex: 'created',
            render: (created: string) => (
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-gray-400 flex-shrink-0" />
                <div className="text-sm text-gray-700 truncate">
                  {new Date(created).toLocaleDateString()}
                </div>
              </div>
            ),
          };

        case 'updated':
          return {
            ...baseColumn,
            dataIndex: 'updated',
            render: (updated: string) => (
              <div className="text-xs text-gray-500 truncate" title={`Updated ${new Date(updated).toLocaleDateString()}`}>
                {new Date(updated).toLocaleDateString()}
              </div>
            ),
          };

        default:
          return baseColumn;
      }
    });
  }, [visibleColumns, getPriorityValue]);

  // Handle row click
  const handleRowClick = (record: JiraTicket) => {
    handleTicketClick(record.id);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Tickets ({sortedTickets.length})</h3>
        <div className="flex items-center space-x-3">
          <CompactTimerWidget
            activeTimer={activeTimer}
            onToggleTimer={onToggleTimer}
            onStopTracking={onStopTracking}
            isWorklogModalOpen={isWorklogModalOpen}
          />
          <button
            onClick={onZenModeToggle}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title={zenMode ? "Exit Zen Mode" : "Enter Zen Mode"}
          >
            {zenMode ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
            <span className="text-sm">{zenMode ? "Exit Zen" : "Zen Mode"}</span>
          </button>
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
          size="middle"
          tableLayout="fixed"
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
            onClick={handleRetry}
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