import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

function Dashboard() {
  const { user, setUser, logout } = useAuth();
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [participatedPolls, setParticipatedPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });

  useEffect(() => {
    // Update form data when user changes
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
    });
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch transactions
        const transactionsResponse = await fetch(`http://localhost:5000/transactions?userId=${user.id}`);
        const transactionsData = await transactionsResponse.json();
        setRecentTransactions(transactionsData.slice(-5).reverse());

        // Fetch all polls and filter participated ones
        const pollsResponse = await fetch('http://localhost:5000/polls');
        const pollsData = await pollsResponse.json();
        
        // Debug logging
        console.log('User ID:', user.id);
        console.log('Polls data:', pollsData);
        
        // Filter polls where user has voted
        const userParticipatedPolls = pollsData.filter(poll => {
          const hasVoted = poll.voters && poll.voters.some(voterId => {
            const match = voterId === user.id;
            console.log(`Poll ${poll.id}: checking voter ${voterId} against user ${user.id} - match: ${match}`);
            return match;
          });
          console.log(`Poll ${poll.id} hasVoted: ${hasVoted}`);
          return hasVoted;
        });
        
        console.log('Filtered participated polls:', userParticipatedPolls);
        
        setParticipatedPolls(userParticipatedPolls.reverse()); // Show all participated polls, most recent first
      } catch (error) {
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const clearNotification = () => {
    setNotification(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if data has changed
    if (formData.username === user.username && formData.email === user.email) {
      setNotification({
        type: 'info',
        message: 'No changes detected.'
      });
      setTimeout(() => setNotification(null), 2000);
      return;
    }
    
    setUpdating(true);
    try {
      const response = await fetch(`http://localhost:5000/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setEditing(false);
        
        // Show notification that user needs to re-login
        setNotification({
          type: 'success',
          message: 'Profile updated successfully! For security reasons, you will be logged out. Please log in again to continue.'
        });
        
        // Automatically logout after 4 seconds
        setTimeout(async () => {
          try {
            await logout();
            setNotification({
              type: 'info',
              message: 'You have been logged out. Please log in again.'
            });
            setTimeout(() => setNotification(null), 3000);
          } catch (error) {
            console.error('Error during logout:', error);
            setNotification({
              type: 'error',
              message: 'Profile updated but logout failed. Please refresh the page and log in again.'
            });
          }
        }, 4000);
      } else {
        const errorData = await response.json();
        setNotification({
          type: 'error',
          message: errorData.error || 'Failed to update profile'
        });
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setNotification({
        type: 'error',
        message: 'Network error. Please try again.'
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await logout();
      } catch (error) {
        console.error('Error logging out:', error);
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Notification */}
      {notification && (
        <div className={`mb-6 p-4 rounded-lg relative ${
          notification.type === 'success' 
            ? 'bg-green-100 border border-green-400 text-green-700' 
            : notification.type === 'error'
            ? 'bg-red-100 border border-red-400 text-red-700'
            : 'bg-blue-100 border border-blue-400 text-blue-700'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="mr-2">
                {notification.type === 'success' ? '✅' : notification.type === 'error' ? '❌' : 'ℹ️'}
              </span>
              <span>{notification.message}</span>
            </div>
            <button
              onClick={clearNotification}
              className="ml-4 text-gray-500 hover:text-gray-700"
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
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
          {loading ? (
            <p>Loading transactions...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center">
                  <span>
                    {transaction.receiverId === user.id 
                      ? `Transferred from User #${transaction.senderId}` 
                      : `Sent to User #${transaction.receiverId}`}
                  </span>
                  <span className="font-semibold">{transaction.amount} points</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Profile Section */}
      <div className="max-w-2xl bg-white rounded-lg shadow p-6 mt-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-4">
            <img
              src={user?.avatar || '/default-avatar.png'}
              alt="Profile"
              className="w-20 h-20 rounded-full"
            />
            <div>
              <h2 className="text-xl font-semibold">{user?.username}</h2>
              <p className="text-gray-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            aria-label="Logout"
          >
            Logout
          </button>
        </div>

        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full p-2 border rounded"
                aria-label="Edit username"
                disabled={updating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2 border rounded"
                aria-label="Edit email"
                disabled={updating}
              />
            </div>
            <button
              type="submit"
              disabled={updating}
              className="w-full bg-primary text-white py-2 rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Save profile changes"
            >
              {updating ? 'Updating...' : 'Save'}
            </button>
          </form>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Edit profile"
            disabled={updating}
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Participated Polls Section */}
      <div className="bg-white p-6 rounded-lg shadow mt-6">
        <h2 className="text-lg font-semibold mb-4">My Poll Participation</h2>
        {loading ? (
          <p>Loading polls...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : participatedPolls.length === 0 ? (
          <p className="text-gray-500">You haven't participated in any polls yet.</p>
        ) : (
          <div className="space-y-4">
            {participatedPolls.map((poll) => {
              const totalVotes = Object.values(poll.votes || {}).reduce((sum, votes) => sum + votes, 0);
              return (
                <div key={poll.id} className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-medium text-gray-900 mb-2">{poll.title}</h3>
                  <div className="text-sm text-gray-600 mb-3">
                    <p>Total Votes: {totalVotes}</p>
                    <p className="text-xs text-gray-500">
                      Created: {new Date(poll.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Results:</p>
                    {Object.entries(poll.votes || {}).map(([option, votes]) => {
                      const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : 0;
                      return (
                        <div key={option} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 flex-1">{option}</span>
                          <div className="flex items-center space-x-2 flex-1 max-w-xs">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold min-w-[60px] text-right">
                              {votes} ({percentage}%)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;