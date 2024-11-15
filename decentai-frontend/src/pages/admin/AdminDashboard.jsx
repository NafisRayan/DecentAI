import { useState, useEffect } from 'react';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTransactions: 0,
    totalPolls: 0,
    activePolls: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, transactions, polls] = await Promise.all([
          fetch('http://localhost:5000/users').then(res => res.json()),
          fetch('http://localhost:5000/transactions').then(res => res.json()),
          fetch('http://localhost:5000/polls').then(res => res.json())
        ]);

        setStats({
          totalUsers: users.length,
          totalTransactions: transactions.length,
          totalPolls: polls.length,
          activePolls: polls.filter(poll => poll.active).length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
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