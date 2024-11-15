import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginRegister from './pages/Auth/LoginRegister';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Points from './pages/Points';
import Chat from './pages/Chat';
import Polls from './pages/Polls';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import Settings from './pages/admin/Settings';
import AIChat from './pages/AIChat';
import DataAnalysis from './pages/admin/DataAnalysis';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<LoginRegister />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/points" element={
            <ProtectedRoute>
              <Layout>
                <Points />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/chat" element={<Chat />} />
          <Route path="/polls" element={<Polls />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/ai-chat" element={<AIChat />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/settings" element={<Settings />} />
          <Route path="/admin/analysis" element={<DataAnalysis />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App; 