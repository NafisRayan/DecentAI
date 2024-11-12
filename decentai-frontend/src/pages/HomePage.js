// src/pages/HomePage.js
import React from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';

const FeatureCard = ({ title, description, link, icon }) => (
  <Link to={link} className="transform transition-all hover:scale-105">
    <div className="bg-gray-700 rounded-lg p-6 hover:bg-gray-600 transition-all">
      <div className="text-blue-400 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  </Link>
);

const HomePage = () => {
  const features = [
    {
      title: 'Data Analysis',
      description: 'Analyze your data with AI-powered insights',
      link: '/data-analysis',
      icon: '📊'
    },
    {
      title: 'Group Chat',
      description: 'Collaborate with your team in real-time',
      link: '/group-chat',
      icon: '💬'
    },
    // Add more features...
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 animate-fade-in">
            Welcome to DecentAI
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Your decentralized AI platform for secure data analysis and collaboration
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;