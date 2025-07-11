import { Alert, Popover, Select, Skeleton } from 'antd';
import { AlertCircle, ChevronDown } from 'lucide-react';
import React, { useState } from 'react';

export interface OptionType {
    value: string;
    label: string;
    icon?: string;
}

interface TagFieldProps {
    icon: React.ReactNode;
    label: string;
    value?: string | string[];
    placeholder: string;
    options: OptionType[];
    mode?: 'single' | 'multiple';
    loading?: boolean;
    error?: string;
    onChange: (value: string | string[]) => void;
}

export const TagField: React.FC<TagFieldProps> = ({
    icon,
    label,
    value,
    placeholder,
    options,
    mode = 'single',
    loading = false,
    error,
    onChange
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasValue = mode === 'multiple' ? value && value.length > 0 : value;

    const displayValue = () => {
        if (loading) return 'Loading...';
        if (error) return 'Error loading data';
        if (!hasValue) return placeholder;

        if (mode === 'multiple' && Array.isArray(value)) {
            return value.length === 1
                ? options.find(opt => opt.value === value[0])?.label || value[0]
                : `${value.length} selected`;
        }

        if (typeof value === 'string') {
            const option = options.find(opt => opt.value === value);
            return option ? `${option.icon || ''} ${option.label}`.trim() : value;
        }

        return placeholder;
    };

    const selectContent = loading ? (
        <div className="w-48 p-2">
            <Skeleton active paragraph={{ rows: 3 }} />
        </div>
    ) : error ? (
        <div className="w-48 p-2">
            <Alert
                message="Loading Error"
                description={error}
                type="error"
                showIcon
            />
        </div>
    ) : (
        <Select
            value={value}
            onChange={(newValue) => {
                onChange(newValue);
                if (mode !== 'multiple') {
                    setIsOpen(false);
                }
            }}
            placeholder={placeholder}
            mode={mode === 'multiple' ? 'multiple' : undefined}
            className="w-48"
            showSearch
            filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={options.map(opt => ({
                value: opt.value,
                label: opt.icon ? `${opt.icon} ${opt.label}` : opt.label
            }))}
        />
    );

    return (
        <Popover
            content={selectContent}
            trigger="click"
            open={isOpen}
            onOpenChange={setIsOpen}
            placement="bottomLeft"
        >
            <div
                className={`
          flex items-center space-x-2 px-3 py-2 rounded-lg border cursor-pointer transition-all
          ${hasValue
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : error
                            ? 'bg-red-50 border-red-200 text-red-600'
                            : loading
                                ? 'bg-gray-50 border-gray-200 text-gray-400'
                                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }
        `}
            >
                <div className="text-gray-500">{icon}</div>
                <span className="text-sm font-medium">{label}:</span>
                <span className="text-sm flex-1">{displayValue()}</span>
                {error && <AlertCircle className="w-4 h-4 text-red-500" />}
                <ChevronDown
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </div>
        </Popover>
    );
};