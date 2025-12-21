import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  MapPin, 
  Upload, 
  X, 
  CheckCircle,
  Moon,
  Sun,
  Settings,
  Scissors,
  Loader
} from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';

const OwnerProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    mobile: '',
    shopName: '',
    shopEmail: '',
    shopPhone: '',
    address: '',
    photo: null
  });

  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch profile data from API
  useEffect(() => {
    const fetchProfile = async () => {
      // Get userId from localStorage
      const userDataString = localStorage.getItem('user');
      
      if (!userDataString) {
        setErrors({ fetch: 'User not authenticated' });
        setLoading(false);
        return;
      }

      try {
        const userData = JSON.parse(userDataString);
        const userId = userData.userId;
        
        if (!userId) {
          setErrors({ fetch: 'User ID not found' });
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:8080/api/owners/profile/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        console.log('API Response:', data); // Debug log
        
        // Map API response to profile state (flat structure)
        setProfile({
          name: data.name || '',
          email: data.email || '',
          mobile: data.contactNumber || '',
          shopName: data.shopName || '',
          shopEmail: data.shopEmail || '',
          shopPhone: data.shopContactNumber || '',
          address: data.shopAddress || '',
          photo: null
        });

        // Set photo preview if available
        if (data.profilePicture) {
          setPhotoPreview(data.profilePicture);
        }

      } catch (error) {
        console.error('Error fetching profile:', error);
        setErrors({ fetch: 'Failed to load profile data' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          photo: 'Please upload a valid image file (JPG, PNG, or GIF)'
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          photo: 'File size must be less than 5MB'
        }));
        return;
      }

      setProfile(prev => ({
        ...prev,
        photo: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Clear error
      setErrors(prev => ({
        ...prev,
        photo: ''
      }));
    }
  };

  const handleRemovePhoto = () => {
    setProfile(prev => ({
      ...prev,
      photo: null
    }));
    setPhotoPreview(null);
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!profile.name || profile.name.trim().length < 2 || profile.name.trim().length > 50) {
      newErrors.name = 'Name must be between 2 and 50 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!profile.email || !emailRegex.test(profile.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Mobile validation
    const phoneRegex = /^[\d\s\-+()]{10,15}$/;
    if (!profile.mobile || !phoneRegex.test(profile.mobile.replace(/\s/g, ''))) {
      newErrors.mobile = 'Please enter a valid phone number (10-15 digits)';
    }

    // Shop name validation
    if (!profile.shopName || profile.shopName.trim().length < 2 || profile.shopName.trim().length > 100) {
      newErrors.shopName = 'Shop name must be between 2 and 100 characters';
    }

    // Address validation
    if (!profile.address || profile.address.trim().length < 10 || profile.address.trim().length > 200) {
      newErrors.address = 'Address must be between 10 and 200 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveChanges = async () => {
    if (!validateForm()) {
      return;
    }

    // Get userId from localStorage
    const userDataString = localStorage.getItem('user');
    if (!userDataString) {
      setErrors({ save: 'User not authenticated' });
      return;
    }

    try {
      const userData = JSON.parse(userDataString);
      const userId = userData.userId;

      if (!userId) {
        setErrors({ save: 'User ID not found' });
        return;
      }

      // Prepare payload for API
      const payload = {
        name: profile.name,
        email: profile.email,
        contactNumber: profile.mobile,
        shopName: profile.shopName,
        shopEmail: profile.shopEmail,
        shopContactNumber: profile.shopPhone,
        shopAddress: profile.address
      };

      console.log('Updating profile with payload:', payload);

      const response = await fetch(`http://localhost:8080/api/owners/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to update profile');
      }

      // Show success message
      setShowSuccessMessage(false);
      setShowSuccessModal(true);

      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ save: error.message || 'Failed to save changes' });
      
      // Show error in a temporary message
      setShowSuccessMessage(false);
      setTimeout(() => {
        setErrors({ save: '' });
      }, 5000);
    }
  };

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
    // In a real app, this would update theme context/localStorage
    console.log('Dark mode toggled:', !darkMode);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="owner" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto p-6 dark:bg-gray-900">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
              </div>
            </div>
          ) : errors.fetch ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Error Loading Profile</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{errors.fetch}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto"
            >
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Settings className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Profile & Settings</h1>
                  <p className="text-gray-600 dark:text-gray-400">Manage your personal information and preferences</p>
                </div>
              </div>
            </div>

            {/* Success Message */}
            {showSuccessMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4 flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-green-800 dark:text-green-300 font-medium">
                  Profile updated successfully!
                </span>
              </motion.div>
            )}

            {/* Error Message */}
            {errors.save && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 flex items-center gap-3"
              >
                <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="text-red-800 dark:text-red-300 font-medium">
                  {errors.save}
                </span>
              </motion.div>
            )}

            {/* Personal Information Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <User className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">Personal Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Profile Photo */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Profile Photo
                  </label>
                  
                  <div className="flex items-center gap-4">
                    {photoPreview ? (
                      <div className="relative">
                        <img
                          src={photoPreview}
                          alt="Profile"
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-orange-100 dark:border-orange-900/30"
                        />
                        <button
                          onClick={handleRemovePhoto}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-orange-100 dark:border-orange-900/30">
                        <User className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                    
                    <label className="cursor-pointer">
                      <div className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                        <Upload className="w-4 h-4" />
                        <span className="text-sm font-medium">Upload Photo</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  {errors.photo && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.photo}</p>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-orange-500" />
                      Full Name <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                      errors.name ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter your name"
                  />
                  {errors.name && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-orange-500" />
                      Email Address <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                      errors.email ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="your@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Mobile */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-orange-500" />
                      Mobile Number <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <input
                    type="tel"
                    value={profile.mobile}
                    onChange={(e) => handleInputChange('mobile', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                      errors.mobile ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="+1234567890"
                  />
                  {errors.mobile && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.mobile}</p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Shop Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <Building2 className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">Shop Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Shop Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-orange-500" />
                      Shop Name <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    value={profile.shopName}
                    onChange={(e) => handleInputChange('shopName', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                      errors.shopName ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter shop name"
                  />
                  {errors.shopName && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.shopName}</p>
                  )}
                </div>

                {/* Shop Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-orange-500" />
                      Shop Phone Number
                    </div>
                  </label>
                  <input
                    type="tel"
                    value={profile.shopPhone}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    placeholder="+1234567890"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Shop contact number</p>
                </div>

                {/* Shop Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-orange-500" />
                      Shop Email
                    </div>
                  </label>
                  <input
                    type="email"
                    value={profile.shopEmail}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    placeholder="shop@email.com"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Shop email address</p>
                </div>

                {/* Shop Registration (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-orange-500" />
                      Registration Number
                    </div>
                  </label>
                  <input
                    type="text"
                    placeholder="Optional"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Business registration number</p>
                </div>

                {/* Shop Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-orange-500" />
                      Shop Address <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <textarea
                    value={profile.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows="3"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                      errors.address ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter complete shop address with city, state, and postal code"
                  />
                  {errors.address && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.address}</p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Save Button */}
            <div className="flex justify-end mb-6">
              <motion.button
                onClick={handleSaveChanges}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Save All Changes
              </motion.button>
            </div>

            {/* Preferences Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Preferences</h2>

              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  {darkMode ? (
                    <Moon className="w-5 h-5 text-orange-500" />
                  ) : (
                    <Sun className="w-5 h-5 text-orange-500" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Dark Mode</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {darkMode ? 'Dark theme enabled' : 'Light theme enabled'}
                    </p>
                  </div>
                </div>
                
                <motion.button
                  onClick={handleToggleDarkMode}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    darkMode ? 'bg-orange-500' : 'bg-gray-300'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md"
                    animate={{ x: darkMode ? 28 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </motion.button>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                More preferences will be available in future updates
              </p>
            </motion.div>
          </motion.div>
          )}
        </main>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSuccessModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full"
            >
              {/* Success Header */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Success!</h2>
                    <p className="text-green-50">Your changes have been saved</p>
                  </div>
                </div>
              </div>

              {/* Success Body */}
              <div className="p-6 space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                  <p className="text-green-800 dark:text-green-200 font-medium">
                    Your profile has been updated successfully!
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                    All changes have been saved to the database.
                  </p>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OwnerProfile;
