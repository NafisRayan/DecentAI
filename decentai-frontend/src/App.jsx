import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginRegister from './pages/Auth/LoginRegister';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Points from './pages/Points';
import Chat from './pages/Chat';
import Polls from './pages/Polls';
import Profile from './pages/Profile';
import AIChat from './pages/AIChat';
import UserManagement from './pages/admin/UserManagement';
import Statistics from './pages/Statistics';
// import Community from './pages/Community';
import UserSettings from './pages/UserSettings';
import Analytics from './pages/Analytics';

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

          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
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

          <Route path="/statistics" element={
            <ProtectedRoute>
              <Statistics />
            </ProtectedRoute>
          } />

          {/* <Route path="/community" element={
            <ProtectedRoute>
              <Community />
            </ProtectedRoute>
          } /> */}

          <Route path="/user-settings" element={
            <ProtectedRoute>
              <UserSettings />
            </ProtectedRoute>
          } />

          <Route path="/analytics" element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App; 