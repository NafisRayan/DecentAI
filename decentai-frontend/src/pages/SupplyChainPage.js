// src/pages/SupplyChainPage.js
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { FiBox, FiTruck, FiMapPin, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const ShipmentCard = ({ id, status, origin, destination, timestamp, temperature }) => (
  <div className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
    <div className="flex justify-between items-start mb-3">
      <h3 className="text-white font-semibold">Shipment #{id}</h3>
      <span className={`px-2 py-1 rounded-full text-xs ${
        status === 'in-transit' ? 'bg-blue-600 text-white' :
        status === 'delivered' ? 'bg-green-600 text-white' :
        'bg-yellow-600 text-white'
      }`}>
        {status === 'in-transit' ? 'In Transit' :
         status === 'delivered' ? 'Delivered' :
         'Pending'}
      </span>
    </div>
    <div className="space-y-2 text-gray-300 text-sm">
      <div className="flex items-center space-x-2">
        <FiMapPin className="text-gray-400" />
        <span>From: {origin}</span>
      </div>
      <div className="flex items-center space-x-2">
        <FiMapPin className="text-gray-400" />
        <span>To: {destination}</span>
      </div>
      <div className="flex items-center space-x-2">
        <FiClock className="text-gray-400" />
        <span>Updated: {timestamp}</span>
      </div>
      <div className="flex items-center space-x-2">
        <FiBox className="text-gray-400" />
        <span>Temperature: {temperature}°C</span>
      </div>
    </div>
  </div>
);

const SupplyChainPage = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  
  const mockShipments = [
    {
      id: "SHP001",
      status: "in-transit",
      origin: "New York, USA",
      destination: "London, UK",
      timestamp: "2024-03-15 14:30:22",
      temperature: 4.5
    },
    {
      id: "SHP002",
      status: "delivered",
      origin: "Tokyo, Japan",
      destination: "Seoul, Korea",
      timestamp: "2024-03-15 12:15:45",
      temperature: 5.2
    }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Supply Chain Tracker</h2>
            <p className="text-gray-400">Monitor and track shipments with blockchain verification</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <FiTruck className="w-5 h-5" />
            <span>New Shipment</span>
          </button>
        </div>

        {/* Status Filter */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <span className="text-gray-300">Filter by status:</span>
            <div className="flex space-x-4">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg ${
                  statusFilter === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                All Shipments
              </button>
              <button
                onClick={() => setStatusFilter('in-transit')}
                className={`px-4 py-2 rounded-lg ${
                  statusFilter === 'in-transit' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                In Transit
              </button>
              <button
                onClick={() => setStatusFilter('delivered')}
                className={`px-4 py-2 rounded-lg ${
                  statusFilter === 'delivered' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                Delivered
              </button>
            </div>
          </div>
        </div>

        {/* Shipments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockShipments
            .filter(shipment => statusFilter === 'all' || shipment.status === statusFilter)
            .map((shipment, index) => (
              <ShipmentCard key={index} {...shipment} />
            ))}
        </div>

        {/* Blockchain Verification */}
        <div className="bg-gray-800 rounded-lg p-6 mt-8">
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

export default SupplyChainPage;