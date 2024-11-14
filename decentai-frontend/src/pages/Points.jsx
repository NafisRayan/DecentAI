import { useState, useEffect } from 'react';
import demoData from '../data/db.json';

function Points() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [recipientId, setRecipientId] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    setBalance(demoData.users[0].points);
    setTransactions(demoData.transactions);
  }, []);

  const handleTransfer = (e) => {
    e.preventDefault();
    // Simulate transfer
    const newTransaction = {
      id: transactions.length + 1,
      senderId: 1,
      receiverId: parseInt(recipientId),
      amount: parseInt(amount),
      timestamp: new Date().toISOString()
    };
    
    setTransactions([newTransaction, ...transactions]);
    setBalance(prev => prev - parseInt(amount));
    setRecipientId('');
    setAmount('');
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
              <label className="block text-sm font-medium mb-1">Recipient ID</label>
              <input
                type="number"
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 border rounded"
                max={balance}
                required
              />
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
                    {transaction.senderId === 1 ? 'Sent to' : 'Received from'} User #{
                      transaction.senderId === 1 ? transaction.receiverId : transaction.senderId
                    }
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <span className={`font-semibold ${
                  transaction.senderId === 1 ? 'text-red-500' : 'text-green-500'
                }`}>
                  {transaction.senderId === 1 ? '-' : '+'}{transaction.amount}
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