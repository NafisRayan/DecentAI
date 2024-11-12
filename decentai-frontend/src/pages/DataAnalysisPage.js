// src/pages/DataAnalysisPage.js
import React, { useState } from 'react';
import Layout from '../components/Layout';

const DataAnalysisPage = () => {
  const [selectedDataset, setSelectedDataset] = useState('');
  const [analysisType, setAnalysisType] = useState('');

  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Data Analysis Dashboard</h2>
          
          {/* Dataset Selection */}
          <div className="mb-6">
            <label className="block text-gray-300 mb-2">Select Dataset</label>
            <select 
              className="w-full bg-gray-700 text-white rounded-lg p-3"
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
            >
              <option value="">Choose a dataset</option>
              <option value="medical">Medical Records</option>
              <option value="transactions">Transaction Data</option>
              <option value="traffic">Traffic Data</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Analysis Options */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Analysis Type</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-gray-300">
                  <input type="radio" name="analysis" value="pattern" />
                  <span>Pattern Recognition</span>
                </label>
                <label className="flex items-center space-x-2 text-gray-300">
                  <input type="radio" name="analysis" value="sentiment" />
                  <span>Sentiment Analysis</span>
                </label>
                <label className="flex items-center space-x-2 text-gray-300">
                  <input type="radio" name="analysis" value="prediction" />
                  <span>Predictive Analysis</span>
                </label>
              </div>
            </div>

            {/* Visualization Options */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Visualizations</h3>
              <div className="space-y-4">
                <div className="h-40 bg-gray-600 rounded-lg flex items-center justify-center text-gray-400">
                  Chart Preview
                </div>
                <select className="w-full bg-gray-600 text-white rounded-lg p-2">
                  <option>Line Chart</option>
                  <option>Bar Chart</option>
                  <option>Scatter Plot</option>
                </select>
              </div>
            </div>

            {/* Results */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Analysis Results</h3>
              <div className="space-y-2 text-gray-300">
                <div className="bg-gray-600 rounded-lg p-3">
                  <p className="font-semibold">Key Insights</p>
                  <ul className="list-disc list-inside mt-2 text-sm">
                    <li>Pattern 1</li>
                    <li>Pattern 2</li>
                    <li>Pattern 3</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Blockchain Verification */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Blockchain Verification</h3>
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-gray-300 text-sm mb-2">Last verified: 2 minutes ago</p>
            <div className="flex space-x-4">
              <button className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2">
                Verify Data Integrity
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2">
                View Blockchain Log
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DataAnalysisPage;