import { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion, AnimatePresence } from 'framer-motion';
import usePageTitle from '../../hooks/usePageTitle';
import { customerAPI } from '../../services/api';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Edit2,
  Save,
  X,
  Camera,
  Lock,
  Award,
  Package,
  DollarSign,
  Star,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

const Profile = () => {
  usePageTitle('Profile');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    joinDate: '',
    avatar: 'https://i.pravatar.cc/150?img=8'
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(profileData);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch profile data on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    setErrorMessage('');

    // Get token
    let token = localStorage.getItem('token');
    if (!token) {
      const userDataString = localStorage.getItem('user');
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          token = userData.jwt || userData.token;
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    }

    console.log('Fetching profile with token:', token ? 'Token found' : 'No token');

    if (!token) {
      setErrorMessage('Authentication required. Please login again.');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Calling customerAPI.getCustomerProfile...');
      const result = await customerAPI.getCustomerProfile(token);
      
      console.log('Profile API Result:', result);
      
      if (result.success) {
        console.log('Profile data received:', result.data);
        
        const data = result.data;
        const profile = {
          name: data.user?.name || '',
          email: data.user?.email || '',
          phone: data.user?.contactNumber || '',
          joinDate: data.createdAt ? new Date(data.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          avatar: data.user?.profilePicture || 'https://i.pravatar.cc/150?img=8',
          customerId: data.customerId,
          userId: data.user?.userId
        };
        
        console.log('Mapped profile:', profile);
        
        setProfileData(profile);
        setEditedData(profile);
      } else {
        console.error('Failed to fetch profile:', result.error);
        setErrorMessage(result.error || 'Failed to load profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setErrorMessage('Failed to load profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Customer stats
  const customerStats = {
    totalOrders: 12,
    completedOrders: 10,
    totalSpent: 15000,
    loyaltyPoints: 1250,
    tier: 'Gold',
    avgRating: 4.8,
    joinedDays: Math.floor((new Date() - new Date('2023-05-10')) / (1000 * 60 * 60 * 24))
  };

  // Handle profile update
  const handleSave = () => {
    setProfileData(editedData);
    setIsEditing(false);
    setSuccessMessage('Profile updated successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Handle cancel
  const handleCancel = () => {
    setEditedData(profileData);
    setIsEditing(false);
  };

  // Handle password change
  const handlePasswordChange = () => {
    if (passwordData.new !== passwordData.confirm) {
      alert('New passwords do not match!');
      return;
    }
    if (passwordData.new.length < 6) {
      alert('Password must be at least 6 characters!');
      return;
    }
    setShowPasswordModal(false);
    setPasswordData({ current: '', new: '', confirm: '' });
    setSuccessMessage('Password changed successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Handle avatar upload
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedData({ ...editedData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="customer" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto space-y-6"
          >
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Profile</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage your account information</p>
              </div>
            </div>

            {/* Success Message */}
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg"
                >
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-green-700 dark:text-green-300 font-medium">{successMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg"
                >
                  <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <span className="text-red-700 dark:text-red-300 font-medium">{errorMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading State */}
            {isLoading ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                />
                <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
              </div>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Profile Card */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  {/* Avatar */}
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <img
                      src={isEditing ? editedData.avatar : profileData.avatar}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover border-4 border-blue-100 dark:border-blue-900"
                    />
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                        <Camera className="w-4 h-4 text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Name and Tier */}
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{profileData.name}</h2>
                    <span className="inline-block px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-sm font-semibold rounded-full">
                      {customerStats.tier} Member
                    </span>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <Package className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{customerStats.totalOrders}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Total Orders</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{customerStats.completedOrders}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                      <Award className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{customerStats.loyaltyPoints}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Points</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                      <Star className="w-5 h-5 text-orange-600 dark:text-orange-400 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{customerStats.avgRating}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Rating</p>
                    </div>
                  </div>

                  {/* Member Since */}
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Member Since</span>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{profileData.joinDate}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{customerStats.joinedDays} days ago</p>
                  </div>
                </div>

                {/* Spending Overview */}
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md p-6 text-white mt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="w-6 h-6" />
                    <h3 className="text-lg font-bold">Spending Overview</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm opacity-90">Total Spent</span>
                      <span className="font-bold">₹{customerStats.totalSpent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm opacity-90">Avg per Order</span>
                      <span className="font-bold">₹{Math.round(customerStats.totalSpent / customerStats.totalOrders).toLocaleString()}</span>
                    </div>
                    <div className="pt-3 border-t border-white/30">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm">You're in top 10% customers!</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Profile Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Personal Information */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Personal Information</h2>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleCancel}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Full Name
                        </div>
                      </label>
                      <input
                        type="text"
                        value={isEditing ? editedData.name : profileData.name}
                        onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 ${
                          isEditing ? 'bg-white dark:bg-gray-700' : 'bg-gray-50 dark:bg-gray-700/50'
                        }`}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email Address
                        </div>
                      </label>
                      <input
                        type="email"
                        value={isEditing ? editedData.email : profileData.email}
                        onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 ${
                          isEditing ? 'bg-white dark:bg-gray-700' : 'bg-gray-50 dark:bg-gray-700/50'
                        }`}
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Phone Number
                        </div>
                      </label>
                      <input
                        type="tel"
                        value={isEditing ? editedData.phone : profileData.phone}
                        onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 ${
                          isEditing ? 'bg-white dark:bg-gray-700' : 'bg-gray-50 dark:bg-gray-700/50'
                        }`}
                      />
                    </div>

                    {/* Join Date (Read-only) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Join Date
                        </div>
                      </label>
                      <input
                        type="text"
                        value={profileData.joinDate}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Security Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Security Settings</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">Password</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Last changed 30 days ago</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowPasswordModal(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        Change Password
                      </button>
                    </div>

                    <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Account Verified</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">Your email and phone number are verified</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preferences */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Preferences</h2>
                  
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">Email Notifications</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Receive order updates via email</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">SMS Notifications</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Get delivery alerts via SMS</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">Marketing Emails</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Receive offers and promotions</p>
                      </div>
                      <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
            )}
          </motion.div>
        </main>
      </div>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Change Password</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordChange}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Change Password
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
