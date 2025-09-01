import { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaVolumeUp } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

function Chat() {
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [usersMap, setUsersMap] = useState({});
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('http://localhost:5000/chats');
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
    // Set up polling for new messages
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5000/users');
        const data = await response.json();
        const map = {};
        data.forEach(user => {
          map[user.id] = user.username;
        });
        setUsersMap(map);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clear auth error when user becomes available
  useEffect(() => {
    if (user && !loading) {
      setAuthError(null);
    }
  }, [user, loading]);

  const readOutLoud = (text) => {
    const speech = new SpeechSynthesisUtterance();
    speech.text = text;
    window.speechSynthesis.speak(speech);
  };

  const startSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => {
        console.log('Speech recognition started');
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
      };

      recognition.onresult = (event) => {
        if (event.results[0] && event.results[0].isFinal) {
          setNewMessage(prev => prev + event.results[0][0].transcript + ' ');
        }
      };

      try {
        recognition.start();
      } catch (error) {
        console.error("Failed to start speech recognition:", error);
      }
    } else {
      alert('Your browser does not support speech recognition.');
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    if (loading) {
      console.error('Authentication is still loading');
      setAuthError('Please wait while we verify your authentication...');
      return;
    }
    
    if (!user || !user.id) {
      console.error('User not authenticated');
      setAuthError('You must be logged in to send messages. Please log in and try again.');
      return;
    }

    setAuthError(null); // Clear any previous auth errors

    try {
      const response = await fetch('http://localhost:5000/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          roomId: 'public',
          userId: user.id,
          message: newMessage,
        }),
      });

      if (response.ok) {
        const newMsg = await response.json();
        setMessages(prev => [...prev, newMsg]);
        setNewMessage('');
      } else {
        console.error('Failed to send message:', response.statusText);
        setAuthError('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setAuthError('Network error. Please check your connection and try again.');
    }
  };

  return (
    <div className="p-6 h-[calc(100vh-theme(spacing.16))] flex flex-col">
      <h1 className="text-2xl font-bold mb-6">Chat Room</h1>
      
      {/* Loading State */}
      {loading && (
        <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
            <span>Loading authentication...</span>
          </div>
        </div>
      )}

      {/* Authentication Error */}
      {authError && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="mr-2">❌</span>
              <span>{authError}</span>
            </div>
            <button
              onClick={() => setAuthError(null)}
              className="ml-4 text-red-500 hover:text-red-700"
              aria-label="Close error"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Not Authenticated Message */}
      {!loading && !user && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
          <div className="flex items-center">
            <span className="mr-2">⚠️</span>
            <span>You must be logged in to use the chat room. Please log in to start chatting.</span>
          </div>
        </div>
      )}
      
      <div className="flex-1 flex flex-col bg-white rounded-lg shadow overflow-hidden">
        <div className="flex-1 p-4 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">No messages yet</p>
                <p className="text-sm">Be the first to start the conversation!</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 flex ${message.userId === user?.id ? 'justify-end' : 'justify-start'} items-center`}
              >
                <div className={`max-w-[70%] rounded-lg p-3 ${
                  message.userId === user?.id ? 'bg-primary text-white' : 'bg-gray-100'
                }`}>
                  <p className="font-semibold">{usersMap[message.userId] || 'Unknown User'}</p>
                  <p>{message.message}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                {message.userId !== user?.id && (
                  <button
                    onClick={() => readOutLoud(message.message)}
                    className="ml-2 p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    <FaVolumeUp />
                  </button>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 border-t">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={startSpeechRecognition}
              disabled={!user || loading}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaMicrophone />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={!user || loading}
              className="flex-1 p-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder={loading ? "Loading..." : user ? "Type a message..." : "Please log in to chat"}
            />
            <button
              type="submit"
              disabled={!user || !newMessage.trim() || loading}
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Chat; 