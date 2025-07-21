import { Calendar as CalendarIcon, Clock, User, X } from 'lucide-react';
import moment from 'moment';
import React, { useMemo } from 'react';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useWorklogData } from '../hooks/useWorklogData';
import { CalendarWorklogEvent, JiraCredentials, JiraTicket } from '../types/jira';

const localizer = momentLocalizer(moment);

interface WorklogCalendarProps {
    isOpen: boolean;
    onClose: () => void;
    tickets: JiraTicket[];
    credentials: JiraCredentials;
}

interface EventComponentProps {
    event: CalendarWorklogEvent;
}

const EventComponent: React.FC<EventComponentProps> = ({ event }) => {
    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'highest':
            case 'critical':
                return 'bg-red-500';
            case 'high':
                return 'bg-orange-500';
            case 'medium':
            case 'normal':
                return 'bg-blue-500';
            case 'low':
                return 'bg-green-500';
            case 'lowest':
                return 'bg-gray-500';
            default:
                return 'bg-blue-500';
        }
    };

    return (
        <div className={`text-white p-1 rounded text-xs ${getPriorityColor(event.ticket.priority)}`}>
            <div className="flex items-center gap-1">
                <span className="font-medium">{event.ticket.key}</span>
            </div>
            <div className="truncate" title={event.worklog.comment}>
                {event.worklog.comment || event.ticket.summary}
            </div>
            <div className="flex items-center gap-1 text-xs opacity-90">
                <Clock className="w-3 h-3" />
                <span>{event.worklog.timeSpent}</span>
            </div>
        </div>
    );
};

export const WorklogCalendar: React.FC<WorklogCalendarProps> = ({
    isOpen,
    onClose,
    tickets,
    credentials
}) => {
    // Lazy load worklog data only when modal is open
    const { events, loading, error } = useWorklogData(isOpen ? tickets : [], credentials);
    const [currentView, setCurrentView] = React.useState<View>('week');
    const [currentDate, setCurrentDate] = React.useState(new Date());

    const eventStyleGetter = (event: CalendarWorklogEvent) => {
        const getPriorityColor = (priority: string) => {
            switch (priority.toLowerCase()) {
                case 'highest':
                case 'critical':
                    return '#ef4444';
                case 'high':
                    return '#f97316';
                case 'medium':
                case 'normal':
                    return '#3b82f6';
                case 'low':
                    return '#10b981';
                case 'lowest':
                    return '#6b7280';
                default:
                    return '#3b82f6';
            }
        };

        return {
            style: {
                backgroundColor: getPriorityColor(event.ticket.priority),
                borderRadius: '4px',
                opacity: 0.9,
                color: 'white',
                border: '0px',
                display: 'block'
            }
        };
    };

    const handleSelectEvent = (event: CalendarWorklogEvent) => {
        // Show event details in a tooltip or modal
        const message = `
Ticket: ${event.ticket.key} - ${event.ticket.summary}
Author: ${event.worklog.author.displayName}
Time Spent: ${event.worklog.timeSpent}
Started: ${moment(event.start).format('MMMM Do YYYY, h:mm A')}
Comment: ${event.worklog.comment || 'No comment'}
Priority: ${event.ticket.priority}
Status: ${event.ticket.status}
    `.trim();

        alert(message);
    };

    const calendarComponents = useMemo(() => ({
        event: EventComponent
    }), []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <CalendarIcon className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-900">Worklog Calendar</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 overflow-hidden">
                    {loading && (
                        <div className="flex items-center justify-center h-full">
                            <div className="flex items-center gap-3">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <span className="text-gray-600">Loading worklogs...</span>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="text-red-600 mb-2">❌ Error loading worklogs</div>
                                <div className="text-gray-600 text-sm">{error}</div>
                            </div>
                        </div>
                    )}

                    {!loading && !error && (
                        <div className="h-full">
                            {events.length === 0 ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center text-gray-500">
                                        <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p className="text-lg font-medium">No worklogs found</p>
                                        <p className="text-sm">Try selecting different tickets or check your Jira connection</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Calendar Stats */}
                                    <div className="mb-4 flex items-center gap-6 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            <span>{events.length} worklog entries</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            <span>
                                                {new Set(events.map((e: CalendarWorklogEvent) => e.worklog.author.displayName)).size} contributors
                                            </span>
                                        </div>
                                    </div>

                                    {/* Calendar */}
                                    <div className="h-full">
                                        <Calendar
                                            localizer={localizer}
                                            events={events}
                                            startAccessor="start"
                                            endAccessor="end"
                                            style={{ height: '100%' }}
                                            view={currentView}
                                            onView={setCurrentView}
                                            date={currentDate}
                                            onNavigate={setCurrentDate}
                                            eventPropGetter={eventStyleGetter}
                                            components={calendarComponents}
                                            onSelectEvent={handleSelectEvent}
                                            views={['month', 'week', 'day']}
                                            defaultView="week"
                                            step={15}
                                            timeslots={4}
                                            min={new Date(0, 0, 0, 7, 0, 0)} // 7 AM
                                            max={new Date(0, 0, 0, 22, 0, 0)} // 10 PM
                                            dayLayoutAlgorithm="no-overlap"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};