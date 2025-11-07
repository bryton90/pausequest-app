import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiSettings, FiUser, FiMenu, FiX, FiClock, FiBarChart2, FiList } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path 
      ? 'bg-primary text-white' 
      : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary';
  };

  const navItems = [
    { path: '/', label: 'Timer', icon: <FiClock className="mr-2" /> },
    { path: '/stats', label: 'Stats', icon: <FiBarChart2 className="mr-2" /> },
    { path: '/history', label: 'History', icon: <FiList className="mr-2" /> },
  ];

  return (
    <nav className="bg-bg-secondary border-b border-border-color">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="text-primary font-bold text-xl">PauseQuest</Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${isActive(item.path)}`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 space-x-2">
              <Link
                to="/settings"
                className={`p-2 rounded-full ${location.pathname === '/settings' ? 'text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                title="Settings"
              >
                <FiSettings className="h-5 w-5" />
              </Link>
              <Link
                to="/profile"
                className={`p-2 rounded-full ${location.pathname === '/profile' ? 'text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                title="Profile"
              >
                {user?.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'Profile'} 
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                    <FiUser className="h-4 w-4" />
                  </div>
                )}
              </Link>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <div className="flex items-center space-x-2 mr-2">
              <Link
                to="/settings"
                className={`p-2 rounded-full ${location.pathname === '/settings' ? 'text-primary' : 'text-text-secondary'}`}
                title="Settings"
              >
                <FiSettings className="h-5 w-5" />
              </Link>
              <Link
                to="/profile"
                className={`p-2 rounded-full ${location.pathname === '/profile' ? 'text-primary' : 'text-text-secondary'}`}
                title="Profile"
              >
                {user?.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'Profile'} 
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                    <FiUser className="h-4 w-4" />
                  </div>
                )}
              </Link>
            </div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <FiX className="block h-6 w-6" /> : <FiMenu className="block h-6 w-6" />}
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state. */}
      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-3 py-2 rounded-md text-base font-medium flex items-center ${isActive(item.path)}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
