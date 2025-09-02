import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

function UserSettings() {
  const { user } = useAuth();
  const [adminRequests, setAdminRequests] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allPolls, setAllPolls] = useState([]);
  const [userRequest, setUserRequest] = useState(null);
  const [requestReason, setRequestReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [adminRequestsSearch, setAdminRequestsSearch] = useState('');
  const [usersSearch, setUsersSearch] = useState('');
  const [pollsSearch, setPollsSearch] = useState('');

  const fetchAdminData = useCallback(async () => {
    try {
      const [requestsRes, usersRes, pollsRes] = await Promise.all([
        fetch('http://localhost:5000/admin-requests'),
        fetch('http://localhost:5000/users'),
        fetch('http://localhost:5000/polls')
      ]);

      const requests = await requestsRes.json();
      const users = await usersRes.json();
      const polls = await pollsRes.json();

      setAdminRequests(requests);
      setAllUsers(users);
      setAllPolls(polls);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  }, []);

  const fetchUserRequest = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`http://localhost:5000/admin-requests/user/${user.id}`);
      if (response.ok) {
        const request = await response.json();
        setUserRequest(request);
      }
    } catch (error) {
      console.error('Error fetching user request:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.is_admin) {
      fetchAdminData();
    } else if (user?.id) {
      fetchUserRequest();
    }
  }, [user?.is_admin, user?.id, fetchAdminData, fetchUserRequest]);

  const handleAdminRequest = async () => {
    if (!requestReason.trim()) {
      setNotification({ type: 'error', message: 'Please provide a reason for your request' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/admin-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          reason: requestReason
        })
      });

      if (response.ok) {
        setNotification({ type: 'success', message: 'Admin request submitted successfully!' });
        fetchUserRequest();
      } else {
        const error = await response.json();
        setNotification({ type: 'error', message: error.error || 'Failed to submit request' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      const response = await fetch(`http://localhost:5000/admin-requests/${requestId}/approve`, {
        method: 'POST'
      });

      if (response.ok) {
        setNotification({ type: 'success', message: 'Admin request approved!' });
        fetchAdminData();
      } else {
        setNotification({ type: 'error', message: 'Failed to approve request' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Network error' });
    }
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const response = await fetch(`http://localhost:5000/admin-requests/${requestId}/reject`, {
        method: 'POST'
      });

      if (response.ok) {
        setNotification({ type: 'success', message: 'Admin request rejected!' });
        fetchAdminData();
      } else {
        setNotification({ type: 'error', message: 'Failed to reject request' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Network error' });
    }
    setTimeout(() => setNotification(null), 3000);
  };

  const handleReapplyRequest = async (requestId) => {
    const newReason = prompt('Would you like to update your reason? (Leave empty to keep current reason):', userRequest?.reason || '');
    
    if (newReason === null) return; // User cancelled
    
    try {
      const response = await fetch(`http://localhost:5000/admin-requests/${requestId}/reapply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: newReason || userRequest?.reason || '' })
      });

      if (response.ok) {
        setNotification({ type: 'success', message: 'Admin request submitted successfully!' });
        fetchUserRequest();
      } else {
        const error = await response.json();
        setNotification({ type: 'error', message: error.error || 'Failed to reapply' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Network error. Please try again.' });
    }
    setTimeout(() => setNotification(null), 3000);
  };

  const handleMakeAdmin = async (userId) => {
    try {
      const response = await fetch('http://localhost:5000/admin/make-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });

      if (response.ok) {
        setNotification({ type: 'success', message: 'User promoted to admin!' });
        fetchAdminData();
      } else {
        setNotification({ type: 'error', message: 'Failed to promote user' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Network error' });
    }
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRemoveAdmin = async (userId) => {
    try {
      const response = await fetch('http://localhost:5000/admin/remove-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });

      if (response.ok) {
        setNotification({ type: 'success', message: 'Admin status removed!' });
        fetchAdminData();
      } else {
        setNotification({ type: 'error', message: 'Failed to remove admin status' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Network error' });
    }
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/admin/delete-user/${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setNotification({ type: 'success', message: 'User deleted successfully!' });
        fetchAdminData();
      } else {
        setNotification({ type: 'error', message: 'Failed to delete user' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Network error' });
    }
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeletePoll = async (pollId) => {
    if (!window.confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/admin/delete-poll/${pollId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setNotification({ type: 'success', message: 'Poll deleted successfully!' });
        fetchAdminData();
      } else {
        setNotification({ type: 'error', message: 'Failed to delete poll' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Network error' });
    }
    setTimeout(() => setNotification(null), 3000);
  };

  if (!user) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        {user.is_admin ? 'Admin Settings' : 'User Settings'}
      </h1>

      {/* Notification */}
      {notification && (
        <div className={`mb-6 p-4 rounded-lg relative ${
          notification.type === 'success'
            ? 'bg-green-100 border border-green-400 text-green-700'
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="mr-2">
                {notification.type === 'success' ? '✅' : '❌'}
              </span>
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="ml-4 text-gray-500 hover:text-gray-700"
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {user.is_admin ? (
        // Admin Panel
        <div className="space-y-6">
          {/* Admin Requests */}
          <div className="bg-white rounded-lg shadow p-6 max-h-96 flex flex-col">
            {/* Sticky Header */}
            <div className="flex-shrink-0 mb-4">
              <h2 className="text-xl font-semibold mb-4">Admin Requests</h2>
              
              {/* Search Bar */}
              <input
                type="text"
                placeholder="Search by username, email, or reason..."
                value={adminRequestsSearch}
                onChange={(e) => setAdminRequestsSearch(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              {(() => {
                const filteredRequests = adminRequests.filter((request) => {
                  if (!adminRequestsSearch) return true;
                  
                  const requestingUser = allUsers.find(u => u.id === request.user_id);
                  const searchTerm = adminRequestsSearch.toLowerCase();
                  
                  return (
                    (requestingUser?.username?.toLowerCase().includes(searchTerm)) ||
                    (requestingUser?.email?.toLowerCase().includes(searchTerm)) ||
                    (request.reason?.toLowerCase().includes(searchTerm))
                  );
                });
                
                return filteredRequests.length === 0 ? (
                  <p className="text-gray-500 py-4">
                    {adminRequestsSearch ? 'No matching admin requests found' : 'No pending admin requests'}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {filteredRequests.map((request) => {
                      // Find user details from allUsers array
                      const requestingUser = allUsers.find(u => u.id === request.user_id);
                      
                      // Check if this user has any previous rejected requests
                      const hasPreviousRejections = adminRequests.some(r => 
                        r.user_id === request.user_id && 
                        r.status === 'rejected' && 
                        r.id !== request.id
                      );
                      
                      return (
                        <div key={request.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">
                                {requestingUser ? requestingUser.username : 'Unknown User'} 
                                {requestingUser && <span className="text-gray-500">({requestingUser.email})</span>}
                                {hasPreviousRejections && (
                                  <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                                    Reapplication
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-gray-400">User ID: {request.user_id}</p>
                              <p className="text-sm text-gray-600">Reason: {request.reason}</p>
                              <p className="text-xs text-gray-500">
                                Requested: {new Date(request.created_at).toLocaleDateString()}
                              </p>
                              {request.status !== 'pending' && (
                                <p className="text-xs text-gray-500">
                                  Status: <span className={`font-medium ${
                                    request.status === 'approved' ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {request.status}
                                  </span>
                                </p>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              {request.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApproveRequest(request.id)}
                                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleRejectRequest(request.id)}
                                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* User Management */}
          <div className="bg-white rounded-lg shadow p-6 max-h-96 flex flex-col">
            {/* Sticky Header */}
            <div className="flex-shrink-0 mb-4">
              <h2 className="text-xl font-semibold mb-4">User Management</h2>
              
              {/* Search Bar */}
              <input
                type="text"
                placeholder="Search by username or email..."
                value={usersSearch}
                onChange={(e) => setUsersSearch(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              {(() => {
                const filteredUsers = allUsers.filter((u) => {
                  if (!usersSearch) return true;
                  
                  const searchTerm = usersSearch.toLowerCase();
                  return (
                    u.username?.toLowerCase().includes(searchTerm) ||
                    u.email?.toLowerCase().includes(searchTerm)
                  );
                });
                
                return (
                  <div className="space-y-4">
                    {filteredUsers.map((u) => (
                      <div key={u.id} className="flex justify-between items-center border rounded p-4">
                        <div>
                          <p className="font-medium">{u.username}</p>
                          <p className="text-sm text-gray-600">{u.email}</p>
                          <p className="text-xs text-gray-500">Points: {u.points || 0}</p>
                        </div>
                        <div className="flex space-x-2">
                          {u.is_admin ? (
                            <button
                              onClick={() => handleRemoveAdmin(u.id)}
                              className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm"
                            >
                              Remove Admin
                            </button>
                          ) : (
                            <button
                              onClick={() => handleMakeAdmin(u.id)}
                              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                            >
                              Make Admin
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                    {filteredUsers.length === 0 && usersSearch && (
                      <p className="text-gray-500 text-center py-4">No users found matching "{usersSearch}"</p>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Poll Management */}
          <div className="bg-white rounded-lg shadow p-6 max-h-96 flex flex-col">
            {/* Sticky Header */}
            <div className="flex-shrink-0 mb-4">
              <h2 className="text-xl font-semibold mb-4">Poll Management</h2>
              
              {/* Search Bar */}
              <input
                type="text"
                placeholder="Search by poll title..."
                value={pollsSearch}
                onChange={(e) => setPollsSearch(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              {(() => {
                const filteredPolls = allPolls.filter((poll) => {
                  if (!pollsSearch) return true;
                  
                  const searchTerm = pollsSearch.toLowerCase();
                  return poll.title?.toLowerCase().includes(searchTerm);
                });
                
                return (
                  <div className="space-y-4">
                    {filteredPolls.map((poll) => (
                      <div key={poll.id} className="border rounded p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium">{poll.title}</h3>
                            <p className="text-sm text-gray-600">
                              Created: {new Date(poll.created_at).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              Status: {poll.active ? 'Active' : 'Inactive'}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeletePoll(poll.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                          >
                            Delete Poll
                          </button>
                        </div>
                      </div>
                    ))}
                    {filteredPolls.length === 0 && pollsSearch && (
                      <p className="text-gray-500 text-center py-4">No polls found matching "{pollsSearch}"</p>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      ) : (
        // Regular User Settings
        <div className="space-y-6">
          {/* Admin Request Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Admin Access</h2>
            {userRequest ? (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-2">
                  Your admin request is <span className="font-medium">{userRequest.status}</span>
                </p>
                {userRequest.status === 'pending' && (
                  <p className="text-sm text-gray-500">Please wait for admin approval</p>
                )}
                {userRequest.status === 'approved' && (
                  <p className="text-sm text-green-600">Congratulations! You are now an admin.</p>
                )}
                {userRequest.status === 'rejected' && (
                  <div className="space-y-3">
                    <p className="text-sm text-red-600">Your request was rejected.</p>
                    <button
                      onClick={() => handleReapplyRequest(userRequest.id)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      Reapply for Admin Access
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600">
                  You are not an admin. Request admin access to manage users and polls.
                </p>
                <div>
                  <label className="block text-sm font-medium mb-2">Reason for Request</label>
                  <textarea
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    placeholder="Please explain why you need admin access..."
                    className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                  />
                </div>
                <button
                  onClick={handleAdminRequest}
                  disabled={loading}
                  className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Request Admin Access'}
                </button>
              </div>
            )}
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-700 mb-2">Username</h3>
                  <p className="text-lg font-semibold text-gray-900">{user.username}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-700 mb-2">Email</h3>
                  <p className="text-lg font-semibold text-gray-900">{user.email}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-700 mb-2">Points</h3>
                  <p className="text-lg font-semibold text-blue-600">{user.points || 0}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-700 mb-2">Account Status</h3>
                  <p className={`text-lg font-semibold ${user.is_admin ? 'text-green-600' : 'text-gray-600'}`}>
                    {user.is_admin ? 'Administrator' : 'Regular User'}
                  </p>
                </div>
              </div>
              
              {user.created_at && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-700 mb-2">Member Since</h3>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2">Account Summary</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• Username: {user.username}</p>
                  <p>• Email: {user.email}</p>
                  <p>• Points Earned: {user.points || 0}</p>
                  <p>• Account Type: {user.is_admin ? 'Administrator' : 'Regular User'}</p>
                  {user.created_at && (
                    <p>• Joined: {new Date(user.created_at).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserSettings; 