// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import DataUploadPage from './pages/DataUploadPage';
import DataParsingPage from './pages/DataParsingPage';
import DataAnalysisPage from './pages/DataAnalysisPage';
import BlockchainLogsPage from './pages/BlockchainLogsPage';
import UserChatPage from './pages/UserChatPage';
import GroupChatPage from './pages/GroupChatPage';
import VotingPage from './pages/VotingPage';
import SupplyChainPage from './pages/SupplyChainPage';
import RecordsPage from './pages/RecordsPage';
import SettingsPage from './pages/SettingsPage';
import HelpPage from './pages/HelpPage';

function App() {
  return (
    <Router>
      <div className="App">
        <div className="container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/data-upload" element={<DataUploadPage />} />
            <Route path="/data-parsing" element={<DataParsingPage />} />
            <Route path="/data-analysis" element={<DataAnalysisPage />} />
            <Route path="/blockchain-logs" element={<BlockchainLogsPage />} />
            <Route path="/user-chat" element={<UserChatPage />} />
            <Route path="/group-chat" element={<GroupChatPage />} />
            <Route path="/voting" element={<VotingPage />} />
            <Route path="/supply-chain" element={<SupplyChainPage />} />
            <Route path="/records" element={<RecordsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/help" element={<HelpPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;