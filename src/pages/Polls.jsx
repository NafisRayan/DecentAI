import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

function Polls() {
  const { user } = useAuth();
  const [polls, setPolls] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPoll, setNewPoll] = useState({ title: '', options: ['', ''] });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      const response = await fetch('http://localhost:5000/polls');
      const data = await response.json();
      setPolls(data);
    } catch (error) {
      console.error('Error fetching polls:', error);
      setError('Failed to load polls');
    }
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    if (!newPoll.title || newPoll.options.some(opt => !opt.trim())) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/polls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: newPoll.title,
          options: newPoll.options.filter(opt => opt.trim()),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPolls(prev => [...prev, data]);
        setNewPoll({ title: '', options: ['', ''] });
        setShowCreateModal(false);
        setError('');
      }
    } catch (error) {
      console.error('Error creating poll:', error);
      setError('Failed to create poll');
    }
  };

  const handleVote = async (pollId, option) => {
    const poll = polls.find(p => p.id === pollId);
    if (poll.voters && poll.voters.some(voterId => voterId.$oid === user.id.$oid)) {
      setError('You have already voted on this poll');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/polls/${pollId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          option,
          userId: user.id.$oid
        }),
      });

      if (response.ok) {
        const updatedPoll = await response.json();
        setPolls(prev => prev.map(poll => 
          poll.id === pollId ? updatedPoll : poll
        ));
        setError('');
      }
    } catch (error) {
      console.error('Error voting:', error);
      setError('Failed to submit vote');
    }
  };

  const calculatePercentage = (votes, option) => {
    const total = Object.values(votes).reduce((sum, count) => sum + count, 0);
    return total === 0 ? 0 : Math.round((votes[option] / total) * 100);
  };

  const hasVoted = (pollId) => {
    const poll = polls.find(p => p.id === pollId);
    return poll?.voters?.some(voterId => voterId && voterId.$oid && user.id && user.id.$oid && voterId.$oid === user.id.$oid);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Polls</h1>
        <button
          onClick={() => setShowCreateModal(!showCreateModal)}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
        >
          {showCreateModal ? 'Cancel' : 'Create Poll'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showCreateModal && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Create New Poll</h2>
          <form onSubmit={handleCreatePoll}>
            <input
              type="text"
              value={newPoll.title}
              onChange={(e) => setNewPoll(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Poll Question"
              className="w-full p-2 border rounded mb-4"
            />
            
            <div className="space-y-2 mb-4">
              {newPoll.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => setNewPoll(prev => ({
                      ...prev,
                      options: prev.options.map((opt, i) => i === index ? e.target.value : opt)
                    }))}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 p-2 border rounded"
                  />
                  {index > 1 && (
                    <button
                      type="button"
                      onClick={() => setNewPoll(prev => ({
                        ...prev,
                        options: prev.options.filter((_, i) => i !== index)
                      }))}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {newPoll.options.length < 6 && (
              <button
                type="button"
                onClick={() => setNewPoll(prev => ({
                  ...prev,
                  options: [...prev.options, '']
                }))}
                className="flex items-center gap-1 text-primary hover:text-primary/80 mb-4"
              >
                <span className="text-xl">+</span>
                <span>Add Option</span>
              </button>
            )}
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
              >
                Create Poll
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {polls.map((poll) => (
          <div key={poll.id} className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">{poll.title}</h2>
            <div className="space-y-3">
              {poll.options.map((option) => (
                <div key={option} className="space-y-2">
                  <button
                    onClick={() => handleVote(poll.id, option)}
                    disabled={hasVoted(poll.id)}
                    className={`w-full text-left p-3 rounded border transition-colors relative overflow-hidden
                      ${hasVoted(poll.id) 
                        ? 'bg-gray-100 cursor-not-allowed' 
                        : 'hover:bg-gray-50 cursor-pointer'
                      }`}
                  >
                    <div className="relative z-10 flex justify-between items-center">
                      <span>{option}</span>
                      <span className="text-sm text-gray-500">
                        {calculatePercentage(poll.votes, option)}%
                      </span>
                    </div>
                    <div 
                      className="absolute inset-0 bg-primary/10 transition-all duration-300"
                      style={{ width: `${calculatePercentage(poll.votes, option)}%` }}
                    />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-gray-500">
              {hasVoted(poll.id) ? (
                <span className="text-primary">You have voted on this poll</span>
              ) : (
                <span>Click an option to vote</span>
              )}
              <span className="float-right">
                Total votes: {Object.values(poll.votes).reduce((a, b) => a + b, 0)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Polls; 