import { useState, useEffect, useRef } from 'react';

function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: `This is a simulated AI response to: "${input}"`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="p-6 h-[calc(100vh-theme(spacing.16))] flex flex-col">
      <h1 className="text-2xl font-bold mb-6">AI Chat Assistant</h1>
      
      <div className="flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] rounded-lg p-3 ${
                message.role === 'user' ? 'bg-primary text-white' : 'bg-gray-100'
              }`}>
                <p>{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-100 rounded-lg p-3">
                <p className="animate-pulse">AI is typing...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 p-2 border rounded"
              placeholder="Ask the AI assistant..."
              disabled={isLoading}
            />
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 disabled:opacity-50"
              disabled={isLoading}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AIChat;