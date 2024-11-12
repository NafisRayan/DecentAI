// src/pages/BlockchainLogsPage.js
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { FiClock, FiHash, FiCheckCircle, FiFilter, FiDownload } from 'react-icons/fi';

const LogEntry = ({ timestamp, hash, event, status, details }) => (
  <div className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
    <div className="flex justify-between items-start mb-3">
      <div className="flex items-center space-x-2">
        <FiClock className="text-gray-400" />
        <span className="text-gray-300 text-sm">{timestamp}</span>
      </div>
      <span className={`px-2 py-1 rounded-full text-xs ${
        status === 'verified' ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
      }`}>
        {status}
      </span>
    </div>
    <div className="flex items-center space-x-2 mb-2">
      <FiHash className="text-blue-400" />
      <span className="text-gray-300 text-sm font-mono">{hash}</span>
    </div>
    <h3 className="text-white font-semibold mb-2">{event}</h3>
    <p className="text-gray-400 text-sm">{details}</p>
  </div>
);

const BlockchainLogsPage = () => {
  const [timeFilter, setTimeFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');

  const mockLogs = [
    {
      timestamp: '2024-03-15 14:30:22',
      hash: '0x7f4b622e6f4b622e6f4b622e6f4b622e',
      event: 'Data Analysis Completed',
      status: 'verified',
      details: 'Medical records analysis batch #1234 completed and verified on chain'
    },
    {
      timestamp: '2024-03-15 13:15:45',
      hash: '0x8a3c711d8a3c711d8a3c711d8a3c711d',
      event: 'New Record Added',
      status: 'pending',
      details: 'New medical record added to blockchain, pending verification'
    }
    // Add more mock logs as needed
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 animate-fade-in">
            Welcome to DecentAI
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Your decentralized AI platform for secure data analysis and collaboration
          </p>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="flex items-center space-x-2">
              <FiFilter className="text-gray-400" />
              <span className="text-gray-300">Filter by:</span>
            </div>
            <select 
              className="bg-gray-700 text-white rounded-lg px-4 py-2"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <select
              className="bg-gray-700 text-white rounded-lg px-4 py-2"
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
            >
              <option value="all">All Events</option>
              <option value="data">Data Events</option>
              <option value="analysis">Analysis Events</option>
              <option value="verification">Verification Events</option>
            </select>
          </div>
        </div>

        {/* Logs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockLogs.map((log, index) => (
            <LogEntry key={index} {...log} />
          ))}
        </div>

        {/* Verification Status */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <div className="flex items-center space-x-2 text-white mb-4">
            <FiCheckCircle className="w-5 h-5 text-green-500" />
            <h3 className="text-xl font-semibold">Chain Integrity Status</h3>
          </div>
          <p className="text-gray-300 text-sm mb-4">
            Last chain verification: 2 minutes ago - All blocks verified
          </p>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
            Verify Chain Integrity
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default BlockchainLogsPage;