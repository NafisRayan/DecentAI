import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  CurrencyDollarIcon, 
  ChatBubbleLeftIcon,
  ChartBarIcon,
  UserIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ isAdmin }) => {
  const [collapsed, setCollapsed] = useState(false);

  const navigation = [
    { name: 'Dashboard', icon: HomeIcon, path: '/' },
    { name: 'Currency Points', icon: CurrencyDollarIcon, path: '/points' },
    { name: 'Chat', icon: ChatBubbleLeftIcon, path: '/chat' },
    { name: 'Polls', icon: ChartBarIcon, path: '/polls' },
    { name: 'Profile', icon: UserIcon, path: '/profile' },
  ];

  const adminNavigation = [
    { name: 'Admin Dashboard', icon: HomeIcon, path: '/admin' },
    { name: 'User Management', icon: UserIcon, path: '/admin/users' },
    { name: 'Settings', icon: CogIcon, path: '/admin/settings' },
  ];

  return (
    <div className={`bg-gray-800 text-white h-screen transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4">
        <button onClick={() => setCollapsed(!collapsed)} className="w-full text-center">
          {collapsed ? '→' : '←'}
        </button>
      </div>
      
      <nav className="mt-8">
        {(isAdmin ? [...navigation, ...adminNavigation] : navigation).map((item) => (
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