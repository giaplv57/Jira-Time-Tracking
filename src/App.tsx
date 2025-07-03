import { App as AntApp } from 'antd';
import { MainScreen } from './components/MainScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { useSession } from './hooks/useSession';
import { JiraCredentials } from './types/jira';

function App() {
  const {
    isLoading,
    isAuthenticated,
    credentials,
    lastJQL,
    saveSession,
    logout
  } = useSession();

  const handleCredentialsConfirm = async (creds: JiraCredentials) => {
    await saveSession(creds);
  };

  const handleLogout = () => {
    logout();
  };

  // Show loading spinner while checking for existing session
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <AntApp>
      <div className="min-h-screen">
        {!isAuthenticated || !credentials ? (
          <WelcomeScreen onConfirm={handleCredentialsConfirm} />
        ) : (
          <MainScreen
            credentials={credentials}
            lastJQL={lastJQL}
            onLogout={handleLogout}
          />
        )}
      </div>
    </AntApp>
  );
}

export default App;