import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { venuesAPI, bookingsAPI } from '../services/api'; // Assuming these API services exist
import Navbar from '../components/Navbar'; // Import Navbar component

// Mock user data, replace with actual auth context
const useAuth = () => ({ user: { email: 'test@example.com', name: 'Test User', department: 'CSE' } });

const DynamicVenueBookingPage = () => {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [venue, setVenue] = useState(null);
  const [venueBookings, setVenueBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [selectedDate, setSelectedDate] = useState(null);
  const [bookingConflict, setBookingConflict] = useState(null);
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    facultyInCharge: '',
    mobileNumber: '',
    eventName: '',
    participants: '',
    purpose: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchVenueDetails = async () => {
      try {
        setLoading(true);
        const venueDetails = await venuesAPI.getById(venueId);
        const bookings = await bookingsAPI.getForVenue(venueId);
        setVenue(venueDetails);
        setVenueBookings(bookings.bookings || []);
      } catch (err) {
        setError('Failed to load venue details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVenueDetails();
  }, [venueId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validation logic here...
    setSubmitting(true);
    try {
      const bookingData = {
        venue: venueId,
        venueType: venue.type,
        fromDate: selectedDate,
        toDate: selectedDate,
        fromTime: formData.startTime,
        toTime: formData.endTime,
        facultyInCharge: formData.facultyInCharge,
        department: user?.department || 'General',
        mobileNumber: formData.mobileNumber,
        eventName: formData.eventName,
        participants: Number(formData.participants),
        purpose: formData.purpose,
        bookedBy: user?.email || user?.name,
      };
      await bookingsAPI.create(bookingData);
      alert('Venue booking submitted successfully!');
      navigate('/club/venue-booking');
    } catch (error) {
      alert(error.message || 'Failed to submit booking.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!venue) return <p>Venue not found.</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showBackButton={true} showSearch={false} />
      <div className="flex-1 p-8 pt-24"> {/* Add pt-24 for padding */}
        <button
          onClick={() => navigate('/club/venue-booking')}
          className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Venue Selection
        </button>

        <header className="mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">Book: {venue.name}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">{venue.location}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar and Availability Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Date and Time</h2>
            {/* Calendar implementation would go here */}
            <p className="text-gray-600">Calendar view to show existing bookings for this venue.</p>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                <input type="date" onChange={e => setSelectedDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg"/>
            </div>
          </div>

          {/* Booking Form */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Booking Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
                    <input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
                    <input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg"/>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Faculty in Charge *</label>
                <input type="text" name="facultyInCharge" value={formData.facultyInCharge} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number *</label>
                <input type="text" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Name *</label>
                <input type="text" name="eventName" value={formData.eventName} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Participants *</label>
                <input type="number" name="participants" value={formData.participants} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Purpose of Booking</label>
                <textarea name="purpose" value={formData.purpose} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg"></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              >
                {submitting ? 'Submitting...' : 'Confirm Booking'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicVenueBookingPage;
