// src/pages/DataUploadPage.js
import React, { useState, useCallback } from 'react';
import Layout from '../components/Layout';
import { FiUploadCloud, FiDatabase, FiLink, FiCheckCircle } from 'react-icons/fi';

const DataSourceCard = ({ title, description, icon: Icon, onClick, isActive }) => (
  <button
    onClick={onClick}
    className={`w-full p-6 rounded-lg text-left transition-all ${
      isActive ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
    }`}
  >
    <Icon className={`w-8 h-8 mb-4 ${isActive ? 'text-white' : 'text-blue-400'}`} />
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-300 text-sm">{description}</p>
  </button>
);

const DataUploadPage = () => {
  const [selectedSource, setSelectedSource] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = [...e.dataTransfer.files];
    if (files && files.length > 0) {
      handleFiles(files);
    }
  }, []);

  const handleFiles = (files) => {
    // Simulate file upload progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">Data Upload & Collection</h2>
          <p className="text-gray-300">Select a data source or upload files directly to begin analysis</p>
        </div>

        {/* Data Source Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <DataSourceCard
            title="File Upload"
            description="Upload local files or documents"
            icon={FiUploadCloud}
            onClick={() => setSelectedSource('file')}
            isActive={selectedSource === 'file'}
          />
          <DataSourceCard
            title="Database Connection"
            description="Connect to external databases"
            icon={FiDatabase}
            onClick={() => setSelectedSource('database')}
            isActive={selectedSource === 'database'}
          />
          <DataSourceCard
            title="API Integration"
            description="Connect via REST or GraphQL APIs"
            icon={FiLink}
            onClick={() => setSelectedSource('api')}
            isActive={selectedSource === 'api'}
          />
        </div>

        {/* Upload Area */}
        {selectedSource === 'file' && (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${dragActive ? 'border-blue-500 bg-blue-500 bg-opacity-10' : 'border-gray-600'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <FiUploadCloud className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-300 mb-4">
              Drag and drop your files here, or{' '}
              <button className="text-blue-400 hover:text-blue-300">browse</button>
            </p>
            <p className="text-sm text-gray-400">
              Supports CSV, JSON, XML, and Excel files up to 100MB
            </p>

            {/* Upload Progress */}
            {uploadProgress > 0 && (
              <div className="mt-6 max-w-md mx-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">Uploading...</span>
                  <span className="text-sm text-gray-300">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 rounded-full h-2 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Database Connection Form */}
        {selectedSource === 'database' && (
          <div className="bg-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Database Connection</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Database Type</label>
                <select className="w-full bg-gray-600 text-white rounded-lg px-4 py-2">
                <option>SQLite</option>
                <option>MongoDB</option>
                <option>JSON</option>
                <option>MySQL</option>
                <option>PostgreSQL</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Connection String</label>
                <input
                  type="text"
                  className="w-full bg-gray-600 text-white rounded-lg px-4 py-2"
                  placeholder="Enter connection string"
                />
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                Connect
              </button>
            </div>
          </div>
        )}

        {/* API Integration Form */}
        {selectedSource === 'api' && (
          <div className="bg-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">API Integration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">API Endpoint</label>
                <input
                  type="text"
                  className="w-full bg-gray-600 text-white rounded-lg px-4 py-2"
                  placeholder="Enter API endpoint"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Authentication Token</label>
                <input
                  type="password"
                  className="w-full bg-gray-600 text-white rounded-lg px-4 py-2"
                  placeholder="Enter API key or token"
                />
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                Connect API
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DataUploadPage;