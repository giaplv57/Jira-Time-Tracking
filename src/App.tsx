import React, { useState } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { MainScreen } from './components/MainScreen';
import { JiraCredentials } from './types/jira';

function App() {
  const [credentials, setCredentials] = useState<JiraCredentials | null>(null);

  const handleCredentialsConfirm = (creds: JiraCredentials) => {
    setCredentials(creds);
  };

  const handleResetToken = () => {
    setCredentials(null);
  };

  return (
    <div className="min-h-screen">
      {!credentials ? (
        <WelcomeScreen onConfirm={handleCredentialsConfirm} />
      ) : (
        <MainScreen 
          credentials={credentials} 
          onResetToken={handleResetToken} 
        />
      )}
    </div>
  );
}

export default App;