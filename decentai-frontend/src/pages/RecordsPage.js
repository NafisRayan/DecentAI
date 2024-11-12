// src/pages/RecordsPage.js
import React, { useState } from 'react';
import Layout from '../components/Layout';

const RecordsPage = () => {
  const [recordType, setRecordType] = useState('medical');

  return (
    <Layout>
      <div className="p-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Secure Records Management</h2>
          
          {/* Record Type Selector */}
          <div className="flex space-x-4 mb-6">
            <button 
              className={`px-4 py-2 rounded-lg ${
                recordType === 'medical' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300'
              }`}
              onClick={() => setRecordType('medical')}
            >
              Medical Records
            </button>
            <button 
              className={`px-4 py-2 rounded-lg ${
                recordType === 'banking' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300'
              }`}
              onClick={() => setRecordType('banking')}
            >
              Banking Records
            </button>
          </div>

          {/* Records Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Record Cards */}
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-white font-semibold">Record #12345</h3>
                <span className="bg-green-600 text-xs text-white px-2 py-1 rounded">Verified</span>
              </div>
              <p className="text-gray-300 text-sm mb-4">Last updated: 2024-03-15</p>
              <div className="flex justify-between">
                <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded">
                  View Details
                </button>
                <button className="bg-gray-600 hover:bg-gray-500 text-white text-sm px-3 py-1 rounded">
                  Download
                </button>
              </div>
            </div>
            {/* Add more record cards */}
          </div>

          {/* Upload Section */}
          <div className="mt-6 bg-gray-700 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-4">Upload New Record</h3>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
              <p className="text-gray-300 mb-2">Drag and drop files here or</p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                Browse Files
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RecordsPage;