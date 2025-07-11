import { Code, Search, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface JQLModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (JQL: string) => void;
  currentJQL: string;
}

export const JQLModal: React.FC<JQLModalProps> = ({ isOpen, onClose, onSubmit, currentJQL }) => {
  const [JQL, setJQL] = useState(currentJQL);

  useEffect(() => {
    setJQL(currentJQL);
  }, [currentJQL]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (JQL.trim()) {
      onSubmit(JQL.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const quickFilters = [
    { label: 'My Open Issues', jql: 'assignee = currentUser() AND status != Done' },
    { label: 'Recently Updated', jql: 'updated >= -7d ORDER BY updated DESC' },
    { label: 'High Priority', jql: 'priority = High AND status != Done' },
    { label: 'In Progress', jql: 'status = "In Progress"' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Enter JQL Query</h3>
                <p className="text-sm text-gray-500">Search for Jira tickets using JQL syntax</p>
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
                JQL Query
              </label>
              <textarea
                value={JQL}
                onChange={(e) => setJQL(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                rows={4}
                placeholder="e.g., assignee = currentUser() AND status != Done"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Quick Filters
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickFilters.map((filter, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setJQL(filter.jql)}
                    className="p-3 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
                  >
                    <div className="font-medium text-sm text-gray-900">{filter.label}</div>
                    <div className="text-xs text-gray-500 mt-1 font-mono">{filter.jql}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!JQL.trim()}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Search className="w-4 h-4 mr-2" />
                Search Tickets
              </button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-800">
              <strong>JQL Tips:</strong> Use <code className="bg-blue-100 px-1 rounded">assignee = currentUser()</code> for your tickets,
              <code className="bg-blue-100 px-1 rounded ml-1">status != Done</code> for open items, and
              <code className="bg-blue-100 px-1 rounded ml-1">priority = High</code> for priority filtering.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};