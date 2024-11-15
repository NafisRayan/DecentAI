import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

function DataAnalysis() {
  const [data, setData] = useState({
    users: [],
    transactions: [],
    polls: []
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [users, transactions, polls] = await Promise.all([
          fetch('http://localhost:5000/users').then(res => res.json()),
          fetch('http://localhost:5000/transactions').then(res => res.json()),
          fetch('http://localhost:5000/polls').then(res => res.json())
        ]);

        setData({ users, transactions, polls });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Data Analysis</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Transaction Amount</h3>
          <p className="text-2xl font-bold">{data.transactions.reduce((sum, tx) => sum + tx.amount, 0)}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Average Transaction</h3>
          <p className="text-2xl font-bold">
            {data.transactions.reduce((sum, tx) => sum + tx.amount, 0) / data.transactions.length}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Transaction Count</h3>
          <p className="text-2xl font-bold">{data.transactions.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Poll Results Distribution</h2>
          <div className="flex justify-center">
            <PieChart width={300} height={300}>
              <Pie
                data={data.polls[0].options.map(option => ({
                  name: option,
                  votes: data.polls[0].votes[option] || 0
                }))}
                cx={150}
                cy={150}
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="votes"
              >
                {data.polls[0].options.map((option, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Vote Distribution</h2>
          <BarChart width={400} height={300} data={data.polls[0].options.map(option => ({
            name: option,
            votes: data.polls[0].votes[option] || 0
          }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="votes" fill="#8884d8" />
          </BarChart>
        </div>
      </div>
    </div>
  );
}

export default DataAnalysis;
