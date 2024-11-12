// src/pages/Dashboard.js
import React from 'react';
import Layout from '../components/Layout';

const StatCard = ({ title, value, icon, color }) => (
  <div className={`bg-gray-700 rounded-lg p-6 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-300 text-sm">{title}</p>
        <h4 className="text-2xl font-bold text-white mt-1">{value}</h4>
      </div>
      <div className="text-2xl text-white opacity-80">{icon}</div>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-white">Dashboard</h2>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            New Analysis
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Active Projects" value="12" icon="📊" />
          <StatCard title="Data Sets" value="34" icon="📁" />
          <StatCard title="AI Models" value="8" icon="🤖" />
          <StatCard title="Team Members" value="16" icon="👥" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {/* Activity items */}
              <div className="flex items-center space-x-4 text-gray-300">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p>New dataset uploaded</p>
                <span className="text-sm">2h ago</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="bg-gray-600 hover:bg-gray-500 text-white p-4 rounded-lg">
                Upload Data
              </button>
              <button className="bg-gray-600 hover:bg-gray-500 text-white p-4 rounded-lg">
                Start Analysis
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;