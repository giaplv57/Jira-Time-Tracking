import { AlertCircle, ArrowDown, ArrowUp, Calendar, CheckCircle, Clock, Equal, FileText, Flag, Pause, Play, Plus, Star, User } from 'lucide-react';
import React from 'react';
import { JiraTicket } from '../types/jira';
import { ColumnConfig } from './ColumnSelector';

interface TicketRowProps {
    ticket: JiraTicket;
    isSelected: boolean;
    activeTimer: { ticketId: string; ticketKey: string; elapsedTime: number; startTime: number; isRunning: boolean } | null;
    visibleColumns: ColumnConfig[];
    onTicketClick: (ticketId: string) => void;
    onToggleTimer: () => void;
    formatTime: (milliseconds: number) => string;
    isWorklogModalOpen: boolean;
    isTimerRunning: boolean;
}

export const TicketRow: React.FC<TicketRowProps> = ({
    ticket,
    isSelected,
    activeTimer,
    visibleColumns,
    onTicketClick,
    onToggleTimer,
    formatTime,
    isWorklogModalOpen,
    isTimerRunning
}) => {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'open': return 'bg-gray-100 text-gray-700';
            case 'on hold': return 'bg-blue-100 text-blue-700';
            case 'dropped': return 'bg-teal-100 text-teal-700';
            case 'to do': return 'bg-gray-100 text-gray-800';
            case 'deployed': return 'bg-teal-100 text-teal-700';
            case 'merged': return 'bg-green-100 text-green-700';
            case 'merging': return 'bg-blue-100 text-blue-600';
            case 'resolved': return 'bg-green-100 text-green-800';
            case 'closed': return 'bg-green-100 text-green-800';
            case 'in progress': return 'bg-blue-100 text-blue-800';
            case 'ready': return 'bg-teal-100 text-teal-800';
            case 'create todo': return 'bg-gray-100 text-gray-800';
            // Fallback for any other statuses
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'critical': return 'text-red-500';
            case 'high': return 'text-red-400';
            case 'medium': return 'text-blue-400';
            case 'normal': return 'text-orange-400';
            case 'low': return 'text-blue-500';
            default: return 'text-gray-500';
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'critical': return <AlertCircle className="w-4 h-4" />;
            case 'high': return <ArrowUp className="w-4 h-4" />;
            case 'medium': return <Clock className="w-4 h-4" />;
            case 'normal': return <Equal className="w-4 h-4" />;
            case 'low': return <ArrowDown className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'task': return <CheckCircle className="w-4 h-4 text-blue-500" />;
            case 'improvement': return <ArrowUp className="w-4 h-4 text-orange-500" />;
            case 'new feature': return <Plus className="w-4 h-4 text-green-600" />;
            case 'bug': return <AlertCircle className="w-4 h-4 text-red-500" />;
            case 'initiative': return <Star className="w-4 h-4 text-orange-600" />;
            case 'epic': return <Flag className="w-4 h-4 text-purple-600" />;
            case 'request': return <FileText className="w-4 h-4 text-purple-500" />;
            default: return <CheckCircle className="w-4 h-4 text-blue-500" />;
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
                            <td key={column.key} className="px-6 py-3 whitespace-nowrap">
                                <div className="text-sm font-semibold text-gray-900">{ticket.key}</div>
                            </td>
                        );
                    case 'type':
                        return (
                            <td key={column.key} className="px-6 py-3 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                    {getTypeIcon(ticket.type)}
                                    <span className="text-sm font-semibold text-gray-900 capitalize">{ticket.type}</span>
                                </div>
                            </td>
                        );
                    case 'summary':
                        return (
                            <td key={column.key} className="px-6 py-3">
                                <div className="text-sm font-semibold text-gray-900 max-w-md truncate">
                                    {ticket.summary}
                                </div>
                            </td>
                        );
                    case 'status':
                        return (
                            <td key={column.key} className="px-6 py-3 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                                    {ticket.status}
                                </span>
                            </td>
                        );
                    case 'priority':
                        return (
                            <td key={column.key} className="px-6 py-3 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                    <span className={getPriorityColor(ticket.priority)}>
                                        {getPriorityIcon(ticket.priority)}
                                    </span>
                                    <span className={`text-sm font-semibold ${getPriorityColor(ticket.priority)}`}>
                                        {ticket.priority}
                                    </span>
                                </div>
                            </td>
                        );
                    case 'assignee':
                        return (
                            <td key={column.key} className="px-6 py-3 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                        <User className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <div className="ml-3">
                                        <div className="text-sm font-semibold text-gray-900">{ticket.assignee}</div>
                                    </div>
                                </div>
                            </td>
                        );
                    case 'reporter':
                        return (
                            <td key={column.key} className="px-6 py-3 whitespace-nowrap">
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
                            <td key={column.key} className="px-6 py-3 whitespace-nowrap">
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
                            <td key={column.key} className="px-6 py-3 whitespace-nowrap">
                                <div className="text-xs text-gray-500">
                                    Updated {new Date(ticket.updated).toLocaleDateString()}
                                </div>
                            </td>
                        );
                    case 'time':
                        return (
                            <td key={column.key} className="px-6 py-3 whitespace-nowrap">
                                {isSelected && activeTimer ? (
                                    <div className="flex items-center space-x-3">
                                        <div className={`px-3 py-1 rounded-lg ${isTimerRunning ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                            <span className={`font-mono text-sm font-semibold ${isTimerRunning ? 'text-blue-800' : 'text-gray-500'}`}>
                                                {formatTime(activeTimer.elapsedTime)}
                                            </span>
                                        </div>
                                        <button
                                            onClick={handleTimerToggle}
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