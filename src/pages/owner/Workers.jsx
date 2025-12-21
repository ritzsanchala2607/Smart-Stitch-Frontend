import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion, AnimatePresence } from 'framer-motion';
import usePageTitle from '../../hooks/usePageTitle';
import { 
  Plus, X, Upload, CheckCircle, Mail, Phone, Calendar, 
  Award, TrendingUp, User, Briefcase, DollarSign, Star, Package, Search, Eye, EyeOff
} from 'lucide-react';
import { workers as initialWorkers, orders } from '../../data/dummyData';
import { useState } from 'react';
import { validateWorkerForm } from '../../utils/validation';
import WorkerCard from '../../components/common/WorkerCard';
import { workerAPI } from '../../services/api';

const Workers = () => {
  usePageTitle('Workers');
  // Garment types for dropdown
  const garmentTypes = [
    { value: 'shirt', label: 'Shirt' },
    { value: 'pant', label: 'Pant' },
    { value: 'kurta', label: 'Kurta' },
    { value: 'blouse', label: 'Blouse' },
    { value: 'suit', label: 'Suit' },
    { value: 'alteration', label: 'Alteration' }
  ];

  const [workers, setWorkers] = useState(initialWorkers);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [editingWorker, setEditingWorker] = useState(null);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  
  const [workerForm, setWorkerForm] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    primarySkill: '', // New field for Stitching, Cutting, etc.
    specialization: '', // Existing field for Shirts, Traditional, etc.
    experience: '',
    garmentTypes: [], // Array of {type, rate} objects
    profilePhoto: null
  });

  const [currentGarmentType, setCurrentGarmentType] = useState('');
  const [currentRate, setCurrentRate] = useState('');
  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);

  const handleInputChange = (field, value) => {
    setWorkerForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleAddGarmentType = () => {
    if (!currentGarmentType) {
      setErrors(prev => ({ ...prev, garmentType: 'Please select a garment type' }));
      return;
    }
    if (!currentRate || parseFloat(currentRate) <= 0) {
      setErrors(prev => ({ ...prev, rate: 'Please enter a valid rate' }));
      return;
    }

    // Check if garment type already exists
    const exists = workerForm.garmentTypes.find(g => g.type === currentGarmentType);
    if (exists) {
      setErrors(prev => ({ ...prev, garmentType: 'This garment type is already added' }));
      return;
    }

    setWorkerForm(prev => ({
      ...prev,
      garmentTypes: [...prev.garmentTypes, { type: currentGarmentType, rate: parseFloat(currentRate) }]
    }));

    // Reset current inputs
    setCurrentGarmentType('');
    setCurrentRate('');
    setErrors({});
  };

  const handleRemoveGarmentType = (typeToRemove) => {
    setWorkerForm(prev => ({
      ...prev,
      garmentTypes: prev.garmentTypes.filter(g => g.type !== typeToRemove)
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          profilePhoto: 'Please upload a valid image file (JPG, PNG, or GIF)'
        }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          profilePhoto: 'File size must be less than 5MB'
        }));
        return;
      }

      setWorkerForm(prev => ({
        ...prev,
        profilePhoto: file
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);

      setErrors(prev => ({
        ...prev,
        profilePhoto: ''
      }));
    }
  };

  const handleRemovePhoto = () => {
    setWorkerForm(prev => ({
      ...prev,
      profilePhoto: null
    }));
    setPhotoPreview(null);
  };

  const handleViewDetails = (workerId) => {
    const worker = workers.find(w => w.id === workerId);
    if (worker) {
      setSelectedWorker(worker);
      const workerOrders = orders.filter(order => order.assignedWorker === workerId);
      setAssignedOrders(workerOrders);
      setShowViewModal(true);
    }
  };

  const handleAddWorker = async () => {
    const validationErrors = validateWorkerForm(workerForm);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (workerForm.garmentTypes.length === 0) {
      setErrors({ garmentType: 'Please add at least one garment type' });
      return;
    }

    // Get JWT token from localStorage
    // Check both locations: separate 'token' key or inside 'user' object
    let token = localStorage.getItem('token');
    
    if (!token) {
      const userDataString = localStorage.getItem('user');
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          token = userData.jwt || userData.token; // Check both jwt and token fields
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    }
    
    console.log('Token found:', token ? 'Yes (length: ' + token.length + ')' : 'No');
    console.log('User data in localStorage:', localStorage.getItem('user'));
    console.log('Token value (first 50 chars):', token ? token.substring(0, 50) + '...' : 'null');
    
    if (!token) {
      setErrors({ api: 'User not authenticated. Please login again.' });
      return;
    }

    try {
      // Prepare API payload
      const payload = {
        user: {
          name: workerForm.name,
          email: workerForm.email,
          password: workerForm.password,
          contactNumber: workerForm.mobile,
          roleId: 2, // Worker role ID (as per API spec)
          profilePicture: photoPreview || null
        },
        worker: {
          workType: workerForm.primarySkill.toUpperCase().replace(/\s+/g, '_'), // Convert to enum format (e.g., "TAILOR")
          experience: parseInt(workerForm.experience) || 0
        },
        rates: workerForm.garmentTypes.map(item => ({
          workType: item.type.toUpperCase(), // Convert to uppercase for API (e.g., "SHIRT", "PANT")
          rate: parseFloat(item.rate)
        }))
      };

      console.log('Creating worker with payload:', payload);

      // Use the API service
      const result = await workerAPI.addWorker(payload, token);

      console.log('API Result:', result);

      if (!result.success) {
        // Provide more specific error messages
        if (result.error.includes('403')) {
          throw new Error('Access denied. Please ensure you are logged in as a shop owner and have the necessary permissions.');
        }
        throw new Error(result.error);
      }

      console.log('Worker created successfully:', result.data);

      // Add to local state for display
      const newWorker = {
        id: `WORK${String(workers.length + 1).padStart(3, '0')}`,
        name: workerForm.name,
        email: workerForm.email,
        phone: workerForm.mobile,
        primarySkill: workerForm.primarySkill,
        specialization: workerForm.specialization,
        joinDate: new Date().toISOString().split('T')[0],
        status: 'active',
        assignedOrders: 0,
        completedOrders: 0,
        rating: 0,
        performance: 0,
        garmentTypes: workerForm.garmentTypes,
        avatar: photoPreview || `https://i.pravatar.cc/150?img=${workers.length + 10}`
      };

      setWorkers(prev => [...prev, newWorker]);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);

      // Reset form and close modal
      setWorkerForm({
        name: '',
        email: '',
        password: '',
        mobile: '',
        primarySkill: '',
        specialization: '',
        experience: '',
        garmentTypes: [],
        profilePhoto: null
      });
      setCurrentGarmentType('');
      setCurrentRate('');
      setPhotoPreview(null);
      setErrors({});
      setShowAddModal(false);
    } catch (error) {
      console.error('Error creating worker:', error);
      setErrors({ api: error.message || 'Failed to create worker' });
    }
  };

  const handleEditWorker = (workerId) => {
    const worker = workers.find(w => w.id === workerId);
    if (worker) {
      setEditingWorker(worker);
      setWorkerForm({
        name: worker.name,
        email: worker.email || '',
        password: '', // Don't populate password for security
        mobile: worker.phone,
        primarySkill: worker.primarySkill || '',
        specialization: worker.specialization || '',
        experience: '0',
        garmentTypes: worker.garmentTypes || [],
        profilePhoto: null
      });
      setCurrentGarmentType('');
      setCurrentRate('');
      setPhotoPreview(worker.avatar);
      setShowEditModal(true);
    }
  };

  const handleUpdateWorker = () => {
    const validationErrors = validateWorkerForm(workerForm);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (workerForm.garmentTypes.length === 0) {
      setErrors({ garmentType: 'Please add at least one garment type' });
      return;
    }

    const updatedWorker = {
      ...editingWorker,
      name: workerForm.name,
      email: workerForm.email,
      // Only update password if a new one is provided
      ...(workerForm.password && { password: workerForm.password }),
      phone: workerForm.mobile,
      primarySkill: workerForm.primarySkill,
      specialization: workerForm.specialization,
      garmentTypes: workerForm.garmentTypes,
      avatar: photoPreview || editingWorker.avatar
    };

    setWorkers(prev => prev.map(w => w.id === editingWorker.id ? updatedWorker : w));
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);

    // Reset form and close modal
    setWorkerForm({
      name: '',
      email: '',
      password: '',
      mobile: '',
      primarySkill: '',
      specialization: '',
      experience: '',
      garmentTypes: [],
      profilePhoto: null
    });
    setCurrentGarmentType('');
    setCurrentRate('');
    setPhotoPreview(null);
    setErrors({});
    setEditingWorker(null);
    setShowEditModal(false);
  };

  const handleDeleteWorker = (workerId) => {
    if (window.confirm('Are you sure you want to delete this worker?')) {
      setWorkers(prev => prev.filter(w => w.id !== workerId));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  // Filter workers based on search query
  const filteredWorkers = workers.filter(worker =>
    worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.phone.includes(searchQuery) ||
    worker.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="owner" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            {/* Success Message */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -50, scale: 0.9 }}
                  className="fixed top-6 right-6 z-50 bg-white dark:bg-gray-800 border-l-4 border-green-500 rounded-lg shadow-2xl p-6 max-w-md"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-7 h-7 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                        Worker Added Successfully!
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        The worker has been added to your team and can now be assigned to orders.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowSuccess(false)}
                      className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Worker Management</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your tailoring team</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="bg-orange-500 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-orange-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Worker
              </motion.button>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search workers by name, email, phone, or specialization..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            {/* Worker Details Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Workers List ({filteredWorkers.length})
              </h2>
              
              {filteredWorkers.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                  <User className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchQuery ? 'No workers found matching your search.' : 'No workers yet. Add your first worker!'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredWorkers.map((worker) => (
                    <WorkerCard
                      key={worker.id}
                      worker={worker}
                      onViewDetails={handleViewDetails}
                      onEdit={handleEditWorker}
                      onDelete={handleDeleteWorker}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </main>
      </div>

      {/* Add Worker Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Add New Worker</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {/* API Error Message */}
                {errors.api && (
                  <div className="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 flex items-center gap-3">
                    <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <span className="text-red-800 dark:text-red-300 font-medium">
                      {errors.api}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={workerForm.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                        errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Enter worker name"
                    />
                    {errors.name && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={workerForm.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                        errors.email ? 'border-red-500 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="worker@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.email}</p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Worker will use this email to login
                    </p>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={workerForm.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                          errors.password ? 'border-red-500 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.password}</p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Minimum 6 characters
                    </p>
                  </div>

                  {/* Mobile */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mobile <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={workerForm.mobile}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 10) {
                          handleInputChange('mobile', value);
                        }
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                        errors.mobile ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="1234567890"
                      maxLength="10"
                    />
                    {errors.mobile && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.mobile}</p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Must be exactly 10 digits
                    </p>
                  </div>

                  {/* Primary Skill */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Primary Skill <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={workerForm.primarySkill}
                      onChange={(e) => handleInputChange('primarySkill', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                        errors.primarySkill ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <option value="">Select primary skill</option>
                      <option value="Stitching">Stitching</option>
                      <option value="Cutting">Cutting</option>
                      <option value="Fitting">Fitting</option>
                      <option value="Iron Work">Iron Work</option>
                      <option value="Embroidery">Embroidery</option>
                      <option value="Alterations">Alterations</option>
                      <option value="All-Round">All-Round (Multiple Skills)</option>
                    </select>
                    {errors.primarySkill && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.primarySkill}</p>
                    )}
                  </div>

                  {/* Specialization */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Specialization <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={workerForm.specialization}
                      onChange={(e) => handleInputChange('specialization', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                        errors.specialization ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <option value="">Select specialization</option>
                      <option value="Shirts & Formal Wear">Shirts & Formal Wear</option>
                      <option value="Pants & Trousers">Pants & Trousers</option>
                      <option value="Traditional Wear">Traditional Wear</option>
                      <option value="Suits & Coats">Suits & Coats</option>
                      <option value="Blouses & Tops">Blouses & Tops</option>
                      <option value="Wedding & Bridal">Wedding & Bridal</option>
                      <option value="Alterations">Alterations</option>
                      <option value="All Types">All Types</option>
                    </select>
                    {errors.specialization && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.specialization}</p>
                    )}
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Experience (years) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={workerForm.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                        errors.experience ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="0"
                      min="0"
                    />
                    {errors.experience && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.experience}</p>
                    )}
                  </div>

                  {/* Garment Types & Rates Section */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-orange-500" />
                        Garment Types & Rates <span className="text-red-500">*</span>
                      </div>
                    </label>

                    {/* Add Garment Type Form */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                      <div>
                        <select
                          value={currentGarmentType}
                          onChange={(e) => {
                            setCurrentGarmentType(e.target.value);
                            setErrors(prev => ({ ...prev, garmentType: '' }));
                          }}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                            errors.garmentType ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          <option value="">Select type</option>
                          {garmentTypes.map((garment) => (
                            <option key={garment.value} value={garment.value}>
                              {garment.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">₹</span>
                        <input
                          type="number"
                          value={currentRate}
                          onChange={(e) => {
                            setCurrentRate(e.target.value);
                            setErrors(prev => ({ ...prev, rate: '' }));
                          }}
                          className={`w-full pl-7 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                            errors.rate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                          placeholder="Enter rate"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleAddGarmentType}
                        className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    </div>

                    {errors.garmentType && (
                      <p className="text-red-600 dark:text-red-400 text-sm mb-2">{errors.garmentType}</p>
                    )}
                    {errors.rate && (
                      <p className="text-red-600 dark:text-red-400 text-sm mb-2">{errors.rate}</p>
                    )}

                    {/* Display Added Garment Types */}
                    {workerForm.garmentTypes.length > 0 && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Added Garment Types:</p>
                        <div className="space-y-2">
                          {workerForm.garmentTypes.map((item) => (
                            <div key={item.type} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                              <div className="flex items-center gap-3">
                                <Package className="w-4 h-4 text-orange-500" />
                                <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                                  {garmentTypes.find(g => g.value === item.type)?.label}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400">-</span>
                                <span className="font-bold text-gray-900 dark:text-gray-100">₹{item.rate}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveGarmentType(item.type)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                      💡 Add one or more garment types with their rates. Worker can work on multiple types.
                    </p>
                  </div>

                  {/* Profile Photo */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Profile Photo
                    </label>
                    
                    {!photoPreview ? (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-orange-500 transition-colors bg-white dark:bg-gray-700">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Click to upload</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">JPG, PNG (max 5MB)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="relative w-32 h-32">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          onClick={handleRemovePhoto}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    {errors.profilePhoto && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.profilePhoto}</p>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 rounded-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddWorker}
                    className="flex-1 py-3 rounded-lg font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
                  >
                    Add Worker
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Worker Modal - Similar structure to Add Modal */}
      <AnimatePresence>
        {showEditModal && editingWorker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowEditModal(false);
              setEditingWorker(null);
              setWorkerForm({
                name: '',
                email: '',
                password: '',
                mobile: '',
                primarySkill: '',
                specialization: '',
                experience: '',
                garmentTypes: [],
                profilePhoto: null
              });
              setCurrentGarmentType('');
              setCurrentRate('');
              setPhotoPreview(null);
              setErrors({});
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Worker</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingWorker(null);
                    setWorkerForm({
                      name: '',
                      email: '',
                      password: '',
                      mobile: '',
                      primarySkill: '',
                      specialization: '',
                      experience: '',
                      garmentTypes: [],
                      profilePhoto: null
                    });
                    setCurrentGarmentType('');
                    setCurrentRate('');
                    setPhotoPreview(null);
                    setErrors({});
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={workerForm.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                        errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Enter worker name"
                    />
                    {errors.name && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={workerForm.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                        errors.email ? 'border-red-500 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="worker@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showEditPassword ? 'text' : 'password'}
                        value={workerForm.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                          errors.password ? 'border-red-500 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="Leave blank to keep current"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditPassword(!showEditPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        {showEditPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.password}</p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Leave blank to keep current password
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mobile <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={workerForm.mobile}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 10) {
                          handleInputChange('mobile', value);
                        }
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                        errors.mobile ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="1234567890"
                      maxLength="10"
                    />
                    {errors.mobile && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.mobile}</p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Must be exactly 10 digits
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Primary Skill <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={workerForm.primarySkill}
                      onChange={(e) => handleInputChange('primarySkill', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                        errors.primarySkill ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <option value="">Select primary skill</option>
                      <option value="Stitching">Stitching</option>
                      <option value="Cutting">Cutting</option>
                      <option value="Fitting">Fitting</option>
                      <option value="Iron Work">Iron Work</option>
                      <option value="Embroidery">Embroidery</option>
                      <option value="Alterations">Alterations</option>
                      <option value="All-Round">All-Round (Multiple Skills)</option>
                    </select>
                    {errors.primarySkill && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.primarySkill}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Specialization <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={workerForm.specialization}
                      onChange={(e) => handleInputChange('specialization', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                        errors.specialization ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <option value="">Select specialization</option>
                      <option value="Shirts & Formal Wear">Shirts & Formal Wear</option>
                      <option value="Pants & Trousers">Pants & Trousers</option>
                      <option value="Traditional Wear">Traditional Wear</option>
                      <option value="Suits & Coats">Suits & Coats</option>
                      <option value="Blouses & Tops">Blouses & Tops</option>
                      <option value="Wedding & Bridal">Wedding & Bridal</option>
                      <option value="Alterations">Alterations</option>
                      <option value="All Types">All Types</option>
                    </select>
                    {errors.specialization && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.specialization}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Experience (years) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={workerForm.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                        errors.experience ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="0"
                      min="0"
                    />
                    {errors.experience && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.experience}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-orange-500" />
                        Garment Types & Rates <span className="text-red-500">*</span>
                      </div>
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                      <div>
                        <select
                          value={currentGarmentType}
                          onChange={(e) => {
                            setCurrentGarmentType(e.target.value);
                            setErrors(prev => ({ ...prev, garmentType: '' }));
                          }}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                            errors.garmentType ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          <option value="">Select type</option>
                          {garmentTypes.map((garment) => (
                            <option key={garment.value} value={garment.value}>
                              {garment.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">₹</span>
                        <input
                          type="number"
                          value={currentRate}
                          onChange={(e) => {
                            setCurrentRate(e.target.value);
                            setErrors(prev => ({ ...prev, rate: '' }));
                          }}
                          className={`w-full pl-7 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                            errors.rate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                          placeholder="Enter rate"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleAddGarmentType}
                        className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    </div>

                    {errors.garmentType && (
                      <p className="text-red-600 dark:text-red-400 text-sm mb-2">{errors.garmentType}</p>
                    )}
                    {errors.rate && (
                      <p className="text-red-600 dark:text-red-400 text-sm mb-2">{errors.rate}</p>
                    )}

                    {workerForm.garmentTypes.length > 0 && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Added Garment Types:</p>
                        <div className="space-y-2">
                          {workerForm.garmentTypes.map((item) => (
                            <div key={item.type} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                              <div className="flex items-center gap-3">
                                <Package className="w-4 h-4 text-orange-500" />
                                <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                                  {garmentTypes.find(g => g.value === item.type)?.label}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400">-</span>
                                <span className="font-bold text-gray-900 dark:text-gray-100">₹{item.rate}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveGarmentType(item.type)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                      💡 Add one or more garment types with their rates. Worker can work on multiple types.
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Profile Photo
                    </label>
                    
                    {!photoPreview ? (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-orange-500 transition-colors bg-white dark:bg-gray-700">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Click to upload</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">JPG, PNG (max 5MB)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="relative w-32 h-32">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          onClick={handleRemovePhoto}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    {errors.profilePhoto && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.profilePhoto}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingWorker(null);
                      setWorkerForm({
                        name: '',
                        mobile: '',
                        skill: '',
                        experience: '',
                        garmentTypes: [],
                        profilePhoto: null
                      });
                      setCurrentGarmentType('');
                      setCurrentRate('');
                      setPhotoPreview(null);
                      setErrors({});
                    }}
                    className="flex-1 py-3 rounded-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUpdateWorker}
                    className="flex-1 py-3 rounded-lg font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
                  >
                    Update Worker
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Worker Details Modal */}
      <AnimatePresence>
        {showViewModal && selectedWorker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowViewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Worker Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Personal Information</h3>
                  
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0">
                      {selectedWorker.avatar ? (
                        <img
                          src={selectedWorker.avatar}
                          alt={selectedWorker.name}
                          className="w-32 h-32 rounded-full object-cover border-4 border-orange-100"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-orange-100">
                          <User className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-orange-500 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedWorker.name}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-orange-500 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedWorker.email}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-orange-500 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedWorker.phone}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Award className="w-5 h-5 text-orange-500 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Primary Skill</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedWorker.primarySkill || 'Not specified'}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Briefcase className="w-5 h-5 text-orange-500 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Specialization</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedWorker.specialization}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-orange-500 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Join Date</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {new Date(selectedWorker.joinDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="md:col-span-2 flex items-start gap-3">
                        <Package className="w-5 h-5 text-orange-500 mt-1" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Garment Types & Rates</p>
                          {selectedWorker.garmentTypes && selectedWorker.garmentTypes.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {selectedWorker.garmentTypes.map((item) => (
                                <div key={item.type} className="bg-gray-50 dark:bg-gray-700 rounded px-2 py-1">
                                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                    {garmentTypes.find(g => g.value === item.type)?.label}
                                  </p>
                                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">₹{item.rate}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No garment types assigned</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Award className="w-5 h-5 text-orange-500 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                              selectedWorker.status === 'active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : selectedWorker.status === 'on-leave'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {selectedWorker.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Star className="w-5 h-5 text-orange-500 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedWorker.rating} / 5.0</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <Package className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Assigned Orders</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedWorker.assignedOrders}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <Award className="w-8 h-8 text-green-500 dark:text-green-400" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Completed Orders</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedWorker.completedOrders}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-orange-500 dark:text-orange-400" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Performance</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedWorker.performance}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="flex-1 py-3 rounded-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Workers;
