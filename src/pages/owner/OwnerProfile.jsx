import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  Scissors
} from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { owners } from '../../data/dummyData';

const OwnerProfile = () => {
  // Initialize with first owner from dummy data
  const initialOwner = owners[0];
  
  const [profile, setProfile] = useState({
    name: initialOwner.name,
    email: initialOwner.email,
    mobile: initialOwner.phone,
    shopName: initialOwner.shopName,
    address: initialOwner.address,
    photo: initialOwner.avatar || null
  });

  const [darkMode, setDarkMode] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(initialOwner.avatar || null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errors, setErrors] = useState({});

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

  const handleSaveChanges = () => {
    if (!validateForm()) {
      return;
    }

    // Simulate saving (frontend-only)
    console.log('Profile updated:', profile);

    // Show success message
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
    // In a real app, this would update theme context/localStorage
    console.log('Dark mode toggled:', !darkMode);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="owner" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto"
          >
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Settings className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Profile & Settings</h1>
                  <p className="text-gray-600">Manage your personal information and preferences</p>
                </div>
              </div>
            </div>

            {/* Success Message */}
            {showSuccessMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">
                  Profile updated successfully!
                </span>
              </motion.div>
            )}

            {/* Profile Information Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white rounded-lg shadow-md p-6 mb-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <Scissors className="w-5 h-5 text-orange-500" />
                <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Photo */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Photo
                  </label>
                  
                  <div className="flex items-center gap-4">
                    {photoPreview ? (
                      <div className="relative">
                        <img
                          src={photoPreview}
                          alt="Profile"
                          className="w-24 h-24 rounded-full object-cover border-4 border-orange-100"
                        />
                        <button
                          onClick={handleRemovePhoto}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-orange-100">
                        <User className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    
                    <label className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
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
                    <p className="text-red-600 text-sm mt-1">{errors.photo}</p>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-orange-500" />
                      Full Name <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your name"
                  />
                  {errors.name && (
                    <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-orange-500" />
                      Email Address <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="your@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-orange-500" />
                      Mobile Number <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <input
                    type="tel"
                    value={profile.mobile}
                    onChange={(e) => handleInputChange('mobile', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      errors.mobile ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+1234567890"
                  />
                  {errors.mobile && (
                    <p className="text-red-600 text-sm mt-1">{errors.mobile}</p>
                  )}
                </div>

                {/* Shop Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-orange-500" />
                      Shop Name <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    value={profile.shopName}
                    onChange={(e) => handleInputChange('shopName', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      errors.shopName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter shop name"
                  />
                  {errors.shopName && (
                    <p className="text-red-600 text-sm mt-1">{errors.shopName}</p>
                  )}
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-orange-500" />
                      Shop Address <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <textarea
                    value={profile.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows="3"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter complete shop address"
                  />
                  {errors.address && (
                    <p className="text-red-600 text-sm mt-1">{errors.address}</p>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-6 flex justify-end">
                <motion.button
                  onClick={handleSaveChanges}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Save Changes
                </motion.button>
              </div>
            </motion.div>

            {/* Preferences Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Preferences</h2>

              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {darkMode ? (
                    <Moon className="w-5 h-5 text-orange-500" />
                  ) : (
                    <Sun className="w-5 h-5 text-orange-500" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">Dark Mode</p>
                    <p className="text-sm text-gray-600">
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

              <p className="text-sm text-gray-500 mt-4">
                More preferences will be available in future updates
              </p>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default OwnerProfile;
