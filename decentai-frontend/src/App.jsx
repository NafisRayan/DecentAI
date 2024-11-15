import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

function App() {
  // In a real app, this would come from authentication
  const isAdmin = true; 

  return (
    <BrowserRouter>
      <Layout isAdmin={isAdmin}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/points" element={<Points />} />
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
      </Layout>
    </BrowserRouter>
  );
}

export default App; 