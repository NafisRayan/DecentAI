import { useState, useEffect, useRef } from 'react';
import demoData from '../data/db.json';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages(demoData.chats);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: messages.length + 1,
      roomId: 'public',
      userId: 1,
      message: newMessage,
      timestamp: new Date().toISOString()
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  return (
    <div className="p-6 h-[calc(100vh-theme(spacing.16))] flex flex-col">
      <h1 className="text-2xl font-bold mb-6">Chat Room</h1>
      
      <div className="flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col">
        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 flex ${message.userId === 1 ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] rounded-lg p-3 ${
                message.userId === 1 ? 'bg-primary text-white' : 'bg-gray-100'
              }`}>
                <p>{message.message}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t">
          <div className="flex space-x-2">
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