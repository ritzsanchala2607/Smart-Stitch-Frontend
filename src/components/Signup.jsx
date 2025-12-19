import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleAuthButton from './GoogleAuthButton';
import { API_URL } from '../config'; 

/**
 * Signup Component
 * Displays the signup form with full name, email, password, role selection
 * 
 * Props:
 * - onSwitchToLogin: Callback to switch to login page
 * 
 * Backend Integration Notes:
 * - Replace handleSubmit with API call to /api/auth/signup
 * - Send: { fullName, email, password, confirmPassword, role }
 * - Receive: { token, user }
 * - Validate password strength on backend
 * - Send verification email
 * - Handle duplicate email error
 * - Store token in localStorage/secure cookie
 * - Redirect to dashboard or email verification page
 */
function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'OWNER',
    agreeToTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and numbers';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  console.log("SIGNUP CLICKED");
  console.log("FORM DATA:", formData);

  if (!validateForm()) {
    console.log("VALIDATION FAILED");
    return;
  } // ✅ MISSING BRACE FIXED HERE

  console.log("VALIDATION PASSED, CALLING API");
  setIsLoading(true);

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setErrors({ submit: data.message || "Registration failed. Please try again." });
      setIsLoading(false);
      return;
    }

    localStorage.setItem("token", data.token);
    setIsLoading(false);
    setShowSuccessModal(true);

  } catch (error) {
    console.error(error);
    setErrors({ submit: "Server error. Please try again later." });
    setIsLoading(false);
  }
};



  // Handle Google Sign-Up
  // Handle Google Sign-Up (integrated with backend OAuth endpoint)
const handleGoogleSignUp = async () => {
  setIsGoogleLoading(true);

  try {
    // Save the chosen role so it survives the full-page redirect.
    // sessionStorage is used so the value survives redirect but clears when the tab closes.
    sessionStorage.setItem('pre_oauth_role', 'Customer');

    // Determine backend origin: use API_URL if provided, otherwise fallback to localhost:8080
    const backendOrigin = (typeof API_URL !== 'undefined' && API_URL) ? API_URL : 'http://localhost:8080';

    // Kick off the OAuth2 flow on the backend which will redirect to Google.
    // Option A: simple redirect (backend reads nothing from frontend)
    const authUrl = `${backendOrigin}/oauth2/authorization/google`;

    // Option B (uncomment if you want to send role as a query param and handle it on backend):
    // const authUrl = `${backendOrigin}/login/oauth2/authorization/google?role=${encodeURIComponent(formData.role)}`;

    // Navigate to backend endpoint to begin OAuth flow
    window.location.href = authUrl;

  } catch (err) {
    console.error('Google sign-up redirect failed', err);
    alert('Failed to start Google sign-up. Please try again.');
    setIsGoogleLoading(false);
  }
};


  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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

  // Prevent paste in confirm password field
  const handleConfirmPasswordPaste = (e) => {
    e.preventDefault();
    setErrors(prev => ({
      ...prev,
      confirmPassword: 'Please type your password instead of pasting'
    }));
    // Clear the error after 3 seconds
    setTimeout(() => {
      setErrors(prev => ({
        ...prev,
        confirmPassword: null
      }));
    }, 3000);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 via-orange-100 to-orange-50 relative overflow-hidden">
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
        className="relative z-10 w-full max-w-6xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/2 p-3 sm:p-5 lg:p-6 flex items-center justify-center">
          <motion.div
            className="w-full max-w-md"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Logo and Branding */}
            <motion.div className="mb-3 sm:mb-4" variants={itemVariants}>
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">SS</span>
                </div>
                <span className="text-lg sm:text-xl font-bold text-gray-900">Smart Stitch</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-0.5">Create an account</h1>
              <p className="text-gray-500 text-sm">Start your tailoring journey today</p>
            </motion.div>

          {/* Form */}
          <motion.div variants={itemVariants}>
            {/* Error Message */}
            {errors.submit && (
              <motion.div
                className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.submit}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-2.5">
              {/* Full Name Input */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
                    errors.fullName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                )}
              </motion.div>

              {/* Email Input */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </motion.div>

              {/* Password Input */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onPaste={handlePasswordPaste}
                    placeholder="Create a password"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </motion.div>

              {/* Confirm Password Input */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    onPaste={handleConfirmPasswordPaste}
                    placeholder="Confirm your password"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </motion.div>

              {/* Role Selection */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sign Up As
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all bg-white"
                >
                  <option value="OWNER">Shop Owner</option>
                  <option value="WORKER">Worker</option>
                  <option value="CUSTOMER">Customer</option>
                </select>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-2 px-4 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-3"
                variants={itemVariants}
              >
                {isLoading ? 'Creating account...' : 'Get started'}
              </motion.button>
            </form>

            {/* Google Sign-Up Button */}
            <motion.div className="mt-2.5" variants={itemVariants}>
              <GoogleAuthButton
                onClick={handleGoogleSignUp}
                isLoading={isGoogleLoading}
                disabled={isLoading}
              />
            </motion.div>

            {/* Sign In Link */}
            <motion.p className="text-center text-gray-600 text-sm mt-3" variants={itemVariants}>
              Already have an account?{' '}
              <Link to="/login" className="text-orange-600 hover:text-orange-700 font-semibold">
                Log in
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
              {/* Fabric Rolls */}
              <rect x="100" y="80" width="60" height="80" rx="5" />
              <line x1="110" y1="80" x2="110" y2="160" />
              <line x1="130" y1="80" x2="130" y2="160" />
              <line x1="150" y1="80" x2="150" y2="160" />
              
              {/* Pins */}
              <line x1="650" y1="100" x2="650" y2="130" strokeWidth="2" />
              <circle cx="650" cy="95" r="5" fill="white" />
              
              {/* Buttons */}
              <circle cx="200" cy="500" r="15" />
              <circle cx="200" cy="500" r="8" />
              <line x1="195" y1="495" x2="205" y2="505" />
              <line x1="195" y1="505" x2="205" y2="495" />
              
              {/* Dress Pattern */}
              <path d="M 600 400 L 620 420 L 640 400 L 640 480 L 600 480 Z" />
              <line x1="620" y1="420" x2="620" y2="480" />
              
              {/* Sewing Machine */}
              <rect x="100" y="400" width="80" height="60" rx="5" />
              <rect x="120" y="380" width="40" height="30" rx="3" />
              <line x1="140" y1="380" x2="140" y2="400" strokeWidth="3" />
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
            {/* Designer Character */}
            <g>
              {/* Shadow */}
              <ellipse cx="250" cy="400" rx="90" ry="25" fill="rgba(0,0,0,0.1)" />
              
              {/* Body */}
              <path
                d="M 250 210 Q 210 260 210 330 L 210 390 Q 210 400 220 400 L 280 400 Q 290 400 290 390 L 290 330 Q 290 260 250 210"
                fill="#FFA500"
              />
              
              {/* Arms */}
              <path d="M 210 260 Q 160 290 150 330" stroke="#FFA500" strokeWidth="22" strokeLinecap="round" />
              <path d="M 290 260 Q 340 290 350 330" stroke="#FFA500" strokeWidth="22" strokeLinecap="round" />
              
              {/* Hands */}
              <circle cx="150" cy="335" r="16" fill="#FDB4C1" />
              <circle cx="350" cy="335" r="16" fill="#FDB4C1" />
              
              {/* Head */}
              <circle cx="250" cy="160" r="55" fill="#FDB4C1" />
              
              {/* Hair - Stylish Bun */}
              <path
                d="M 200 150 Q 200 105 250 105 Q 300 105 300 150"
                fill="#1F2937"
              />
              <circle cx="250" cy="110" r="25" fill="#1F2937" />
              
              {/* Face Details */}
              <circle cx="233" cy="155" r="4" fill="#1F2937" />
              <circle cx="267" cy="155" r="4" fill="#1F2937" />
              <path d="M 238 175 Q 250 182 262 175" stroke="#1F2937" strokeWidth="2" fill="none" strokeLinecap="round" />
              
              {/* Fabric Swatch in Left Hand */}
              <g transform="translate(130, 320)">
                <rect x="0" y="0" width="35" height="45" rx="3" fill="#FFA500" />
                <line x1="5" y1="10" x2="30" y2="10" stroke="white" strokeWidth="1" opacity="0.5" />
                <line x1="5" y1="20" x2="30" y2="20" stroke="white" strokeWidth="1" opacity="0.5" />
                <line x1="5" y1="30" x2="30" y2="30" stroke="white" strokeWidth="1" opacity="0.5" />
              </g>
              
              {/* Scissors in Right Hand */}
              <g transform="translate(335, 320) rotate(20)">
                <path d="M 0 0 L 25 25" stroke="#1F2937" strokeWidth="3" />
                <path d="M 25 0 L 0 25" stroke="#1F2937" strokeWidth="3" />
                <circle cx="-5" cy="-5" r="10" fill="none" stroke="#1F2937" strokeWidth="2.5" />
                <circle cx="30" cy="-5" r="10" fill="none" stroke="#1F2937" strokeWidth="2.5" />
              </g>
            </g>

            {/* Floating Elements */}
            <motion.g
              animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Floating Button */}
              <g transform="translate(380, 180)">
                <circle cx="0" cy="0" r="20" fill="white" />
                <circle cx="0" cy="0" r="12" fill="none" stroke="#FFA500" strokeWidth="2" />
                <line x1="-5" y1="-5" x2="5" y2="5" stroke="#FFA500" strokeWidth="2" />
                <line x1="-5" y1="5" x2="5" y2="-5" stroke="#FFA500" strokeWidth="2" />
              </g>
            </motion.g>

            <motion.g
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            >
              {/* Floating Needle & Thread */}
              <g transform="translate(100, 180)">
                <line x1="0" y1="0" x2="0" y2="50" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
                <circle cx="0" cy="-5" r="6" fill="#FCD34D" />
                <path d="M 0 50 Q 20 60 40 50 Q 60 40 80 50" stroke="#FFA500" strokeWidth="2" fill="none" />
              </g>
            </motion.g>

            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              {/* Rotating Spool */}
              <g transform="translate(400, 350)">
                <rect x="-15" y="-25" width="30" height="50" rx="3" fill="#FFA500" />
                <ellipse cx="0" cy="-25" rx="15" ry="6" fill="#FF8C00" />
                <ellipse cx="0" cy="25" rx="15" ry="6" fill="#FF8C00" />
              </g>
            </motion.g>

            {/* Success Checkmark */}
            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5, type: "spring", stiffness: 200 }}
            >
              <circle cx="380" cy="280" r="30" fill="white" />
              <path
                d="M 368 280 L 376 288 L 392 272"
                stroke="#FFA500"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.g>

            {/* Sparkles */}
            <motion.g
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <path d="M 120 280 L 125 285 L 120 290 L 115 285 Z" fill="white" />
              <path d="M 360 420 L 365 425 L 360 430 L 355 425 Z" fill="white" />
            </motion.g>
          </svg>
        </motion.div>

        {/* Decorative Dots */}
        <div className="absolute top-10 right-10 flex gap-3">
          <div className="w-3 h-3 rounded-full bg-white opacity-50"></div>
          <div className="w-3 h-3 rounded-full bg-white opacity-50"></div>
          <div className="w-3 h-3 rounded-full bg-white opacity-50"></div>
        </div>

        {/* Decorative Wave */}
        <motion.div
          className="absolute bottom-0 left-0 right-0"
          animate={{ x: [0, 20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="100%" height="100" viewBox="0 0 1000 100" preserveAspectRatio="none">
            <path
              d="M 0 50 Q 250 20 500 50 T 1000 50 L 1000 100 L 0 100 Z"
              fill="rgba(255,255,255,0.1)"
            />
          </svg>
        </motion.div>
        </div>
      </motion.div>
      
      {showSuccessModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center shadow-xl">
      <h2 className="text-2xl font-bold text-green-600 mb-2">
        Signup Successful 🎉
      </h2>
      <p className="text-gray-600 mb-6">
        Your account has been created successfully.
      </p>
      <button
        onClick={() => navigate("/login")}
        className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600"
      >
        Go to Login
      </button>
    </div>
  </div>
)}


    </div>
  );
}

export default Signup;
