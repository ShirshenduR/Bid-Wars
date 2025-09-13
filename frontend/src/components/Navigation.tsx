import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="bg-indigo-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-white text-xl font-bold">
              Bid Wars
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-white hover:text-indigo-200 px-3 py-2 rounded-md text-sm font-medium"
            >
              {user.role === 'admin' ? 'Dashboard' : 'Bidding'}
            </Link>
            
            {user.role === 'admin' && (
              <Link
                to="/admin/create-item"
                className="text-white hover:text-indigo-200 px-3 py-2 rounded-md text-sm font-medium"
              >
                Create Item
              </Link>
            )}
            
            <div className="flex items-center space-x-2">
              <span className="text-white text-sm">
                Welcome, {user.username} ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="bg-indigo-700 hover:bg-indigo-800 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;