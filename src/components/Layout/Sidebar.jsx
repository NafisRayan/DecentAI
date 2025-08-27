import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  CurrencyDollarIcon, 
  ChatBubbleLeftIcon,
  ChartBarIcon,
  SparklesIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const navigation = [
    { name: 'Dashboard', icon: HomeIcon, path: '/' },
    { name: 'Currency Points', icon: CurrencyDollarIcon, path: '/points' },
    { name: 'Chat', icon: ChatBubbleLeftIcon, path: '/chat' },
    { name: 'AI Chat', icon: SparklesIcon, path: '/ai-chat' },
    { name: 'Polls', icon: ChartBarIcon, path: '/polls' },
    { name: 'Data Analytics', icon: ChartBarIcon, path: '/data-analytics' },
    { name: 'Sentiment Analysis', icon: ChartBarIcon, path: '/sentiment-analysis' },
    { name: 'Settings', icon: CogIcon, path: '/user-settings' },
    
  ];

  return (
    <div className={`bg-gray-800 text-white h-screen transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4">
        <button onClick={() => setCollapsed(!collapsed)} className="w-full text-center">
          {collapsed ? '☰' : '☰ DecentAI'}
        </button>
      </div>
      
      <nav className="mt-8">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 mt-2 ${
                isActive ? 'bg-gray-700' : 'hover:bg-gray-700'
              }`
            }
          >
            <item.icon className="w-6 h-6" />
            {!collapsed && <span className="ml-3">{item.name}</span>}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar; 