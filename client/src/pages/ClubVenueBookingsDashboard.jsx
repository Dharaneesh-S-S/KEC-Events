import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Filter,
  Search,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { bookingsAPI } from '../services/api';

const ClubVenueBookingsDashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Bookings data
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [venueFilter, setVenueFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [bookingsPerPage] = useState(10);

  // Real-time updates
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Load bookings on component mount
  useEffect(() => {
    loadBookings();
    
    // Set up real-time updates (polling every 30 seconds)
    const interval = setInterval(() => {
      loadBookings();
      setLastUpdated(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [bookings, searchQuery, statusFilter, venueFilter, dateRangeFilter]);

  const loadBookings = async () => {
    try {
      setLoadingBookings(true);
      const clubId = user?.id || user?._id;
      if (!clubId) {
        console.warn('No user.id found for club bookings fetch');
        setBookings([]);
        return;
      }
      const response = await bookingsAPI.getByClub(clubId);
      setBookings(response.bookings || response || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
      alert('Failed to load club bookings: ' + (error?.message || 'Unknown error'));
    } finally {
      setLoadingBookings(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bookings];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(booking =>
        booking.eventName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.venue?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.facultyInCharge?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Venue filter
    if (venueFilter) {
      filtered = filtered.filter(booking => booking.venue?.venueType === venueFilter);
    }

    // Date range filter
    if (dateRangeFilter) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.fromDate);
        switch (dateRangeFilter) {
          case 'today':
            return bookingDate.toDateString() === today.toDateString();
          case 'tomorrow':
            return bookingDate.toDateString() === tomorrow.toDateString();
          case 'next-week':
            return bookingDate >= today && bookingDate <= nextWeek;
          case 'next-month':
            return bookingDate >= today && bookingDate <= nextMonth;
          case 'past':
            return bookingDate < today;
          default:
            return true;
        }
      });
    }

    setFilteredBookings(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getVenueTypeBadge = (venueType) => {
    const typeConfig = {
      cc: { color: 'bg-blue-100 text-blue-800', label: 'Computer Center' },
      seminar: { color: 'bg-green-100 text-green-800', label: 'Seminar Hall' },
      maharaja: { color: 'bg-purple-100 text-purple-800', label: 'Maharaja Hall' },
      convention: { color: 'bg-orange-100 text-orange-800', label: 'Convention Center' },
      other: { color: 'bg-gray-100 text-gray-800', label: 'Other' }
    };

    const config = typeConfig[venueType] || typeConfig.other;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const handleViewBooking = (booking) => {
    // Navigate to booking details or open modal
    console.log('View booking:', booking);
  };

  const handleEditBooking = (booking) => {
    // Navigate to edit booking form
    if (booking.status === 'pending') {
      navigate(`/club/edit-booking/${booking._id}`);
    } else {
      alert('Only pending bookings can be edited.');
    }
  };

  const handleCancelBooking = async (booking) => {
    if (!confirm(`Are you sure you want to cancel the booking for "${booking.eventName}"?`)) {
      return;
    }

    try {
      await bookingsAPI.updateStatus(booking._id, 'cancelled');
      alert('Booking cancelled successfully!');
      loadBookings(); // Refresh the list
    } catch (error) {
      alert('Failed to cancel booking: ' + error.message);
    }
  };

  const handleDeleteBooking = async (booking) => {
    if (!confirm(`Are you sure you want to delete the booking for "${booking.eventName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await bookingsAPI.delete(booking._id);
      alert('Booking deleted successfully!');
      loadBookings(); // Refresh the list
    } catch (error) {
      alert('Failed to delete booking: ' + error.message);
    }
  };

  // Pagination
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Statistics
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    approved: bookings.filter(b => b.status === 'approved').length,
    rejected: bookings.filter(b => b.status === 'rejected').length,
    upcoming: bookings.filter(b => new Date(b.fromDate) > new Date()).length
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-0">
        {/* Navbar */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">KEC</div>
              <span className="text-xl font-bold">Fests</span>
            </div>
            <span className="text-lg font-medium text-gray-700">Venue Bookings Dashboard</span>
            <button onClick={logout} className="px-4 py-2 bg-red-600 text-white rounded-lg">Logout</button>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Venue Bookings</h1>
                <p className="text-lg text-gray-600">Manage your club's venue bookings and reservations</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={loadBookings}
                  disabled={loadingBookings}
                  className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loadingBookings ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                {/* Removed Enhanced New Booking button */}
                <button
                  onClick={() => navigate('/club/venue-bookings')}
                  className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors"
                >
                  View My Bookings
                </button>
              </div>
            </div>

            {/* Last Updated */}
            <div className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
          {/* Enhanced Venue Booking section removed */}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                </div>
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Upcoming</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Venue Type Filter */}
              <select
                value={venueFilter}
                onChange={(e) => setVenueFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Venues</option>
                <option value="cc">Computer Center</option>
                <option value="seminar">Seminar Hall</option>
                <option value="maharaja">Maharaja Hall</option>
                <option value="convention">Convention Center</option>
                <option value="other">Other</option>
              </select>

              {/* Date Range Filter */}
              <select
                value={dateRangeFilter}
                onChange={(e) => setDateRangeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Dates</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="next-week">Next Week</option>
                <option value="next-month">Next Month</option>
                <option value="past">Past</option>
              </select>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('');
                  setVenueFilter('');
                  setDateRangeFilter('');
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                My Booked Venues ({filteredBookings.length})
              </h2>
            </div>

            {loadingBookings ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading bookings...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery || statusFilter || venueFilter || dateRangeFilter 
                    ? 'Try adjusting your filters or search criteria.'
                    : 'You haven\'t made any venue bookings yet.'
                  }
                </p>
                {!searchQuery && !statusFilter && !venueFilter && !dateRangeFilter && (
                  <button
                    onClick={() => navigate('/club/venue-booking/enhanced')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Make Your First Booking
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Event Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Venue
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentBookings.map((booking) => (
                        <tr key={booking._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900 mb-1">
                                {booking.eventName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {booking.facultyInCharge} • {booking.participants} participants
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col space-y-1">
                              <div className="text-sm font-medium text-gray-900">
                                {booking.venue?.name || 'Custom Venue'}
                              </div>
                              {getVenueTypeBadge(booking.venueType)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              <div className="flex items-center mb-1">
                                <Calendar className="w-4 h-4 mr-2" />
                                {new Date(booking.fromDate).toLocaleDateString()}
                              </div>
                              <div className="flex items-center text-gray-500">
                                <Clock className="w-4 h-4 mr-2" />
                                {booking.fromTime} - {booking.toTime}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(booking.status)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleViewBooking(booking)}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              
                              {booking.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleEditBooking(booking)}
                                    className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                                    title="Edit Booking"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  
                                  <button
                                    onClick={() => handleCancelBooking(booking)}
                                    className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                    title="Cancel Booking"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              
                              {booking.status === 'pending' && (
                                <button
                                  onClick={() => handleDeleteBooking(booking)}
                                  className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                  title="Delete Booking"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Showing {indexOfFirstBooking + 1} to {Math.min(indexOfLastBooking, filteredBookings.length)} of {filteredBookings.length} results
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          Previous
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => paginate(page)}
                            className={`px-3 py-1 border rounded-md text-sm ${
                              currentPage === page
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        
                        <button
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClubVenueBookingsDashboard;

