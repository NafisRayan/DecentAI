import { useState, useEffect } from 'react';
import demoData from '../data/db.json';

function Polls() {
  const [polls, setPolls] = useState([]);
  const [votedPolls, setVotedPolls] = useState(new Set());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPoll, setNewPoll] = useState({
    title: '',
    options: ['', '']
  });

  useEffect(() => {
    setPolls(demoData.polls);
  }, []);

  const handleVote = (pollId, option) => {
    if (votedPolls.has(pollId)) return;

    setPolls(polls.map(poll => {
      if (poll.id === pollId) {
        return {
          ...poll,
          votes: {
            ...poll.votes,
            [option]: (poll.votes[option] || 0) + 1
          }
        };
      }
      return poll;
    }));

    setVotedPolls(new Set([...votedPolls, pollId]));
  };

  const getTotalVotes = (votes) => {
    return Object.values(votes).reduce((a, b) => a + b, 0);
  };

  const handleCreatePoll = (e) => {
    e.preventDefault();
    const pollId = Date.now();
    const newPollData = {
      id: pollId,
      title: newPoll.title,
      options: newPoll.options.filter(opt => opt.trim() !== ''),
      votes: {}
    };

    setPolls([...polls, newPollData]);
    setShowCreateForm(false);
    setNewPoll({ title: '', options: ['', ''] });
  };

  const addOption = () => {
    setNewPoll({
      ...newPoll,
      options: [...newPoll.options, '']
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Polls</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
        >
          {showCreateForm ? 'Cancel' : 'Create Poll'}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreatePoll} className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Poll Title</label>
            <input
              type="text"
              value={newPoll.title}
              onChange={(e) => setNewPoll({ ...newPoll, title: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Options</label>
            {newPoll.options.map((option, index) => (
              <input
                key={index}
                type="text"
                value={option}
                onChange={(e) => {
                  const newOptions = [...newPoll.options];
                  newOptions[index] = e.target.value;
                  setNewPoll({ ...newPoll, options: newOptions });
                }}
                className="w-full p-2 border rounded mb-2"
                required
              />
            ))}
            <button
              type="button"
              onClick={addOption}
              className="text-primary hover:underline text-sm"
            >
              + Add Option
            </button>
          </div>

          <button
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
          >
            Create Poll
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {polls.map((poll) => (
          <div key={poll.id} className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">{poll.title}</h2>
            
            <div className="space-y-3">
              {poll.options.map((option) => {
                const votes = poll.votes[option] || 0;
                const totalVotes = getTotalVotes(poll.votes);
                const percentage = totalVotes ? Math.round((votes / totalVotes) * 100) : 0;
                
                return (
                  <div key={option} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span>{option}</span>
                      <span className="text-sm text-gray-500">{votes} votes</span>
                    </div>
                    <div className="relative h-4 bg-gray-200 rounded">
                      <div
                        className="absolute h-full bg-primary rounded"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    {!votedPolls.has(poll.id) && (
                      <button
                        onClick={() => handleVote(poll.id, option)}
                        className="text-sm text-primary hover:underline"
                      >
                        Vote
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            
            <p className="mt-4 text-sm text-gray-500">
              Total votes: {getTotalVotes(poll.votes)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Polls; 