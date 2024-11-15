import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

function Polls() {
  const { user } = useAuth();
  const [polls, setPolls] = useState([]);

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const response = await fetch('http://localhost:5000/polls');
        const data = await response.json();
        setPolls(data);
      } catch (error) {
        console.error('Error fetching polls:', error);
      }
    };

    fetchPolls();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Polls</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {polls.map((poll) => (
          <div key={poll.id} className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">{poll.title}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Polls; 