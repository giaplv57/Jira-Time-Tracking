import React from 'react';
import { useCreateTicketData } from '../../hooks/useCreateTicketData';
import { CreateTicketForm } from './CreateTicketForm';
import { CreateTicketModalHeader } from './CreateTicketModalHeader';

interface CreateTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (ticketData: CreateTicketData) => void;
    defaultProject?: string;
}

export interface CreateTicketData {
    summary: string;
    description: string;
    issueType: string;
    reporter?: string;
    assignee?: string;
    priority?: string;
    components?: string[];
    sprint?: string;
    project: string;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    defaultProject = 'WQLEGEND'
}) => {
    const ticketData = useCreateTicketData(isOpen, defaultProject);

    const handleClose = () => {
        ticketData.resetData();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleClose}></div>

                <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                    <CreateTicketModalHeader onClose={handleClose} />
                    <CreateTicketForm
                        ticketData={ticketData}
                        onSubmit={onSubmit}
                        onClose={handleClose}
                    />
                </div>
            </div>
        </div>
    );
};