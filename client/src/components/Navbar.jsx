// Navbar.jsx
import React, { useState } from 'react';
import { Search, Bell, Mail, Settings, LogOut, Menu, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = ({
  searchPlaceholder = 'Search Events...',
  onSearch,
  showSort = true,
  sortOptions = ['Date', 'Category', 'Club'],
  onSort
}) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
  };

  const handleSort = (option) => {
    setSortBy(option);
    if (onSort) onSort(option);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <button className="md:hidden">
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
            )}

            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() =>
                // if logged in, go to the right dashboard; else go home
                isAuthenticated
                  ? navigate(
                      user?.role === 'club'
                        ? '/dashboard/club'
                        : '/dashboard/student'
                    )
                  : navigate('/')
              } >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">KEC</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Events</span>
            </div>
          </div>

          {/* Center – Search */}
          <div className="flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="flex space-x-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {showSort && (
                <select
                  value={sortBy}
                  onChange={(e) => handleSort(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sort by...</option>
                  {sortOptions.map((option) => (
                    <option key={option} value={option.toLowerCase()}>
                      {option}
                    </option>
                  ))}
                </select>
              )}
            </form>
          </div>

          {/* Right */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate('/calendar')}
                  className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Bell className="w-6 h-6" />
                </button>

                <button
                  onClick={() => navigate('/contacts')}
                  className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Mail className="w-6 h-6" />
                </button>

                <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <Settings className="w-6 h-6" />
                </button>

                <div className="flex items-center space-x-2">
                  <User className="w-6 h-6 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
