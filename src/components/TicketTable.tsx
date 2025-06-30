import { AlertTriangle, ChevronDown, ChevronUp, Loader2, Square } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useTicketData } from '../hooks/useTicketData';
import { useTicketFiltering } from '../hooks/useTicketFiltering';
import { useTicketSorting } from '../hooks/useTicketSorting';
import { useTicketTimer } from '../hooks/useTicketTimer';
import { JiraCredentials } from '../types/jira';
import { ColumnConfig, ColumnSelector } from './ColumnSelector';
import { TicketRow } from './TicketRow';

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
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { key: 'ticket', label: 'Ticket', visible: true, required: true },
    { key: 'type', label: 'Type', visible: true },
    { key: 'summary', label: 'Summary', visible: true, required: true },
    { key: 'status', label: 'Status', visible: true },
    { key: 'priority', label: 'Priority', visible: true },
    { key: 'assignee', label: 'Assignee', visible: true },
    { key: 'reporter', label: 'Reporter', visible: false },
    { key: 'created', label: 'Created', visible: false },
    { key: 'updated', label: 'Updated', visible: true },
    { key: 'time', label: 'Time', visible: true, required: true },
  ]);

  // Use custom hooks for data management
  const { tickets, loading, error, refetch } = useTicketData(jql, credentials);
  const { filteredTickets } = useTicketFiltering(tickets, filter);

  const {
    selectedTicket,
    timer,
    animatingTicket,
    handleTicketClick,
    toggleTimer,
    formatTime
  } = useTicketTimer(
    onTimerUpdate,
    onShowWorklog,
    onStopTracking,
    isWorklogModalOpen,
    worklogAction,
    pendingTicketSwitch,
    tickets
  );

  const {
    sortColumn,
    sortDirection,
    sortedTickets,
    handleSort
  } = useTicketSorting(filteredTickets, selectedTicket);

  // Memoized event handlers to prevent unnecessary re-renders
  const handleTicketClickCallback = useCallback((ticketId: string) => {
    handleTicketClick(ticketId);
  }, [handleTicketClick]);

  const handleToggleTimerCallback = useCallback(() => {
    toggleTimer();
  }, [toggleTimer]);

  const handleSortCallback = useCallback((columnKey: string) => {
    handleSort(columnKey);
  }, [handleSort]);

  const handleRetryCallback = useCallback(() => {
    refetch();
  }, [refetch]);

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
              aria-label="Stop time tracking"
            >
              <Square className="w-4 h-4" />
              <span className="text-sm">Stop Tracking</span>
            </button>
          )}
          <ColumnSelector columns={columns} onColumnsChange={setColumns} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full" role="table">
          <thead className="bg-gray-50/80">
            <tr>
              {visibleColumns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100/80 transition-colors"
                  onClick={() => handleSortCallback(column.key)}
                  aria-sort={
                    sortColumn === column.key
                      ? sortDirection === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                  aria-label={`Sort by ${column.label}`}
                  role="columnheader"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSortCallback(column.key);
                    }
                  }}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {sortColumn === column.key && (
                      sortDirection === 'asc' ? (
                        <ChevronUp className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="w-4 h-4" aria-hidden="true" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedTickets.map((ticket) => {
              const isSelected = activeTimer?.ticketId === ticket.id;
              const isAnimating = animatingTicket === ticket.id;

              return (
                <TicketRow
                  key={ticket.id}
                  ticket={ticket}
                  isSelected={isSelected}
                  isAnimating={isAnimating}
                  activeTimer={activeTimer}
                  visibleColumns={visibleColumns}
                  onTicketClick={handleTicketClickCallback}
                  onToggleTimer={handleToggleTimerCallback}
                  formatTime={formatTime}
                  isWorklogModalOpen={isWorklogModalOpen}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      {loading && (
        <div className="text-center py-12" role="status" aria-live="polite">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" aria-hidden="true" />
          <div className="text-gray-500 mb-2">Loading tickets...</div>
          <div className="text-sm text-gray-400">Searching Jira with your query</div>
        </div>
      )}

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

      {!loading && !error && sortedTickets.length === 0 && (
        <div className="text-center py-12" role="status">
          <div className="text-gray-500 mb-2">No tickets found</div>
          <div className="text-sm text-gray-400">Try adjusting your search filters or JQL query</div>
        </div>
      )}
    </div>
  );
};