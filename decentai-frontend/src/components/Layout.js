import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiHome, FiDatabase, FiActivity, FiLock, 
         FiMessageSquare, FiTruck, FiCheckSquare, FiHelpCircle, FiFileText, FiList, FiMessageCircle, FiSettings } from 'react-icons/fi';

const NavItem = ({ to, icon: Icon, label, isActive }) => (
  <Link
    to={to}
    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
      ${isActive ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </Link>
);

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { to: '/', icon: FiHome, label: 'Dashboard' },
    { to: '/blockchain-logs', icon: FiFileText, label: 'Logs' },

    { to: '/data-analysis', icon: FiActivity, label: 'Analysis' },
    { to: '/records', icon: FiLock, label: 'Records' },
    { to: '/data-upload', icon: FiDatabase, label: 'Upload Data' },
    { to: '/supply-chain', icon: FiTruck, label: 'Supply Chain' },
    { to: '/group-chat', icon: FiMessageSquare, label: 'Group Chat' },
    { to: '/voting', icon: FiCheckSquare, label: 'Voting' },
    { to: '/settings', icon: FiSettings, label: 'Settings' },
    { to: '/help', icon: FiHelpCircle, label: 'Help' },
  ];

  return (
    <div className="flex h-screen bg-gray-900 w-screen overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - adjusted width */}
      <div
        className={`fixed inset-y-0 w-[20%] max-w-[300px] min-w-[250px] bg-gray-800 transform transition-transform duration-200 ease-in-out z-30 
          lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between h-[8%] px-[5%] bg-gray-900">
          <h1 className="text-xl font-bold text-white">DecentAI</h1>
          <button
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-4 px-2 space-y-1">
          {navigation.map((item) => (
            <NavItem
              key={item.to}
              {...item}
              isActive={location.pathname === item.to}
            />
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - adjusted padding */}
        <header className="h-[8vh] bg-gray-800 border-b border-gray-700 flex items-center px-[2%]">
          <button
            className="text-gray-400 hover:text-white lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <FiMenu className="w-6 h-6" />
          </button>
          
          {/* User profile section */}
          <div className="ml-auto flex items-center space-x-4">
            <div className="relative">
              <button className="flex items-center space-x-2 text-gray-300 hover:text-white">
                <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                <span className="hidden md:inline">John Doe</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main content area - adjusted padding */}
        <main className="flex-1 overflow-y-auto bg-gray-900 h-[92vh]">
          <div className="px-[3%] py-[2%]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 