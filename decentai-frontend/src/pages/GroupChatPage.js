// src/pages/GroupChatPage.js
import React from 'react';
import Layout from '../components/Layout';

const GroupChatPage = () => {
  return (
    <Layout>
      <div className="flex h-[calc(100vh-2rem)]">
        {/* Sidebar */}
        <div className="w-64 bg-gray-700 rounded-l-lg overflow-y-auto">
          <div className="p-4">
            <h3 className="text-white font-semibold mb-4">Channels</h3>
            <div className="space-y-2">
              {/* Channel list */}
              <div className="flex items-center space-x-2 p-2 hover:bg-gray-600 rounded cursor-pointer">
                <span className="text-gray-300">#</span>
                <span className="text-gray-300">general</span>
              </div>
              {/* Add more channels */}
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-gray-800 rounded-r-lg">
          {/* Chat header */}
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">#general</h2>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Message components */}
          </div>

          {/* Input area */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Message #general"
                className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 transition-colors">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default GroupChatPage;