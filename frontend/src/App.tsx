import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import { AppRoutes } from './routes/AppRoutes';
import Chatbot from './components/chatbot/Chatbot';

const AppContent: React.FC = () => {
  const { isCitizen, isLoading } = useAuth();

  return (
    <>
      <AppRoutes />

      {/* Chatbot only for logged-in Citizen users */}
      {!isLoading && isCitizen && <Chatbot />}
    </>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;