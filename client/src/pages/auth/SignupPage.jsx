import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowLeft, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    year: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [transitionStage, setTransitionStage] = useState('enter');

  const departments = [
    'CSE',
    'ECE',
    'EEE',
    'MECHANICAL',
    'CIVIL',
    'AIDS',
    'AIML',
    'MECHATRONICS',
    'IT',
    'CHEM',
    'PHARM'
  ];

  const years = [
    'I Year',
    'II Year',
    'III Year',
    'IV Year',
    'V Year'
  ];

  const { signup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setTransitionStage('active');
    return () => setTransitionStage('exit');
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

 
  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (formData.password !== formData.confirmPassword) {
    setError('Passwords do not match');
    return;
  }

  if (!formData.department) {
    setError('Please select your department');
    return;
  }

  if (!formData.year) {
    setError('Please select your year');
    return;
  }

  setLoading(true);
  setError('');

  try {
    const result = await signup({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      department: formData.department,
      year: formData.year
      // clubRef is automatically handled by backend for student signup
    });

    if (result.success) {
      setTransitionStage('exit');
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 300);
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }
  } catch (err) {
    setError(err.message || 'Registration failed. Please try again.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4 transition-all duration-300 ${transitionStage === 'enter' ? 'opacity-0' : transitionStage === 'exit' ? 'opacity-0 scale-95' : 'opacity-100'}`}>
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 p-3 bg-white/80 hover:bg-white text-gray-700 hover:text-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm"
        title="Go Back to Home"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
        <div className="flex flex-col lg:flex-row">
          {/* Illustration Section */}
          <div className="lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 p-10 flex flex-col justify-center transition-all duration-500 hover:from-blue-700 hover:to-purple-800">
            <div className="text-center text-white">
              <div className="w-72 h-72 mx-auto mb-8 overflow-hidden rounded-lg transform transition-all duration-500 hover:scale-105">
                <img
                  src="./admin_block.jpeg"
                  alt="College Events"
                  className="w-full h-full object-cover transition-all duration-500 hover:scale-110"
                />
              </div>
              <h2 className="text-3xl font-bold mb-4 transition-all duration-300 hover:text-blue-200">Join KEC Fests</h2>
              <p className="text-lg opacity-90 mb-6">
                Create your student account to explore amazing events
              </p>
              <div className="flex justify-center">
                <Link 
                  to="/login" 
                  className="flex items-center gap-2 px-6 py-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-all duration-300 hover:gap-3 hover:px-7 group"
                >
                  Already have an account?
                  <ArrowLeft size={18} className="transition-all duration-300 group-hover:-translate-x-1" />
                </Link>
              </div>
            </div>
          </div>

          {/* Signup Form Section */}
          <div className="lg:w-1/2 p-10 flex items-center justify-center">
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full transition-all duration-300 hover:rotate-12 hover:bg-blue-200">
                    <UserPlus className="w-8 h-8 text-blue-600 transition-all duration-300 hover:scale-110" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 transition-all duration-300 hover:text-blue-600">Student Sign Up</h2>
                <p className="text-gray-600 mt-2">Fill in your details to register</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded animate-[pulse_1s_ease-in-out]">
                    <p>{error}</p>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-400"
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-400"
                    placeholder="your@kongu.edu"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-400"
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-400"
                    >
                      <option value="">Select Year</option>
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength="6"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-400 pr-12"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-all duration-300 hover:scale-125"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-400"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-300 hover:scale-110"
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                    I agree to the <a href="#" className="text-blue-600 hover:text-blue-500 transition-all duration-300">Terms and Conditions</a>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium disabled:opacity-70 transition-all duration-300 hover:shadow-lg hover:gap-3"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5 transition-all duration-300 group-hover:rotate-12" />
                      Sign Up
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;


// import React from "react";
// import "./AuthStyles.css";

// export default function SignupPage({ toggle }) {
//   return (
//     <div className="form-box signup-box">
//       <h2>Signup</h2>
//       <input type="text" placeholder="Full Name" />
//       <input type="email" placeholder="Email" />
//       <input type="text" placeholder="Department" />
//       <input type="text" placeholder="Year" />
//       <input type="password" placeholder="Password" />
//       <input type="password" placeholder="Confirm Password" />
//       <button className="btn">Register</button>
//       <p className="switch-text">Already have an account? <span onClick={toggle}>Login</span></p>
//     </div>
//   );
// }
