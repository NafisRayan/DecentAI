import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

function Profile() {
  const { user, setUser, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation will be handled by ProtectedRoute
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      
      <div className="max-w-2xl bg-white rounded-lg shadow p-6">
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
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-white py-2 rounded hover:bg-primary/90"
            >
              Save
            </button>
          </form>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-sm text-primary hover:underline"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}

export default Profile; 