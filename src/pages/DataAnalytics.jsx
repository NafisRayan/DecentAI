import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line
} from 'recharts';

function DataAnalytics() {
  const [data, setData] = useState({
    transactions: [],
    polls: [],
    chats: [],
    users: [],
    loading: true,
    error: null
  });

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTransactions: 0,
    totalPolls: 0,
    activePolls: 0,
  });

  const [searchTerms, setSearchTerms] = useState({
    chats: '',
    users: ''
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const fetchData = useCallback(async () => {
    try {
      const [users, transactions, polls, chats] = await Promise.all([
        fetch('http://localhost:5000/users').then(res => res.json()),
        fetch('http://localhost:5000/analytics/transactions').then(res => res.json()),
        fetch('http://localhost:5000/polls').then(res => res.json()),
        fetch('http://localhost:5000/chats').then(res => res.json())
      ]);

      setData({
        transactions,
        polls,
        chats,
        users,
        loading: false,
        error: null
      });

      setStats({
        totalUsers: users.length,
        totalTransactions: transactions.length,
        totalPolls: polls.length,
        activePolls: polls.filter(poll => poll.active).length,
      });
    } catch (error) {
      setData({
        transactions: [],
        polls: [],
        chats: [],
        users: [],
        loading: false,
        error: 'Failed to load analytics data'
      });
      console.error('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const processedData = useMemo(() => {
    if (!data.transactions.length || !data.polls.length) return null;

    // Create users map for quick lookup
    const usersMap = data.users.reduce((acc, user) => {
      acc[user.id] = {
        username: user.username,
        email: user.email
      };
      return acc;
    }, {});

    const transactionsByDate = data.transactions.reduce((acc, curr) => {
      const date = new Date(curr.timestamp).toLocaleDateString();
      if (!acc[date]) acc[date] = 0;
      acc[date] += curr.amount;
      return acc;
    }, {});

    const pollParticipation = data.polls.reduce((acc, poll) => {
      const totalVotes = poll.voters?.length || 0;
      acc['Participated'] += totalVotes;
      acc['Not Participated'] += (stats.totalUsers - totalVotes);
      return acc;
    }, { 'Participated': 0, 'Not Participated': 0 });

    const totalAmount = data.transactions.reduce((sum, t) => sum + t.amount, 0);
    const averageTransactionAmount = data.transactions.length ? (totalAmount / data.transactions.length).toFixed(2) : 0;

    // Filter chats based on search term
    const filteredChats = data.chats.filter(chat => {
      if (!searchTerms.chats) return true;
      const userInfo = usersMap[chat.userId] || {};
      const searchLower = searchTerms.chats.toLowerCase();
      return (
        (userInfo.username || '').toLowerCase().includes(searchLower) ||
        (userInfo.email || '').toLowerCase().includes(searchLower) ||
        (chat.message || '').toLowerCase().includes(searchLower)
      );
    });

    // Filter users based on search term
    const filteredUsers = data.users.filter(user => {
      if (!searchTerms.users) return true;
      const searchLower = searchTerms.users.toLowerCase();
      return (
        (user.username || '').toLowerCase().includes(searchLower) ||
        (user.email || '').toLowerCase().includes(searchLower) ||
        (user.id || '').toLowerCase().includes(searchLower)
      );
    });

    return {
      transactionTrend: Object.entries(transactionsByDate).map(([date, amount]) => ({
        date,
        amount
      })),
      pollStats: Object.entries(pollParticipation).map(([name, value]) => ({
        name,
        value
      })),
      averageTransactionAmount,
      usersMap,
      filteredChats,
      filteredUsers
    };
  }, [data.transactions, data.polls, data.users, data.chats, stats.totalUsers, searchTerms]);

  const pollData = useMemo(() => {
    return data.polls.map(poll => ({
      question: poll.title,
      votes: poll.voters?.length || 0
    }));
  }, [data.polls]);

  if (data.loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-200 rounded"></div>
            <div className="h-80 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {data.error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Platform Analytics & Statistics</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Transaction Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={processedData?.transactionTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Poll Participation</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={processedData?.pollStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {processedData?.pollStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Poll Results Distribution</h2>
          <div className="flex justify-center">
            <PieChart width={300} height={300}>
              <Pie
                data={pollData}
                cx={150}
                cy={150}
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="votes"
              >
                {pollData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Vote Distribution</h2>
          <BarChart width={400} height={300} data={pollData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="question" label={{  }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="votes" fill="#8884d8" />
          </BarChart>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Chat Messages</h2>
          <div className="flex items-center space-x-2">
            <input
              id="chats-search"
              name="chatsSearch"
              type="text"
              placeholder="Search chats..."
              value={searchTerms.chats}
              onChange={(e) => setSearchTerms(prev => ({ ...prev, chats: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              aria-label="Search chat messages"
            />
            {searchTerms.chats && (
              <button
                onClick={() => setSearchTerms(prev => ({ ...prev, chats: '' }))}
                className="px-3 py-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Message
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {processedData?.filteredChats.map((chat) => {
              const userInfo = processedData?.usersMap[chat.userId] || {};
              return (
                <tr key={chat.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {userInfo.username || 'Unknown User'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {userInfo.email || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {chat.message}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(chat.timestamp).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {processedData?.filteredChats.length === 0 && searchTerms.chats && (
          <div className="text-center py-4 text-gray-500">
            No chat messages found matching "{searchTerms.chats}"
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Registered Users</h2>
          <div className="flex items-center space-x-2">
            <input
              id="users-search"
              name="usersSearch"
              type="text"
              placeholder="Search users..."
              value={searchTerms.users}
              onChange={(e) => setSearchTerms(prev => ({ ...prev, users: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              aria-label="Search users"
            />
            {searchTerms.users && (
              <button
                onClick={() => setSearchTerms(prev => ({ ...prev, users: '' }))}
                className="px-3 py-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User ID
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {processedData?.filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {processedData?.filteredUsers.length === 0 && searchTerms.users && (
          <div className="text-center py-4 text-gray-500">
            No users found matching "{searchTerms.users}"
          </div>
        )}
      </div>
    </div>
  );
}

export default DataAnalytics; 