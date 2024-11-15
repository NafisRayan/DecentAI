import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

function Dashboard() {
  const { user } = useAuth();
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    // Use the authenticated user data instead of demo data
    const fetchTransactions = async () => {
      try {
        const response = await fetch('http://localhost:5000/transactions');
        const data = await response.json();
        setRecentTransactions(data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Points Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Current Points</h2>
          <p className="text-3xl font-bold text-primary">
            {user?.points || 0}
          </p>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center">
                <span>Transfer to User #{transaction.receiverId}</span>
                <span className="font-semibold">{transaction.amount} points</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 