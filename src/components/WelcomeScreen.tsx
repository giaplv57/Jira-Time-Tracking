import { AlertCircle, CheckCircle, ChevronRight, Globe, Key, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { jiraApi } from '../services/jiraApi';
import { JiraCredentials } from '../types/jira';

interface WelcomeScreenProps {
  onConfirm: (credentials: JiraCredentials) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onConfirm }) => {
  const [token, setToken] = useState('');
  const [endpoint, setEndpoint] = useState('https://jira.worldquant.com');
  const [errors, setErrors] = useState<{ token?: string; endpoint?: string }>({});
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const validateForm = () => {
    const newErrors: { token?: string; endpoint?: string } = {};

    if (!token.trim()) {
      newErrors.token = 'Personal Access Token is required';
    }

    if (!endpoint.trim()) {
      newErrors.endpoint = 'Jira Endpoint is required';
    } else if (!endpoint.includes('.atlassian.net') && !endpoint.startsWith('http')) {
      newErrors.endpoint = 'Please provide a valid Jira endpoint';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = async () => {
    if (!validateForm()) return;

    setIsConnecting(true);
    setConnectionStatus('idle');

    try {
      // Test the connection first
      const credentials = { token, endpoint };
      jiraApi.setCredentials(credentials);

      const isConnected = await jiraApi.testConnection();

      if (isConnected) {
        setConnectionStatus('success');
        // Small delay to show success state
        setTimeout(() => {
          onConfirm(credentials);
        }, 1000);
      } else {
        setConnectionStatus('error');
        setErrors({
          token: 'Failed to connect to Jira. Please check your credentials and endpoint.'
        });
      }
    } catch (error) {
      setConnectionStatus('error');
      setErrors({
        token: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Jira Time Tracker</h1>
            <p className="text-gray-600">Connect to your Jira workspace to get started</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Key className="w-4 h-4 inline mr-2" />
                Personal Access Token
              </label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.token ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                placeholder="Enter your Jira PAT"
              />
              {errors.token && (
                <p className="text-red-500 text-sm mt-1">{errors.token}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="w-4 h-4 inline mr-2" />
                Jira Endpoint
              </label>
              <input
                type="url"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.endpoint ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                placeholder="https://yourcompany.atlassian.net"
              />
              {errors.endpoint && (
                <p className="text-red-500 text-sm mt-1">{errors.endpoint}</p>
              )}
            </div>

            <button
              onClick={handleConfirm}
              disabled={isConnecting}
              className={`w-full py-3 px-6 rounded-xl font-medium focus:ring-4 transition-all duration-200 flex items-center justify-center group ${connectionStatus === 'success'
                ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-200'
                : connectionStatus === 'error'
                  ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-200'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-200'
                } ${isConnecting ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Testing Connection...
                </>
              ) : connectionStatus === 'success' ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Connected Successfully!
                </>
              ) : connectionStatus === 'error' ? (
                <>
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Connection Failed - Retry
                </>
              ) : (
                <>
                  Connect to Jira
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-800">
              <strong>Need help?</strong> Generate a Personal Access Token from your Jira account settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};