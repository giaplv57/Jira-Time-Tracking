import { AlertCircle, ArrowDown, ArrowUp, CheckCircle, Clock, Equal, FileText, Flag, Plus, Star } from 'lucide-react';

export const getStatusColor = (status: string): string => {
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
        default: return 'bg-gray-100 text-gray-700';
    }
};

export const getPriorityColor = (priority: string): string => {
    switch (priority.toLowerCase()) {
        case 'critical': return 'text-red-600';
        case 'high': return 'text-red-500';
        case 'medium': return 'text-blue-400';
        case 'normal': return 'text-orange-400';
        case 'low': return 'text-blue-500';
        default: return 'text-gray-500';
    }
};

export const getPriorityIcon = (priority: string): JSX.Element => {
    switch (priority.toLowerCase()) {
        case 'critical': return <AlertCircle className="w-4 h-4" />;
        case 'high': return <ArrowUp className="w-4 h-4" />;
        case 'medium': return <Clock className="w-4 h-4" />;
        case 'normal': return <Equal className="w-4 h-4" />;
        case 'low': return <ArrowDown className="w-4 h-4" />;
        default: return <Clock className="w-4 h-4" />;
    }
};

export const getTypeIcon = (type: string): JSX.Element => {
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