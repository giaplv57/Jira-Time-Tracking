import { Badge, Button, Space, Typography } from 'antd';
import { Pause, Play, Square } from 'lucide-react';
import React from 'react';

const { Text } = Typography;

interface CompactTimerWidgetProps {
    activeTimer: {
        ticketId: string;
        ticketKey: string;
        elapsedTime: number;
        startTime: number;
        isRunning: boolean;
    } | null;
    onToggleTimer: () => void;
    onStopTracking: () => void;
    isWorklogModalOpen: boolean;
}

export const CompactTimerWidget: React.FC<CompactTimerWidgetProps> = ({
    activeTimer,
    onToggleTimer,
    onStopTracking,
    isWorklogModalOpen
}) => {
    const formatTime = (milliseconds: number) => {
        const seconds = Math.floor(milliseconds / 1000) % 60;
        const minutes = Math.floor(milliseconds / (1000 * 60)) % 60;
        const hours = Math.floor(milliseconds / (1000 * 60 * 60));
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    if (!activeTimer) {
        return (
            <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-gray-50 border border-gray-200">
                <Badge status="default" />
                <Text type="secondary" className="text-sm">
                    No active timer
                </Text>
            </div>
        );
    }

    const isRunning = activeTimer.isRunning;

    return (
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg border ${isRunning
            ? 'bg-blue-50 border-blue-200'
            : 'bg-gray-50 border-gray-200'
            }`}>
            <Badge
                status={isRunning ? "processing" : "default"}
                className="flex-shrink-0"
            />

            <Text
                strong
                className={`text-sm ${isRunning ? 'text-blue-700' : 'text-gray-700'}`}
            >
                {activeTimer.ticketKey}
            </Text>

            <Text
                className={`font-mono text-sm font-semibold ${isRunning ? 'text-blue-800' : 'text-gray-600'
                    }`}
            >
                {formatTime(activeTimer.elapsedTime)}
            </Text>

            <Space size={4}>
                <Button
                    type="text"
                    size="small"
                    icon={isRunning ? <Pause className="w-4 h-4" strokeWidth={1.5} /> : <Play className="w-4 h-4" strokeWidth={1.5} />}
                    onClick={onToggleTimer}
                    disabled={isWorklogModalOpen}
                    className={`flex items-center justify-center p-1 ${isRunning
                        ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-100'
                        : 'text-gray-600 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                    title={isRunning ? "Pause timer" : "Resume timer"}
                />
                <Button
                    type="text"
                    size="small"
                    icon={<Square className="w-4 h-4" strokeWidth={1.5} />}
                    onClick={onStopTracking}
                    disabled={isWorklogModalOpen}
                    className="flex items-center justify-center p-1 text-green-600 hover:text-green-700 hover:bg-green-100"
                    title="Log work time"
                />
            </Space>
        </div>
    );
};