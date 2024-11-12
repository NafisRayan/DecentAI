// src/pages/SettingsPage.js
import React from 'react';
import Layout from '../components/Layout';

const SettingSection = ({ title, children }) => (
  <div className="bg-gray-700 rounded-lg p-6 mb-6">
    <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
    {children}
  </div>
);

const SettingsPage = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-8">Settings</h2>
        
        <SettingSection title="Profile Settings">
          <div className="space-y-4">
            <div>
              <label className="text-gray-300 block mb-2">Display Name</label>
              <input 
                type="text" 
                className="w-full bg-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-gray-300 block mb-2">Profile Picture</label>
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-600 rounded-full"></div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                  Upload New
                </button>
              </div>
            </div>
          </div>
        </SettingSection>

        <SettingSection title="Preferences">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Dark Mode</span>
              <div className="w-12 h-6 bg-blue-600 rounded-full p-1 cursor-pointer">
                <div className="bg-white w-4 h-4 rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Notifications</span>
              <div className="w-12 h-6 bg-blue-600 rounded-full p-1 cursor-pointer">
                <div className="bg-white w-4 h-4 rounded-full"></div>
              </div>
            </div>
          </div>
        </SettingSection>

        <SettingSection title="Security">
          <div className="space-y-4">
            <button className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg w-full">
              Change Password
            </button>
            <button className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg w-full">
              Two-Factor Authentication
            </button>
          </div>
        </SettingSection>
      </div>
    </Layout>
  );
};

export default SettingsPage;