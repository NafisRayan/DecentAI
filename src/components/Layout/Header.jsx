const Header = ({ user }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <img className="h-8 w-auto" src="/logo.png" alt="Logo" />
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            {/* Notification bell icon */}
            <button className="p-1 rounded-full hover:bg-gray-100">
              <span className="sr-only">View notifications</span>
              {/* Add notification icon */}
            </button>
          </div>
          
          <div className="flex items-center">
            <img
              className="h-8 w-8 rounded-full"
              src={user?.avatar || '/default-avatar.png'}
              alt=""
            />
            <span className="ml-2 text-gray-700">{user?.name}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 