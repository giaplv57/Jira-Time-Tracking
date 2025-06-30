import { CheckCircle, X, XCircle } from 'lucide-react';
import React, { useEffect } from 'react';

interface ToastProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
    duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 4000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [onClose, duration]);

    return (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
            <div className={`
        flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg max-w-md
        ${type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }
      `}>
                {type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}

                <span className="text-sm font-medium flex-1">{message}</span>

                <button
                    onClick={onClose}
                    className={`
            p-1 rounded-full hover:bg-opacity-20 transition-colors
            ${type === 'success' ? 'hover:bg-green-600' : 'hover:bg-red-600'}
          `}
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};