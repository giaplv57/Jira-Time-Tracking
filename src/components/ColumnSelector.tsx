import React, { useState } from 'react';
import { Settings, Check, Eye, EyeOff } from 'lucide-react';

export interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  required?: boolean;
}

interface ColumnSelectorProps {
  columns: ColumnConfig[];
  onColumnsChange: (columns: ColumnConfig[]) => void;
}

export const ColumnSelector: React.FC<ColumnSelectorProps> = ({ columns, onColumnsChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleColumn = (key: string) => {
    const updatedColumns = columns.map(col => 
      col.key === key ? { ...col, visible: !col.visible } : col
    );
    onColumnsChange(updatedColumns);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Settings className="w-4 h-4" />
        <span className="text-sm">Columns</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-20">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Display Columns</h3>
              <div className="space-y-2">
                {columns.map((column) => (
                  <label
                    key={column.key}
                    className={`flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer ${
                      column.required ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {column.visible ? (
                        <Eye className="w-4 h-4 text-blue-500" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-sm text-gray-700">{column.label}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={column.visible}
                      onChange={() => !column.required && toggleColumn(column.key)}
                      disabled={column.required}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};