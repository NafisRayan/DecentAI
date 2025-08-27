import { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaVolumeUp } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [usersMap, setUsersMap] = useState({});

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
          map[user._id.$oid] = user.username;
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

    try {
      const response = await fetch('http://localhost:5000/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          roomId: 'public',
          userId: user.id.$oid,
          message: newMessage,
        }),
      });

      if (response.ok) {
        const newMsg = await response.json();
        setMessages(prev => [...prev, newMsg]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="p-6 h-[calc(100vh-theme(spacing.16))] flex flex-col">
      <h1 className="text-2xl font-bold mb-6">Chat Room</h1>
      
      <div className="flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 flex ${message.userId.$oid === user.id.$oid ? 'justify-end' : 'justify-start'} items-center`}
            >
              <div className={`max-w-[70%] rounded-lg p-3 ${
                message.userId.$oid === user.id.$oid ? 'bg-primary text-white' : 'bg-gray-100'
              }`}>
                <p className="font-semibold">{usersMap[message.userId.$oid] || 'Unknown User'}</p>
                <p>{message.message}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
              {message.userId.$oid !== user.id.$oid && (
                <button
                  onClick={() => readOutLoud(message.message)}
                  className="ml-2 p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  <FaVolumeUp />
                </button>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 border-t">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={startSpeechRecognition}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <FaMicrophone />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 p-2 border rounded"
              placeholder="Type a message..."
            />
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
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