import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginRegister from './pages/Auth/LoginRegister';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Points from './pages/Points';
import Chat from './pages/Chat';
import Polls from './pages/Polls';
import AIChat from './pages/AIChat';
import UserManagement from './pages/admin/UserManagement';
import DataAnalytics from './pages/DataAnalytics';
import UserSettings from './pages/UserSettings';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<LoginRegister />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/points" element={
            <ProtectedRoute>
              <Points />
            </ProtectedRoute>
          } />

          <Route path="/chat" element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } />

          <Route path="/polls" element={
            <ProtectedRoute>
              <Polls />
            </ProtectedRoute>
          } />

          <Route path="/ai-chat" element={
            <ProtectedRoute>
              <AIChat />
            </ProtectedRoute>
          } />

          <Route path="/user-management" element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          } />

          <Route path="/data-analytics" element={
            <ProtectedRoute>
              <DataAnalytics />
            </ProtectedRoute>
          } />

          <Route path="/user-settings" element={
            <ProtectedRoute>
              <UserSettings />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App; 