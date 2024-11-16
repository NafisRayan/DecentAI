import { useState, useMemo } from 'react';
import wink from 'wink-nlp';
import model from 'wink-eng-lite-web-model';
import modelArtifacts from '../contexts/model_artifacts.json';

// Initialize wink-nlp outside the component
const nlp = wink(model);

function SentimentAnalysis() {
  const [inputText, setInputText] = useState('');
  const [sentiment, setSentiment] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Memoize the vocabulary and sentiment scores
  const vocabulary = useMemo(() => new Map(modelArtifacts.vocabulary), []);
  const sentimentScores = useMemo(() => modelArtifacts.sentimentScores, []);

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

  const handleAnalyze = () => {
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
          <h2 className="text-lg font-semibold mb-4">Analysis History</h2>
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
    </div>
  );
}

export default SentimentAnalysis;
