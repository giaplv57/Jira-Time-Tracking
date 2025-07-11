import { Button } from 'antd';
import { FileText, X } from 'lucide-react';
import React from 'react';

interface CreateTicketModalHeaderProps {
    onClose: () => void;
}

export const CreateTicketModalHeader: React.FC<CreateTicketModalHeaderProps> = ({
    onClose
}) => {
    return (
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Create New Ticket</h3>
                    <p className="text-sm text-gray-500">Add a new ticket to your project</p>
                </div>
            </div>
            <Button
                type="text"
                icon={<X className="w-4 h-4" />}
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
            />
        </div>
    );
};