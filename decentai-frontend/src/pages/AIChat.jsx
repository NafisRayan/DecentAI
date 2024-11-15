import { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaVolumeUp } from 'react-icons/fa';
import { GoogleGenerativeAI } from "@google/generative-ai";

function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

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
          setInput(prev => prev + event.results[0][0].transcript + ' ');
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

  const genAI = new GoogleGenerativeAI("AIzaSyCMenNFHgeac3eUnjq5XeqDPzJvyng8LWM");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

    try {
      const result = await model.generateContent(input);
      const botResponse = result.response.text();

      const aiMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: botResponse,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error in AI response:', error);
      const errorMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 h-[calc(100vh-theme(spacing.16))] flex flex-col">
      <h1 className="text-2xl font-bold mb-6">AI Chat Assistant</h1>
      
      <div className="flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} items-center`}
            >
              <div className={`max-w-[70%] rounded-lg p-3 ${
                message.role === 'user' ? 'bg-primary text-white' : 'bg-gray-100'
              }`}>
                <p>{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
              {message.role === 'assistant' && (
                <button
                  onClick={() => readOutLoud(message.content)}
                  className="ml-2 p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  <FaVolumeUp />
                </button>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-100 rounded-lg p-3">
                <p className="animate-pulse">AI is thinking...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t">
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