// Navbar.jsx
import React, { useState } from 'react';
import { Search, Bell, Mail, Settings, LogOut, Menu, User, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import kecLogo from './kec.jpg';


const Navbar = ({
  searchPlaceholder = 'Search Events...',
  onSearch,
  showSort = true,
  sortOptions = ['Date', 'Category', 'Club'],
  onSort,
  showBackButton = true
}) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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

  const handleBack = () => {
    // Determine where to go based on current location and user role
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/dashboard/admin');
      } else if (user.role === 'club') {
        navigate('/dashboard/club');
      } else {
        navigate('/dashboard/student');
      }
    } else {
      navigate('/');
    }
  };

  // Don't show back button on main dashboard pages or home page
  const shouldShowBackButton = showBackButton && 
    !location.pathname.includes('/dashboard/') && 
    location.pathname !== '/' &&
    location.pathname !== '/login' &&
    location.pathname !== '/signup';

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left - Back Button and Logo */}
          <div className="flex items-center space-x-4">
            {shouldShowBackButton && (
              <button
                onClick={handleBack}
                className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 mr-2"
                title="Go Back"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            )}

            {isAuthenticated && (
              <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
            )}

            <div
              className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
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
              <img src={kecLogo} alt="KEC Logo" className="w-10 h-10 rounded-lg object-cover shadow-sm" />
              <span className="text-xl font-bold text-gray-900 hidden sm:block">KEC Events</span>
            </div>
          </div>

          {/* Center – Search and Sort */}
          <div className="flex-1 max-w-2xl mx-4 sm:mx-8">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {showSort && (
                <select
                  value={sortBy}
                  onChange={(e) => handleSort(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-w-[140px]"
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

          {/* Right - User Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate('/calendar')}
                  className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  title="Calendar"
                >
                  <Bell className="w-5 h-5" />
                </button>

                <button
                  onClick={() => navigate('/contacts')}
                  className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  title="Contacts"
                >
                  <Mail className="w-5 h-5" />
                </button>

                <button 
                  className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  title="Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>

                <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    {user?.name}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:block">Logout</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
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