// src/pages/VotingPage.js
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { FiCheckSquare, FiPlusCircle, FiClock, FiUsers, FiLock } from 'react-icons/fi';

const PollCard = ({ title, description, totalVotes, endDate, isActive }) => (
  <div className="bg-gray-700 rounded-lg p-6">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <span className={`px-3 py-1 rounded-full text-sm ${
        isActive ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
      }`}>
        {isActive ? 'Active' : 'Ended'}
      </span>
    </div>
    <p className="text-gray-300 mb-4">{description}</p>
    <div className="space-y-3">
      {isActive && (
        <div className="space-y-2">
          <label className="flex items-center space-x-3 p-3 rounded-lg bg-gray-600 cursor-pointer hover:bg-gray-500 transition-colors">
            <input type="radio" name={`poll-${title}`} className="text-blue-600" />
            <span className="text-white">Option 1</span>
          </label>
          <label className="flex items-center space-x-3 p-3 rounded-lg bg-gray-600 cursor-pointer hover:bg-gray-500 transition-colors">
            <input type="radio" name={`poll-${title}`} className="text-blue-600" />
            <span className="text-white">Option 2</span>
          </label>
        </div>
      )}
    </div>
    <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
      <div className="flex items-center space-x-2">
        <FiUsers className="w-4 h-4" />
        <span>{totalVotes} votes</span>
      </div>
      <div className="flex items-center space-x-2">
        <FiClock className="w-4 h-4" />
        <span>Ends: {endDate}</span>
      </div>
    </div>
  </div>
);

const VotingPage = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const mockPolls = [
    {
      title: "Q1 2024 Project Priority",
      description: "Vote on which project should be prioritized for Q1 2024",
      totalVotes: 45,
      endDate: "2024-03-20",
      isActive: true
    },
    {
      title: "New Feature Implementation",
      description: "Choose which new feature should be implemented next",
      totalVotes: 32,
      endDate: "2024-03-15",
      isActive: false
    }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Voting & Polls</h2>
            <p className="text-gray-400">Create and participate in blockchain-secured polls</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            <FiPlusCircle className="w-5 h-5" />
            <span>Create Poll</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'active' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Active Polls
          </button>
          <button
            onClick={() => setActiveTab('ended')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'ended' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Ended Polls
          </button>
        </div>

        {/* Polls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockPolls
            .filter(poll => activeTab === 'active' ? poll.isActive : !poll.isActive)
            .map((poll, index) => (
              <PollCard key={index} {...poll} />
            ))}
        </div>

        {/* Blockchain Verification */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <div className="flex items-center space-x-2 text-white mb-4">
            <FiLock className="w-5 h-5" />
            <h3 className="text-xl font-semibold">Blockchain Verification</h3>
          </div>
          <p className="text-gray-300 text-sm mb-4">
            All votes are securely recorded on the blockchain for transparency and integrity.
          </p>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
            Verify Votes
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default VotingPage;