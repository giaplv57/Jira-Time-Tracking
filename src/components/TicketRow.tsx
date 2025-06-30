import { AlertCircle, Calendar, CheckCircle, Clock, Flag, Pause, User } from 'lucide-react';
import React from 'react';
import { JiraTicket } from '../types/jira';
import { ColumnConfig } from './ColumnSelector';

interface TicketRowProps {
    ticket: JiraTicket;
    isSelected: boolean;
    isAnimating: boolean;
    activeTimer: { ticketId: string; ticketKey: string; elapsedTime: number } | null;
    visibleColumns: ColumnConfig[];
    onTicketClick: (ticketId: string) => void;
    onToggleTimer: () => void;
    formatTime: (milliseconds: number) => string;
    isWorklogModalOpen: boolean;
}

export const TicketRow: React.FC<TicketRowProps> = ({
    ticket,
    isSelected,
    isAnimating,
    activeTimer,
    visibleColumns,
    onTicketClick,
    onToggleTimer,
    formatTime,
    isWorklogModalOpen
}) => {
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
            case 'normal': return 'text-yellow-600';
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

    const handleRowClick = () => {
        onTicketClick(ticket.id);
    };

    const handleTimerToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleTimer();
    };

    return (
        <tr
            onClick={handleRowClick}
            className={`cursor-pointer transition-all duration-500 ease-in-out hover:bg-blue-50 ${isSelected
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500 shadow-lg transform scale-[1.01]'
                    : 'hover:shadow-md'
                } ${isAnimating ? 'animate-pulse bg-blue-100' : ''}`}
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
                                <div className="text-sm font-medium text-gray-900">{ticket.key}</div>
                            </td>
                        );
                    case 'type':
                        return (
                            <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                    {getTypeIcon(ticket.type)}
                                    <span className="text-sm text-gray-900 capitalize">{ticket.type}</span>
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
                                            onClick={handleTimerToggle}
                                            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                                            disabled={isWorklogModalOpen}
                                            aria-label="Pause timer"
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
};