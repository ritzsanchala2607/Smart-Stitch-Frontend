import { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion } from 'framer-motion';
import usePageTitle from '../../hooks/usePageTitle';
import {
  User,
  Calendar,
  Award,
  Star,
  Briefcase,
  Camera,
  Lock,
  Save,
  Edit,
  Mail,
  Phone,
  Loader
} from 'lucide-react';
import { workerAPI, ratingAPI } from '../../services/api';

const WorkerProfile = () => {
  usePageTitle('Profile');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    avatar: '',
    workType: '',
    experience: 0,
    joinDate: '',
    rating: 0,
    completedTasks: 0,
    activeTasks: 0,
    rates: [],
    workerId: null
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // Customer ratings state
  const [customerRatings, setCustomerRatings] = useState([]);
  const [ratingSummary, setRatingSummary] = useState({
    averageRating: 0,
    totalRatings: 0
  });
  const [loadingRatings, setLoadingRatings] = useState(false);

  // Get token from localStorage
  const getToken = () => {
    const token = localStorage.getItem('token');
    if (token) return token;
    
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.jwt || user.token;
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
    return null;
  };

  // Fetch worker profile on component mount
  useEffect(() => {
    fetchWorkerProfile();
  }, []);

  // Fetch customer ratings when workerId is available
  useEffect(() => {
    if (profile.workerId) {
      fetchCustomerRatings();
    }
  }, [profile.workerId]);

  const fetchWorkerProfile = async () => {
    setIsLoading(true);
    const token = getToken();
    
    if (!token) {
      console.error('No token found');
      setIsLoading(false);
      return;
    }

    try {
      // Fetch worker profile
      const response = await workerAPI.getWorkerProfile(token);
      
      if (response.success) {
        const data = response.data;
        console.log('Worker profile fetched:', data);
        
        // Fetch worker tasks to calculate active and completed counts
        const tasksResponse = await workerAPI.getMyTasks(token);
        let activeTasks = 0;
        let completedTasks = 0;
        
        if (tasksResponse.success) {
          const tasks = tasksResponse.data || [];
          console.log('Worker tasks fetched:', tasks);
          
          // Count active tasks (PENDING or IN_PROGRESS status)
          activeTasks = tasks.filter(task => {
            const status = (task.status || '').toUpperCase();
            return status === 'PENDING' || status === 'IN_PROGRESS';
          }).length;
          
          // Count completed tasks (COMPLETED status)
          completedTasks = tasks.filter(task => {
            const status = (task.status || '').toUpperCase();
            return status === 'COMPLETED';
          }).length;
          
          console.log('Task counts - Active:', activeTasks, 'Completed:', completedTasks);
        }
        
        setProfile({
          name: data.name || '',
          email: data.email || '',
          phone: data.contactNumber || '',
          specialization: data.workType || '',
          avatar: data.profilePicture || null,
          workType: data.workType || '',
          experience: data.experience || 0,
          joinDate: 'N/A', // Backend doesn't return this yet
          rating: data.ratings || 0,
          completedTasks: completedTasks,
          activeTasks: activeTasks,
          rates: data.rates || [],
          workerId: data.workerId
        });
      } else {
        console.error('Failed to fetch worker profile:', response.error);
      }
    } catch (error) {
      console.error('Error fetching worker profile:', error);
    }
    
    setIsLoading(false);
  };

  // Handle profile update
  const handleSaveProfile = async () => {
    const token = getToken();
    
    if (!token) {
      alert('Authentication required. Please login again.');
      return;
    }

    try {
      const updateData = {
        name: profile.name,
        contactNumber: profile.phone,
        profilePicture: profile.avatar
      };

      const response = await workerAPI.updateWorkerProfile(updateData, token);
      
      if (response.success) {
        console.log('Profile updated successfully');
        setIsEditing(false);
        alert('Profile updated successfully!');
        fetchWorkerProfile(); // Refresh profile data
      } else {
        console.error('Failed to update profile:', response.error);
        alert(`Failed to update profile: ${response.error}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  // Handle password change
  const handleChangePassword = () => {
    if (passwords.new !== passwords.confirm) {
      alert('New passwords do not match!');
      return;
    }
    console.log('Changing password');
    alert('Password changed successfully!');
    setShowPasswordModal(false);
    setPasswords({ current: '', new: '', confirm: '' });
  };

  // Handle avatar upload
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Fetch customer ratings for this worker
  const fetchCustomerRatings = async () => {
    setLoadingRatings(true);
    const token = getToken();
    
    if (!token || !profile.workerId) {
      setLoadingRatings(false);
      return;
    }

    try {
      // Fetch rating summary
      const summaryResponse = await ratingAPI.getWorkerRatingSummary(profile.workerId, token);
      if (summaryResponse.success) {
        const summaryData = summaryResponse.data;
        setRatingSummary({
          averageRating: summaryData.averageRating || 0,
          totalRatings: summaryData.totalRatings || 0
        });
      }

      // Fetch individual ratings
      const ratingsResponse = await ratingAPI.getWorkerRatings(profile.workerId, token);
      if (ratingsResponse.success) {
        setCustomerRatings(ratingsResponse.data || []);
      }
    } catch (error) {
      console.error('Error fetching customer ratings:', error);
    }
    
    setLoadingRatings(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="worker" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader className="w-12 h-12 text-purple-600 dark:text-purple-400 animate-spin mx-auto mb-4" />
                <p className="text-lg text-gray-600 dark:text-gray-400">Loading profile...</p>
              </div>
            </div>
          ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Profile</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage your personal information</p>
              </div>
            </div>

            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              {/* Cover Image */}
              <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>

              {/* Profile Info */}
              <div className="px-6 pb-6">
                {/* Avatar */}
                <div className="flex items-end justify-between -mt-16 mb-4">
                  <div className="relative">
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={profile.name}
                        className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <User className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>

                {/* Basic Info */}
                <div className="space-y-4">
                  {isEditing ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Specialization
                        </label>
                        <input
                          type="text"
                          value={profile.specialization}
                          onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
                        />
                      </div>
                      <button
                        onClick={handleSaveProfile}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        Save Changes
                      </button>
                    </>
                  ) : (
                    <>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{profile.name}</h2>
                        <p className="text-gray-600 dark:text-gray-400">{profile.specialization}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{profile.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{profile.phone}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Calendar}
                label="Joining Date"
                value={profile.joinDate}
                color="bg-blue-500"
              />
              <StatCard
                icon={Award}
                label="Tasks Completed"
                value={profile.completedTasks}
                color="bg-green-500"
              />
              <StatCard
                icon={Star}
                label="Average Rating"
                value={`${ratingSummary.averageRating > 0 ? ratingSummary.averageRating.toFixed(1) : '0'}/5`}
                color="bg-yellow-500"
              />
              <StatCard
                icon={Briefcase}
                label="Work Type"
                value={profile.workType || 'N/A'}
                color="bg-purple-500"
              />
            </div>

            {/* Performance Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Performance Overview</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{profile.activeTasks}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Active Tasks</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{profile.completedTasks}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Completed</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {ratingSummary.averageRating > 0 ? ratingSummary.averageRating.toFixed(1) : '0'}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Rating</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Work Rates */}
            {profile.rates && profile.rates.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Work Rates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile.rates.map((rate, index) => (
                    <div key={index} className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{rate.workType}</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{rate.rate}</p>
                        </div>
                        <Briefcase className="w-8 h-8 text-blue-600 dark:text-blue-400 opacity-50" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customer Ratings Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Customer Ratings</h3>
                {loadingRatings && (
                  <Loader className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                )}
              </div>

              {/* Rating Summary */}
              <div className="mb-6 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Rating</p>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {ratingSummary.averageRating.toFixed(1)}
                      </span>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= Math.round(ratingSummary.averageRating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Reviews</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {ratingSummary.totalRatings}
                    </p>
                  </div>
                </div>
              </div>

              {/* Individual Ratings */}
              {loadingRatings ? (
                <div className="text-center py-8">
                  <Loader className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Loading ratings...</p>
                </div>
              ) : customerRatings.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {customerRatings.map((rating, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {rating.customerName?.charAt(0).toUpperCase() || 'C'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {rating.customerName || 'Customer'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Order #{rating.orderId}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= rating.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {rating.review && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 pl-13">
                          "{rating.review}"
                        </p>
                      )}
                      {rating.createdAt && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 pl-13">
                          {new Date(rating.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">No customer ratings yet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    Complete orders to receive ratings from customers
                  </p>
                </div>
              )}
            </div>

            {/* Security Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Security Settings</h3>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center gap-3 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors w-full"
              >
                <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-gray-100">Change Password</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Update your account password</p>
                </div>
              </button>
            </div>
          </motion.div>
          )}
        </main>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Change Password
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
    >
      <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
    </motion.div>
  );
};

export default WorkerProfile;
