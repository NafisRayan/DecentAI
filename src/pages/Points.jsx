import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

function Points() {
  const { user, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [recipientUsername, setRecipientUsername] = useState('');
  const [amount, setAmount] = useState('');
  const [transferring, setTransferring] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const balance = user?.points || 0;

  // Process transactions for chart - show balance over time
  const chartData = transactions.slice().reverse().map((transaction, index) => {
    const isReceiver = String(transaction.receiverId) === String(user.id);
    const transactionAmount = isReceiver ? transaction.amount : -transaction.amount;

    // Calculate running balance (start from 0 and add/subtract each transaction)
    let runningBalance = 0;
    for (let i = 0; i <= index; i++) {
      const prevTransaction = transactions[transactions.length - 1 - i];
      const prevIsReceiver = String(prevTransaction.receiverId) === String(user.id);
      runningBalance += prevIsReceiver ? prevTransaction.amount : -prevTransaction.amount;
    }

    return {
      timestamp: transaction.timestamp,
      balance: runningBalance,
      transaction: transactionAmount,
      type: isReceiver ? 'received' : 'sent',
      displayAmount: transaction.amount
    };
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch(`http://localhost:5000/transactions?userId=${user.id}`);
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setTransactions(data);
        } else {
          console.error('Expected an array but got:', data);
          setTransactions([]);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setTransactions([]);
      }
    };

    if (user?.id) {
      fetchTransactions();
    }
  }, [user?.id]);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setTransferring(true);

    if (!recipientUsername.trim()) {
      setError('Please enter a recipient username');
      setTransferring(false);
      return;
    }

    if (recipientUsername === user.username) {
      setError('Cannot transfer points to yourself');
      setTransferring(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          senderId: user.id,
          receiverUsername: recipientUsername.trim(),
          amount: parseInt(amount),
          timestamp: new Date().toISOString()
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Successfully transferred ${amount} points to ${recipientUsername}`);
        // Refresh user data to update points balance everywhere
        await refreshUser();
        // Refresh transactions after successful transfer
        const transactionsResponse = await fetch(`http://localhost:5000/transactions?userId=${user.id}`);
        const transactionsData = await transactionsResponse.json();
        setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
        // Reset form
        setRecipientUsername('');
        setAmount('');
      } else {
        setError(data.error || 'Transfer failed');
      }
    } catch (error) {
      console.error('Error making transfer:', error);
      setError('Network error. Please try again.');
    } finally {
      setTransferring(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Currency Points</h1>
      
      {/* Notifications */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {success}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Transfer Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Transfer Points</h2>
          <form onSubmit={handleTransfer} className="space-y-4">
            <div>
              <label htmlFor="recipient-username" className="block text-sm font-medium mb-1">Recipient Username</label>
              <input
                id="recipient-username"
                name="recipientUsername"
                type="text"
                value={recipientUsername}
                onChange={(e) => setRecipientUsername(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                placeholder="Enter username"
                aria-describedby="recipient-help"
              />
              <p id="recipient-help" className="text-xs text-gray-500 mt-1">Enter the username of the recipient</p>
            </div>
            <div>
              <label htmlFor="transfer-amount" className="block text-sm font-medium mb-1">Amount</label>
              <input
                id="transfer-amount"
                name="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                max={balance}
                required
                min="1"
                aria-describedby="amount-help"
              />
              <p id="amount-help" className="text-xs text-gray-500 mt-1">Enter the number of points to transfer (max: {balance})</p>
            </div>
            <button
              type="submit"
              disabled={transferring}
              className="w-full bg-primary text-white py-2 rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {transferring ? 'Transferring...' : 'Transfer'}
            </button>
          </form>
        </div>

        {/* Transaction History */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
          <div className="max-h-72 overflow-y-auto space-y-4 pr-4">
            {transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No transactions yet</p>
            ) : (
              transactions.map((transaction) => {
                const isReceiver = String(transaction.receiverId) === String(user.id);
                return (
                  <div key={transaction.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">
                        {isReceiver ? 'Received from' : 'Sent to'} {
                          isReceiver
                            ? (transaction.senderUsername || `User ${transaction.senderId}`)
                            : (transaction.receiverUsername || `User ${transaction.receiverId}`)
                        }
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.timestamp).toLocaleDateString()} at {new Date(transaction.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <span className={`font-semibold ${
                      isReceiver ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {isReceiver ? '+' : '-'}{transaction.amount}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Transaction Graph */}
      <div className="bg-white p-6 rounded-lg shadow mt-6">
        <h2 className="text-lg font-semibold mb-4">Transaction Trends</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No transactions to display</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value, name, props) => [
                  name === 'balance' ? `${value} points` : `${props.payload.type === 'received' ? '+' : '-'}${props.payload.displayAmount} points`,
                  name === 'balance' ? 'Balance' : (props.payload.type === 'received' ? 'Received' : 'Sent')
                ]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#3b82f6"
                strokeWidth={3}
                name="Balance"
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="transaction"
                stroke="#10b981"
                strokeWidth={2}
                name="Transaction"
                dot={{ r: 3 }}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default Points; 