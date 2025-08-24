import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowRight, LogIn, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [transitionStage, setTransitionStage] = useState('enter');

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setTransitionStage('active');
    return () => setTransitionStage('exit');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      if (success) {
        setTransitionStage('exit');
        setTimeout(() => {
          // Get user role from auth context and redirect accordingly
          const userRole = localStorage.getItem('userRole') || 'student';
          
          if (userRole === 'admin') {
            navigate('/dashboard/admin');
          } else if (userRole === 'club') {
            navigate('/dashboard/club');
          } else if (userRole === 'labFaculty') {
            navigate('/lab-incharge/calendar');
          }else {
            navigate('/');
          }
        }, 300);
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4 transition-all duration-300 ${transitionStage === 'enter' ? 'opacity-0' : transitionStage === 'exit' ? 'opacity-0 scale-95' : 'opacity-100'}`}>
      {/* Back Button */}
      
      {/* Removed back button for login page */}

      <div className="max-w-6xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
        <div className="flex flex-col lg:flex-row">
          {/* Illustration Section */}
          <div className="lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 p-12 flex flex-col justify-center transition-all duration-500 hover:from-blue-700 hover:to-purple-800">
            <div className="text-center text-white">
              <div className="w-80 h-80 mx-auto mb-10 overflow-hidden rounded-2xl transform transition-all duration-500 hover:scale-105">
                <img
                  src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"
                  alt="College Events"
                  className="w-full h-full object-cover transition-all duration-500 hover:scale-110"
                />
              </div>
              <h2 className="text-4xl font-bold mb-6 transition-all duration-300 hover:text-blue-200 leading-tight">Welcome to KEC Fests</h2>
              <p className="text-xl opacity-90 mb-8 leading-relaxed max-w-md mx-auto">
                Discover amazing events and connect with your college community
              </p>
              <div className="flex justify-center">
                <Link 
                  to="/signup" 
                  className="flex items-center gap-3 px-8 py-3 bg-white/20 rounded-full text-white hover:bg-white/30 transition-all duration-300 hover:gap-4 hover:px-9 group font-medium"
                >
                  Don't have an account? 
                  <ArrowRight size={20} className="transition-all duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>

          {/* Login Form Section */}
          <div className="lg:w-1/2 p-12 flex items-center justify-center">
            <div className="w-full max-w-md">
              <div className="text-center mb-10">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-blue-100 rounded-full transition-all duration-300 hover:rotate-12 hover:bg-blue-200">
                    <LogIn className="w-10 h-10 text-blue-600 transition-all duration-300 hover:scale-110" />
                  </div>
                </div>
                <h2 className="text-4xl font-bold text-gray-800 transition-all duration-300 hover:text-blue-600 mb-3">Sign In</h2>
                <p className="text-gray-600 text-lg">Access your account to manage events</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-5 rounded-xl animate-[pulse_1s_ease-in-out]">
                    <p className="font-medium">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Login ID</label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-400 text-base"
                    placeholder="e.g., CLUB_CSE or student@kongu.edu"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-400 pr-14 text-base"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-all duration-300 hover:scale-125 p-1"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-300 hover:scale-110"
                    />
                    <label htmlFor="remember-me" className="ml-3 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  <div className="text-sm">
                    <a href="#" className="font-semibold text-blue-600 hover:text-blue-500 transition-all duration-300">
                      Forgot password?
                    </a>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold text-lg disabled:opacity-70 transition-all duration-300 hover:shadow-xl hover:gap-4 shadow-lg"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-6 h-6 transition-all duration-300 group-hover:rotate-12" />
                      Sign In
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

export default LoginPage;