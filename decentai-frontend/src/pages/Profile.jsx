import { useState, useEffect } from 'react';
import demoData from '../data/db.json';

function Profile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
  });

  useEffect(() => {
    const userData = demoData.users[0];
    setUser(userData);
    setFormData({
      username: userData.username,
      email: userData.email,
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setUser({ ...user, ...formData });
    setEditing(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      
      <div className="max-w-2xl bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4 mb-6">
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