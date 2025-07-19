// pages/MaharajaBookingPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  Phone,
  FileText,
  Settings,
  LogOut,
  Globe,
  Menu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

function MaharajaBookingPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [formData, setFormData] = useState({
    fromDate: '',
    fromTime: '',
    toDate: '',
    toTime: '',
    facultyInCharge: '',
    department: 'Maharaja Hall',
    mobileNumber: '',
    functionName: '',
    functionDate: '',
    chiefGuest: '',
    totalAudience: '',
    airConditioning: 'No',
    electricalLighting: 'No',
    stageLightings: 'No',
    houseKeeping: 'No',
    audioWork: 'No',
  });
  const [errors, setErrors] = useState({});

  /* ---------- Helpers ---------- */
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const validateForm = () => {
    const req = [
      'fromDate',
      'fromTime',
      'toDate',
      'toTime',
      'facultyInCharge',
      'mobileNumber',
      'functionName',
      'functionDate',
      'chiefGuest',
      'totalAudience',
    ];
    const newErr = {};
    req.forEach((f) => {
      if (!String(formData[f]).trim()) newErr[f] = 'Required';
    });

    if (formData.mobileNumber && !/^\d{10}$/.test(formData.mobileNumber)) {
      newErr.mobileNumber = 'Mobile number must be 10 digits';
    }
    if (
      formData.fromDate &&
      formData.toDate &&
      new Date(formData.fromDate) > new Date(formData.toDate)
    ) {
      newErr.toDate = 'To date must be after from date';
    }
    setErrors(newErr);
    return !Object.keys(newErr).length;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Maharaja booking submitted:', formData);
      alert('Maharaja Hall booked successfully!');
      navigate('/club/venue-booking');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  /* ---------- JSX ---------- */
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1">
        {/* Navbar */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 text-gray-600 hover:text-purple-600"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">KEC</span>
                  </div>
                  <span className="text-xl font-bold">Fests</span>
                </div>
              </div>

              <span className="text-lg font-medium text-gray-700">
                Maharaja Booking
              </span>

              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-600 hover:text-purple-600">
                  <Settings className="w-6 h-6" />
                </button>
                <button className="p-2 text-gray-600 hover:text-purple-600">
                  <Globe className="w-6 h-6" />
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Form */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <button
              onClick={() => navigate('/club/venue-booking')}
              className="text-purple-600 hover:text-purple-700 mb-4"
            >
              ← Back to Venue Booking
            </button>
            <h1 className="text-3xl font-bold mb-2">Book Maharaja Hall</h1>
            <p className="text-lg text-gray-600">
              Fill in the details to book Maharaja Hall for your event
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Dates & Times */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { n: 'fromDate', l: 'From Date', icon: Calendar, type: 'date' },
                  { n: 'fromTime', l: 'From Time', icon: Clock, type: 'time' },
                  { n: 'toDate', l: 'To Date', icon: Calendar, type: 'date' },
                  { n: 'toTime', l: 'To Time', icon: Clock, type: 'time' },
                ].map((f) => {
                  const Icon = f.icon;
                  return (
                    <div key={f.n}>
                      <label className="block text-sm font-medium mb-2">
                        <Icon className="w-4 h-4 inline mr-2" />
                        {f.l} *
                      </label>
                      <input
                        type={f.type}
                        name={f.n}
                        value={formData[f.n]}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                          errors[f.n] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors[f.n] && (
                        <p className="text-red-500 text-sm mt-1">{errors[f.n]}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Faculty section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Faculty In‑Charge *
                  </label>
                  <input
                    type="text"
                    name="facultyInCharge"
                    value={formData.facultyInCharge}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                      errors.facultyInCharge ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.facultyInCharge && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.facultyInCharge}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={formData.department}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                      errors.mobileNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="10‑digit number"
                  />
                  {errors.mobileNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.mobileNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Function details */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold mb-4">Function Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      n: 'functionName',
                      l: 'Name of the Function',
                      icon: FileText,
                    },
                    { n: 'functionDate', l: 'Function Date', icon: Calendar, type: 'date' },
                    { n: 'chiefGuest', l: 'Chief / Main Guest', icon: User },
                    { n: 'totalAudience', l: 'Total Audience', icon: Users, type: 'number' },
                  ].map((f) => {
                    const Icon = f.icon;
                    return (
                      <div key={f.n}>
                        <label className="block text-sm font-medium mb-2">
                          <Icon className="w-4 h-4 inline mr-2" />
                          {f.l} *
                        </label>
                        <input
                          type={f.type || 'text'}
                          name={f.n}
                          value={formData[f.n]}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                            errors[f.n] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors[f.n] && (
                          <p className="text-red-500 text-sm mt-1">{errors[f.n]}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Requirements */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold mb-4">Requirements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    'airConditioning',
                    'electricalLighting',
                    'stageLightings',
                    'houseKeeping',
                    'audioWork',
                  ].map((req) => (
                    <div key={req}>
                      <label className="block text-sm font-medium mb-2 capitalize">
                        {req.replace(/([A-Z])/g, ' $1')}
                      </label>
                      <select
                        name={req}
                        value={formData[req]}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-center pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Submit Booking
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default MaharajaBookingPage;
