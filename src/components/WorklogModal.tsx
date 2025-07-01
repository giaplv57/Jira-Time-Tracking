import { Calendar, Clock, FileText, Trash2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface WorklogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDropWork: () => void;
  onSubmit: (worklog: WorklogData) => void;
  ticketKey: string;
  elapsedTime: number;
}

export interface WorklogData {
  timeSpent: string;
  dateStarted: string;
  description: string;
}

export const WorklogModal: React.FC<WorklogModalProps> = ({
  isOpen,
  onClose,
  onDropWork,
  onSubmit,
  ticketKey,
  elapsedTime
}) => {
  const [timeSpent, setTimeSpent] = useState('');
  const [dateStarted, setDateStarted] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Auto-fill time spent based on elapsed time (only when modal opens)
      const hours = Math.floor(elapsedTime / (1000 * 60 * 60));
      const minutes = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        setTimeSpent(`${hours}h ${minutes}m`);
      } else {
        setTimeSpent(`${minutes}m`);
      }

      // Calculate date started as current time minus elapsed time
      const now = new Date();
      const startTime = new Date(now.getTime() - elapsedTime);
      const dateString = startTime.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
      setDateStarted(dateString);

      // Clear description
      setDescription('');
    }
  }, [isOpen]); // Removed elapsedTime from dependencies to prevent resetting user input

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (timeSpent.trim() && dateStarted && description.trim()) {
      onSubmit({
        timeSpent: timeSpent.trim(),
        dateStarted,
        description: description.trim()
      });
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Log Work</h3>
                <p className="text-sm text-gray-500">Log time for {ticketKey}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Time Spent
              </label>
              <input
                type="text"
                value={timeSpent}
                onChange={(e) => setTimeSpent(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="e.g., 2h 30m, 1.5h, 90m"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Examples: 2h 30m, 1.5h, 90m, 1d 4h
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date Started
              </label>
              <input
                type="datetime-local"
                value={dateStarted}
                onChange={(e) => setDateStarted(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                rows={3}
                placeholder="Describe what you worked on..."
                required
              />
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onDropWork}
                className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center space-x-2 border border-red-200"
              >
                <Trash2 className="w-4 h-4" />
                <span>Drop Work</span>
              </button>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!timeSpent.trim() || !dateStarted || !description.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 focus:ring-4 focus:ring-green-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Log Work
                </button>
              </div>
            </div>
          </form>

          <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-100">
            <p className="text-sm text-green-800">
              <strong>Time Format:</strong> Use formats like "2h 30m", "1.5h", "90m", or "1d 4h" for time entries.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};