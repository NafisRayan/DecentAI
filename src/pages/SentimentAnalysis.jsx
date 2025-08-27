import { useState, useEffect, useMemo } from 'react';
import wink from 'wink-nlp';
import model from 'wink-eng-lite-web-model';
import modelArtifacts from '../contexts/model_artifacts.json';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize wink-nlp outside the component
const nlp = wink(model);

function SentimentAnalysis() {
  const [inputText, setInputText] = useState('');
  const [sentiment, setSentiment] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // New state variables for Gemini-powered sentiment summaries
  const [chatSummary, setChatSummary] = useState(null);
  const [pollsSummary, setPollsSummary] = useState(null);
  const [chatSummaryLoading, setChatSummaryLoading] = useState(false);
  const [pollsSummaryLoading, setPollsSummaryLoading] = useState(false);
  const [chatSummaryError, setChatSummaryError] = useState(null);
  const [pollsSummaryError, setPollsSummaryError] = useState(null);

  // Fetch analysis history from the backend
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('http://localhost:5000/analysis-history');
        if (!response.ok) throw new Error('Failed to fetch analysis history');
        const data = await response.json();
        setHistory(data);
      } catch (error) {
        console.error('Error fetching analysis history:', error);
      }
    };

    fetchHistory();
  }, []);

  const handleClearHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/analysis-history', {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to clear analysis history');
      setHistory([]); // Clear the history in the state
    } catch (error) {
      console.error('Error clearing analysis history:', error);
    }
  };

  // Memoize the vocabulary and sentiment scores
  const vocabulary = useMemo(() => new Map(modelArtifacts.vocabulary), []);
  const sentimentScores = useMemo(() => modelArtifacts.sentimentScores, []);

  // Initialize Gemini AI
  const genAI = new GoogleGenerativeAI("AIzaSyCNBXyQZSJFC1Cf0MrWGZBFm4OvKji7W1o");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Function to summarize overall sentiment from all chat data
  const summarizeChatSentiment = async () => {
    setChatSummaryLoading(true);
    setChatSummaryError(null);
    
    try {
      // Fetch all chat data
      const response = await fetch('http://localhost:5000/chats');
      if (!response.ok) throw new Error('Failed to fetch chat data');
      const chats = await response.json();
      
      if (chats.length === 0) {
        setChatSummary('No chat data available for analysis.');
        return;
      }
      
      // Format chat data for Gemini analysis
      const chatText = chats.map(chat => 
        `User: ${chat.message || chat.content || 'No message'}\nTimestamp: ${chat.timestamp || chat.created_at || 'Unknown'}`
      ).join('\n\n');
      
      const prompt = `Analyze the overall sentiment of these chat conversations. Provide a comprehensive summary including:
      1. Overall sentiment trend (positive, negative, neutral)
      2. Key themes and topics discussed
      3. Emotional patterns observed
      4. Any notable sentiment shifts over time
      5. Overall sentiment score (as a percentage)
      
      Chat conversations:
      ${chatText}`;
      
      const result = await model.generateContent(prompt);
      const summary = result.response.text();
      
      setChatSummary(summary);
    } catch (error) {
      console.error('Error summarizing chat sentiment:', error);
      setChatSummaryError('Failed to generate chat sentiment summary. Please try again.');
    } finally {
      setChatSummaryLoading(false);
    }
  };

  // Function to summarize overall sentiment from all polls data
  const summarizePollsSentiment = async () => {
    setPollsSummaryLoading(true);
    setPollsSummaryError(null);
    
    try {
      // Fetch all polls data
      const response = await fetch('http://localhost:5000/polls');
      if (!response.ok) throw new Error('Failed to fetch polls data');
      const polls = await response.json();
      
      if (polls.length === 0) {
        setPollsSummary('No polls data available for analysis.');
        return;
      }
      
      // Format polls data for Gemini analysis
      const pollsText = polls.map(poll => {
        const totalVotes = Object.values(poll.votes || {}).reduce((a, b) => a + b, 0);
        const voteBreakdown = Object.entries(poll.votes || {})
          .map(([option, votes]) => `${option}: ${votes} votes (${totalVotes > 0 ? ((votes/totalVotes)*100).toFixed(1) : 0}%)`)
          .join(', ');
          
        return `Poll: ${poll.title}
Options: ${poll.options?.join(', ') || 'No options'}
Votes: ${voteBreakdown}
Total Votes: ${totalVotes}
Created: ${poll.created_at || poll.timestamp || 'Unknown'}`;
      }).join('\n\n');
      
      const prompt = `Analyze the overall sentiment and voting patterns from these polls. Provide a comprehensive summary including:
      1. Overall sentiment trend based on voting patterns
      2. Most popular options and themes
      3. Voting participation levels
      4. Any patterns in option preferences
      5. Overall engagement score (as a percentage)
      6. Insights about community preferences
      
      Polls data:
      ${pollsText}`;
      
      const result = await model.generateContent(prompt);
      const summary = result.response.text();
      
      setPollsSummary(summary);
    } catch (error) {
      console.error('Error summarizing polls sentiment:', error);
      setPollsSummaryError('Failed to generate polls sentiment summary. Please try again.');
    } finally {
      setPollsSummaryLoading(false);
    }
  };

  // Add these new functions
  const textToVector = (text) => {
    const vector = new Array(vocabulary.size).fill(0);
    const tokens = nlp.readDoc(text).tokens().out();
    tokens.forEach(token => {
      const index = vocabulary.get(token.toLowerCase());
      if (index !== undefined) {
        vector[index] = 1;
      }
    });
    return vector;
  };

  const predictSentiment = (text) => {
    const vector = textToVector(text);
    const scores = {};
    
    Object.keys(sentimentScores).forEach(sentiment => {
      scores[sentiment] = 0;
    });
    
    Object.keys(scores).forEach(sentiment => {
      scores[sentiment] = vector.reduce((sum, value, index) => {
        return sum + (value * sentimentScores[sentiment][index]);
      }, 0);
    });
    
    const [label, score] = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b);
    const maxScore = Math.max(...Object.values(scores));
    const confidence = maxScore / (Object.values(scores).reduce((a, b) => a + b, 0));
    
    return { label, score, confidence };
  };

  // Replace the existing analyzeSentiment function with this
  const analyzeSentiment = (text) => {
    const result = predictSentiment(text);
    return {
      score: result.score,
      label: result.label,
      confidence: result.confidence
    };
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    
    setLoading(true);
    setError(null);

    try {
      const result = analyzeSentiment(inputText);
      
      const newAnalysis = {
        id: Date.now(),
        text: inputText,
        sentiment: result.label,
        confidence: result.confidence,
        score: result.score,
        timestamp: new Date().toISOString()
      };
      
      setSentiment(result);
      setHistory(prev => [newAnalysis, ...prev]);
      setInputText('');

      // Send the analysis to the backend
      await fetch('http://localhost:5000/analysis-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAnalysis)
      });
    } catch (error) {
      setError('Failed to analyze sentiment');
      console.error('Error analyzing sentiment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Sentiment Analysis</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Analysis Input */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Analyze New Text</h2>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            rows="4"
            placeholder="Enter text to analyze..."
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || !inputText.trim()}
            className="w-full bg-primary text-white py-2 rounded hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Analyze Sentiment'}
          </button>
          
          {error && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {sentiment && (
            <div className={`mt-4 p-4 rounded ${
              sentiment.label === 'Positive' ? 'bg-green-100' :
              sentiment.label === 'Negative' ? 'bg-red-100' : 'bg-gray-100'
            }`}>
              <p className="font-semibold">Sentiment: {sentiment.label}</p>
              <p className="text-sm mt-1">
                Confidence: {(sentiment.confidence * 100).toFixed(1)}%
              </p>
              <p className="text-sm mt-1">
                Score: {sentiment.score}
              </p>
            </div>
          )}
        </div>

        {/* Analysis History */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between mb-4">
            <h2 className="text-lg font-semibold">Analysis History</h2>
            <button
              onClick={handleClearHistory}
              className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
            >
              ↻
            </button>
          </div>
          <div className="space-y-4">
            {history.map((item) => (
              <div 
                key={item.id} 
                className={`p-4 rounded border ${
                  item.sentiment === 'Positive' ? 'border-green-200 bg-green-50' :
                  item.sentiment === 'Negative' ? 'border-red-200 bg-red-50' :
                  'border-gray-200 bg-gray-50'
                }`}
              >
                <p className="mb-2">{item.text}</p>
                <div className="flex justify-between text-sm">
                  <div>
                    <span className="font-medium">Sentiment: {item.sentiment}</span>
                    <span className="text-gray-500 ml-2">
                      ({(item.confidence * 100).toFixed(1)}% confidence)
                    </span>
                  </div>
                  <span className="text-gray-500">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            
            {history.length === 0 && (
              <p className="text-gray-500 text-center">No analysis history yet</p>
            )}
          </div>
        </div>
      </div>

      {/* AI-Powered Sentiment Summaries */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-6">AI-Powered Sentiment Summaries</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Chat Sentiment Summary */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Overall Chat Sentiment</h3>
              <button
                onClick={summarizeChatSentiment}
                disabled={chatSummaryLoading}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {chatSummaryLoading ? 'Analyzing...' : 'Analyze Chats'}
              </button>
            </div>
            
            {chatSummaryError && (
              <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
                {chatSummaryError}
              </div>
            )}
            
            {chatSummary && (
              <div className="mt-4 p-4 bg-blue-50 rounded border-l-4 border-blue-500">
                <h4 className="font-semibold text-blue-800 mb-2">Chat Sentiment Summary</h4>
                <div className="text-gray-700 whitespace-pre-wrap">{chatSummary}</div>
              </div>
            )}
            
            {!chatSummary && !chatSummaryError && !chatSummaryLoading && (
              <p className="text-gray-500 text-center py-8">
                Click "Analyze Chats" to generate an AI-powered sentiment summary of all chat conversations.
              </p>
            )}
          </div>

          {/* Polls Sentiment Summary */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Overall Polls Sentiment</h3>
              <button
                onClick={summarizePollsSentiment}
                disabled={pollsSummaryLoading}
                className="bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 disabled:opacity-50"
              >
                {pollsSummaryLoading ? 'Analyzing...' : 'Analyze Polls'}
              </button>
            </div>
            
            {pollsSummaryError && (
              <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
                {pollsSummaryError}
              </div>
            )}
            
            {pollsSummary && (
              <div className="mt-4 p-4 bg-purple-50 rounded border-l-4 border-purple-500">
                <h4 className="font-semibold text-purple-800 mb-2">Polls Sentiment Summary</h4>
                <div className="text-gray-700 whitespace-pre-wrap">{pollsSummary}</div>
              </div>
            )}
            
            {!pollsSummary && !pollsSummaryError && !pollsSummaryLoading && (
              <p className="text-gray-500 text-center py-8">
                Click "Analyze Polls" to generate an AI-powered sentiment summary of all polls and voting patterns.
              </p>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default SentimentAnalysis;
