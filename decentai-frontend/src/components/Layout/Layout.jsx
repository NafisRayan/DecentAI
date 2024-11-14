import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children, isAdmin }) => {
  return (
    <div className="flex h-screen">
      <Sidebar isAdmin={isAdmin} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={{ name: "Demo User", avatar: "/default-avatar.png" }} />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout; 