import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleAuthButton from './GoogleAuthButton';
import ForgotPasswordModal from './ForgotPasswordModal';
import { API_URL } from '../config';
import usePageTitle from '../hooks/usePageTitle'; 


/**
 * Login Component
 * Displays the login form with email, password, and role selection
 * 
 * Props:
 * - onSwitchToSignup: Callback to switch to signup page
 * 
 * Backend Integration Notes:
 * - Replace handleSubmit with API call to /api/auth/login
 * - Send: { email, password, role }
 * - Receive: { token, user }
 * - Store token in localStorage/secure cookie
 * - Redirect to dashboard based on role
 * - Add error handling for invalid credentials
 * - Implement "Remember me" functionality
 * - Add "Forgot password" link
 */
function Login() {
  usePageTitle('Login');
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'OWNER',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  setIsLoading(true);
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
        role: formData.role
      })
    });

    if (!res.ok) {
      throw new Error('Invalid credentials');
    }

    const data = await res.json();
    console.log('Login response:', data);
    
    // New backend response structure:
    // { message, userId, email, jwt, name, role }
    
    if (!data.jwt) {
      throw new Error('No JWT token received from server');
    }
    
    // Save the entire response to localStorage (includes jwt)
    localStorage.setItem('user', JSON.stringify(data));
    
    // Also save individual items for easy access
    localStorage.setItem('userId', data.userId);
    localStorage.setItem('userRole', data.role);
    
    // Use AuthContext login (for compatibility)
    login(data, data.jwt);
    
    // Navigate based on role
    const userRole = data.role.toLowerCase();
    navigate(`/${userRole}/dashboard`);
    
  } catch (err) {
    console.error('Login error:', err);
    setErrors({ submit: err.message });
  } finally {
    setIsLoading(false);
  }
};



  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
  setIsGoogleLoading(true);
  try {
    // Save the chosen role so we can use it after redirect (frontend-only storage).
    // sessionStorage is chosen so it survives the redirect but is cleared when tab closes.
    sessionStorage.setItem('pre_oauth_role', 'customer');

    // Kick off the OAuth2 flow on the backend which will redirect to Google.
    // Replace API_URL if you have one; otherwise use hard-coded backend origin.
    const backendOrigin = (typeof API_URL !== 'undefined' && API_URL) ? API_URL : 'http://localhost:8080';
    const authUrl = `${backendOrigin}/oauth2/authorization/google`;

    // Navigate the whole page to the backend endpoint (Spring Boot will redirect to Google).
    window.location.href = authUrl;
  } catch (err) {
    console.error('Google sign-in redirect failed', err);
    setIsGoogleLoading(false);
    alert('Failed to start Google sign-in.');
  }
};


  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Prevent paste in password field
  const handlePasswordPaste = (e) => {
    e.preventDefault();
    setErrors(prev => ({
      ...prev,
      password: 'Please type your password instead of pasting'
    }));
    // Clear the error after 3 seconds
    setTimeout(() => {
      setErrors(prev => ({
        ...prev,
        password: null
      }));
    }, 3000);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 via-orange-100 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated Checkmark Pattern */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${(i % 5) * 20 + 10}%`,
              top: `${Math.floor(i / 5) * 25 + 5}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 3 + (i % 3),
              repeat: Infinity,
              delay: i * 0.2,
            }}
          >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path
                d="M 10 20 L 17 27 L 30 14"
                stroke="#FFA500"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        ))}
        
        {/* Floating Sewing Elements */}
        <motion.div
          className="absolute top-20 left-10"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
            <circle cx="30" cy="30" r="25" stroke="#FFA500" strokeWidth="2" opacity="0.2" />
            <circle cx="30" cy="30" r="15" stroke="#FFA500" strokeWidth="2" opacity="0.3" />
          </svg>
        </motion.div>

        <motion.div
          className="absolute bottom-20 right-20"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
            <path d="M 15 15 L 35 35 M 35 15 L 15 35" stroke="#FFA500" strokeWidth="2" opacity="0.2" />
            <circle cx="10" cy="10" r="8" stroke="#FFA500" strokeWidth="2" opacity="0.3" />
            <circle cx="40" cy="10" r="8" stroke="#FFA500" strokeWidth="2" opacity="0.3" />
          </svg>
        </motion.div>
      </div>

      {/* Main Card */}
      <motion.div
        className="relative z-10 w-full max-w-6xl bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/2 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
          <motion.div
            className="w-full max-w-md"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Logo and Branding */}
            <motion.div className="mb-4 sm:mb-6" variants={itemVariants}>
              <div className="flex items-center gap-3 mb-4 sm:mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">SS</span>
                </div>
                <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Smart Stitch</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">Welcome back</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Please enter your details</p>
            </motion.div>

          {/* Form */}
          <motion.div variants={itemVariants}>
            {/* Error Message */}
            {errors.submit && (
              <motion.div
                className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-400 text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.submit}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Email Input */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
                    errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.email}</p>
                )}
              </motion.div>

              {/* Password Input */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onPaste={handlePasswordPaste}
                    placeholder="Enter your password"
                    className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
                      errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.password}</p>
                )}
              </motion.div>

              {/* Role Selection */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Login As
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                >
                  <option value="OWNER">Shop Owner</option>
                  <option value="WORKER">Worker</option>
                  <option value="CUSTOMER">Customer</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </motion.div>

              {/* Remember Me & Forgot Password */}
              <motion.div
                className="flex items-center justify-between text-sm"
                variants={itemVariants}
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 border border-gray-300 dark:border-gray-600 rounded cursor-pointer accent-orange-600"
                  />
                  <span className="text-gray-600 dark:text-gray-400">Remember for 30 days</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(true)}
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  Forgot password
                </button>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-2.5 px-4 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                variants={itemVariants}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </motion.button>
            </form>

            {/* Google Sign-In Button */}
            <motion.div className="mt-3" variants={itemVariants}>
              <GoogleAuthButton
                onClick={handleGoogleSignIn}
                isLoading={isGoogleLoading}
                disabled={isLoading}
              />
            </motion.div>

            {/* Sign Up Link */}
            <motion.p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-4" variants={itemVariants}>
              Don't have an account?{' '}
              <Link to="/signup" className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-semibold">
                Sign up
              </Link>
            </motion.p>
          </motion.div>
          </motion.div>
        </div>

        {/* Right Side - Illustration */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 relative overflow-hidden items-center justify-center">
        {/* Decorative Icons Background */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 800 600">
            {/* Sewing Icons Pattern */}
            <g stroke="white" strokeWidth="2" fill="none">
              {/* Thread Spools */}
              <circle cx="150" cy="100" r="20" />
              <circle cx="650" cy="150" r="15" />
              <circle cx="200" cy="450" r="18" />
              
              {/* Scissors */}
              <path d="M 500 80 L 520 100 M 520 80 L 500 100" />
              <circle cx="495" cy="85" r="8" />
              <circle cx="525" cy="85" r="8" />
              
              {/* Measuring Tape */}
              <rect x="100" y="300" width="80" height="15" rx="3" />
              <line x1="110" y1="300" x2="110" y2="315" />
              <line x1="130" y1="300" x2="130" y2="315" />
              <line x1="150" y1="300" x2="150" y2="315" />
              <line x1="170" y1="300" x2="170" y2="315" />
              
              {/* Buttons */}
              <circle cx="700" cy="400" r="12" />
              <circle cx="700" cy="400" r="6" />
              <circle cx="120" cy="520" r="10" />
              <circle cx="120" cy="520" r="5" />
              
              {/* Needle */}
              <line x1="600" y1="500" x2="600" y2="550" strokeWidth="3" />
              <circle cx="600" cy="495" r="5" />
              
              {/* Fabric Pattern */}
              <path d="M 350 50 Q 370 60 390 50" />
              <path d="M 350 70 Q 370 80 390 70" />
              
              {/* Dress Form */}
              <ellipse cx="700" cy="250" rx="30" ry="40" />
              <path d="M 670 250 Q 670 290 700 320 Q 730 290 730 250" />
            </g>
          </svg>
        </div>

        {/* Main Illustration */}
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <svg width="500" height="500" viewBox="0 0 500 500" fill="none">
            {/* Tailor Character */}
            <g>
              {/* Body */}
              <ellipse cx="250" cy="380" rx="80" ry="20" fill="rgba(0,0,0,0.1)" />
              <path
                d="M 250 200 Q 220 250 220 320 L 220 380 Q 220 390 230 390 L 270 390 Q 280 390 280 380 L 280 320 Q 280 250 250 200"
                fill="#FFA500"
              />
              
              {/* Arms */}
              <path d="M 220 250 Q 180 280 170 320" stroke="#FFA500" strokeWidth="20" strokeLinecap="round" />
              <path d="M 280 250 Q 320 280 330 320" stroke="#FFA500" strokeWidth="20" strokeLinecap="round" />
              
              {/* Hands */}
              <circle cx="170" cy="325" r="15" fill="#FDB4C1" />
              <circle cx="330" cy="325" r="15" fill="#FDB4C1" />
              
              {/* Head */}
              <circle cx="250" cy="150" r="50" fill="#FDB4C1" />
              
              {/* Hair */}
              <path
                d="M 200 140 Q 200 100 250 100 Q 300 100 300 140 Q 300 120 280 120 Q 270 110 250 110 Q 230 110 220 120 Q 200 120 200 140"
                fill="#1F2937"
              />
              
              {/* Face Details */}
              <circle cx="235" cy="145" r="4" fill="#1F2937" />
              <circle cx="265" cy="145" r="4" fill="#1F2937" />
              <path d="M 240 165 Q 250 170 260 165" stroke="#1F2937" strokeWidth="2" fill="none" strokeLinecap="round" />
              
              {/* Measuring Tape */}
              <path
                d="M 160 310 Q 180 290 200 280 Q 220 270 240 275 Q 260 280 280 275 Q 300 270 320 280 Q 340 290 340 310"
                stroke="#FCD34D"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
              />
              <line x1="180" y1="295" x2="180" y2="305" stroke="white" strokeWidth="2" />
              <line x1="200" y1="280" x2="200" y2="290" stroke="white" strokeWidth="2" />
              <line x1="220" y1="273" x2="220" y2="283" stroke="white" strokeWidth="2" />
              <line x1="240" y1="275" x2="240" y2="285" stroke="white" strokeWidth="2" />
              <line x1="260" y1="280" x2="260" y2="290" stroke="white" strokeWidth="2" />
              <line x1="280" y1="275" x2="280" y2="285" stroke="white" strokeWidth="2" />
              <line x1="300" y1="273" x2="300" y2="283" stroke="white" strokeWidth="2" />
              <line x1="320" y1="285" x2="320" y2="295" stroke="white" strokeWidth="2" />
            </g>

            {/* Floating Elements */}
            <motion.g
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Scissors */}
              <g transform="translate(380, 150)">
                <path d="M 0 0 L 20 20" stroke="#1F2937" strokeWidth="3" />
                <path d="M 20 0 L 0 20" stroke="#1F2937" strokeWidth="3" />
                <circle cx="-5" cy="-5" r="8" fill="none" stroke="#1F2937" strokeWidth="2" />
                <circle cx="25" cy="-5" r="8" fill="none" stroke="#1F2937" strokeWidth="2" />
              </g>
            </motion.g>

            <motion.g
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              {/* Thread Spool */}
              <g transform="translate(100, 200)">
                <rect x="0" y="10" width="30" height="40" rx="3" fill="#FFA500" />
                <ellipse cx="15" cy="10" rx="15" ry="5" fill="#FF8C00" />
                <ellipse cx="15" cy="50" rx="15" ry="5" fill="#FF8C00" />
                <circle cx="15" cy="30" r="3" fill="white" />
              </g>
            </motion.g>

            {/* Check Mark Circle */}
            <motion.g
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
            >
              <circle cx="150" cy="350" r="35" fill="white" />
              <path
                d="M 135 350 L 145 360 L 165 340"
                stroke="#FFA500"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.g>
          </svg>
        </motion.div>

        {/* Decorative Dots */}
        <div className="absolute top-10 right-10 flex gap-3">
          <div className="w-3 h-3 rounded-full bg-white opacity-50"></div>
          <div className="w-3 h-3 rounded-full bg-white opacity-50"></div>
          <div className="w-3 h-3 rounded-full bg-white opacity-50"></div>
        </div>
        </div>
      </motion.div>



      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
      />
    </div>
  );
}

export default Login;
