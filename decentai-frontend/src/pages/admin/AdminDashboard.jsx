import { useState, useEffect } from 'react';
import demoData from '../../data/db.json';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTransactions: 0,
    totalPolls: 0,
    activePolls: 0,
  });

  useEffect(() => {
    setStats({
      totalUsers: demoData.users.length,
      totalTransactions: demoData.transactions.length,
      totalPolls: demoData.polls.length,
      activePolls: demoData.polls.filter(poll => poll.active).length,
    });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Users</h3>
          <p className="text-2xl font-bold">{stats.totalUsers}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Transactions</h3>
          <p className="text-2xl font-bold">{stats.totalTransactions}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Polls</h3>
          <p className="text-2xl font-bold">{stats.totalPolls}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Active Polls</h3>
          <p className="text-2xl font-bold">{stats.activePolls}</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard; 