import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Ensure _id is a string if it exists
      // Ensure _id is a string if it exists
      if (data._id && typeof data._id === 'object' && data._id.$oid) {
        data.id = data._id.$oid;
        delete data._id; // Remove the original _id object
      }
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch('http://localhost:5000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch('/auth/logout', { method: 'POST' });
      setUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshUser = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`http://localhost:5000/users/${user.id}`);
      if (response.ok) {
        const updatedUser = await response.json();
        // Ensure _id is handled properly
        if (updatedUser._id && typeof updatedUser._id === 'object' && updatedUser._id.$oid) {
          updatedUser.id = updatedUser._id.$oid;
          delete updatedUser._id;
        }
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 