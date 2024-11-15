import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line
} from 'recharts';

function Analytics() {
  const { user } = useAuth();
  const [data, setData] = useState({
    transactions: [],
    polls: [],
    loading: true,
    error: null
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const fetchData = useCallback(async () => {
    try {
      const [transactions, polls] = await Promise.all([
        fetch('http://localhost:5000/transactions').then(res => res.json()),
        fetch('http://localhost:5000/polls').then(res => res.json())
      ]);

      setData(prev => ({
        ...prev,
        transactions,
        polls,
        loading: false,
        error: null
      }));
    } catch (error) {
      setData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load analytics data'
      }));
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const processedData = useMemo(() => {
    if (!data.transactions.length || !data.polls.length) return null;

    const userTransactions = data.transactions
      .filter(t => t.senderId === user.id || t.receiverId === user.id)
      .map(t => ({
        ...t,
        amount: t.senderId === user.id ? -t.amount : t.amount,
        date: new Date(t.timestamp).toLocaleDateString()
      }));

    const transactionsByDate = userTransactions.reduce((acc, curr) => {
      if (!acc[curr.date]) acc[curr.date] = 0;
      acc[curr.date] += curr.amount;
      return acc;
    }, {});

    const pollParticipation = data.polls.reduce((acc, poll) => {
      const hasVoted = poll.voters?.includes(user.id);
      acc[hasVoted ? 'Participated' : 'Not Participated']++;
      return acc;
    }, { 'Participated': 0, 'Not Participated': 0 });

    const totalAmount = userTransactions.reduce((sum, t) => sum + t.amount, 0);
    const averageTransactionAmount = userTransactions.length ? (totalAmount / userTransactions.length).toFixed(2) : 0;

    return {
      transactionTrend: Object.entries(transactionsByDate).map(([date, amount]) => ({
        date,
        amount
      })),
      pollStats: Object.entries(pollParticipation).map(([name, value]) => ({
        name,
        value
      })),
      averageTransactionAmount
    };
  }, [data.transactions, data.polls, user.id]);

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
      <h1 className="text-2xl font-bold mb-6">Your Analytics</h1>

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
          <h2 className="text-lg font-semibold mb-4">Average Transaction Amount</h2>
          <p className="text-2xl">{processedData?.averageTransactionAmount}</p>
        </div>
      </div>
    </div>
  );
}

export default Analytics;