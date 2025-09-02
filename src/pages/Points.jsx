import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

function Points() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [recipientId, setRecipientId] = useState('');
  const [amount, setAmount] = useState('');
  const balance = user?.points || 0;

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch(`http://localhost:5000/transactions?userId=${user.id}`);
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setTransactions(data.reverse());
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
    try {
      const response = await fetch('http://localhost:5000/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          senderId: user.id,
          receiverId: parseInt(recipientId),
          amount: parseInt(amount),
          timestamp: new Date().toISOString()
        }),
      });

      if (response.ok) {
        // Refresh transactions after successful transfer
        const updatedTransactions = await response.json();
        setTransactions(Array.isArray(updatedTransactions) ? updatedTransactions : []);
        // Reset form
        setRecipientId('');
        setAmount('');
      }
    } catch (error) {
      console.error('Error making transfer:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Currency Points</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Transfer Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Transfer Points</h2>
          <form onSubmit={handleTransfer} className="space-y-4">
            <div>
              <label htmlFor="recipient-id" className="block text-sm font-medium mb-1">Recipient ID</label>
              <input
                id="recipient-id"
                name="recipientId"
                type="number"
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                min="0"
                aria-describedby="recipient-help"
              />
              <p id="recipient-help" className="text-xs text-gray-500 mt-1">Enter the user ID of the recipient</p>
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
                min="0"
                aria-describedby="amount-help"
              />
              <p id="amount-help" className="text-xs text-gray-500 mt-1">Enter the number of points to transfer (max: {balance})</p>
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-white py-2 rounded hover:bg-primary/90"
            >
              Transfer
            </button>
          </form>
        </div>

        {/* Transaction History */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">
                    {transaction.receiverId === user.id ? 'Received from' : 'Sent to'} User #{
                      transaction.receiverId === user.id ? transaction.senderId : transaction.receiverId
                    }
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <span className={`font-semibold ${
                  transaction.receiverId === user.id ? 'text-green-500' : 'text-red-500'
                }`}>
                  {transaction.receiverId === user.id ? '+' : '-'}{transaction.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Points; 