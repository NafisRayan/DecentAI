import { useState, useEffect, useRef } from 'react';
import demoData from '../data/db.json';
import { FaMicrophone, FaVolumeUp } from 'react-icons/fa';

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
        <div className="flex-1 p-4 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 flex ${message.userId === 1 ? 'justify-end' : 'justify-start'} items-center`}
            >
              <div className={`max-w-[70%] rounded-lg p-3 ${
                message.userId === 1 ? 'bg-primary text-white' : 'bg-gray-100'
              }`}>
                <p>{message.message}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
              {message.userId !== 1 && (
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