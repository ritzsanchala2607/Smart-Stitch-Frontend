import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, X, Upload, CheckCircle, Mail, Phone, Calendar, 
  Award, TrendingUp, User, Briefcase, DollarSign, Star, Package, ArrowLeft, Search
} from 'lucide-react';
import { workers as initialWorkers, orders } from '../../data/dummyData';
import { useState } from 'react';
import { validateWorkerForm } from '../../utils/validation';
import WorkerCard from '../../components/common/WorkerCard';

const Workers = () => {
  const [workers, setWorkers] = useState(initialWorkers);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [editingWorker, setEditingWorker] = useState(null);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [workerForm, setWorkerForm] = useState({
    name: '',
    mobile: '',
    skill: '',
    experience: '',
    salary: '',
    profilePhoto: null
  });

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

  const handleAddWorker = () => {
    const validationErrors = validateWorkerForm(workerForm);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const newWorker = {
      id: `WORK${String(workers.length + 1).padStart(3, '0')}`,
      name: workerForm.name,
      email: `${workerForm.name.toLowerCase().replace(/\s+/g, '.')}@smartstitch.com`,
      phone: workerForm.mobile,
      specialization: workerForm.skill,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'active',
      assignedOrders: 0,
      completedOrders: 0,
      rating: 0,
      performance: 0,
      salary: parseFloat(workerForm.salary),
      avatar: photoPreview || `https://i.pravatar.cc/150?img=${workers.length + 10}`
    };

    setWorkers(prev => [...prev, newWorker]);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);

    // Reset form and close modal
    setWorkerForm({
      name: '',
      mobile: '',
      skill: '',
      experience: '',
      salary: '',
      profilePhoto: null
    });
    setPhotoPreview(null);
    setErrors({});
    setShowAddModal(false);
  };

  const handleEditWorker = (workerId) => {
    const worker = workers.find(w => w.id === workerId);
    if (worker) {
      setEditingWorker(worker);
      setWorkerForm({
        name: worker.name,
        mobile: worker.phone,
        skill: worker.specialization,
        experience: '0', // Not stored in worker object
        salary: worker.salary.toString(),
        profilePhoto: null
      });
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

    const updatedWorker = {
      ...editingWorker,
      name: workerForm.name,
      email: `${workerForm.name.toLowerCase().replace(/\s+/g, '.')}@smartstitch.com`,
      phone: workerForm.mobile,
      specialization: workerForm.skill,
      salary: parseFloat(workerForm.salary),
      avatar: photoPreview || editingWorker.avatar
    };

    setWorkers(prev => prev.map(w => w.id === editingWorker.id ? updatedWorker : w));
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);

    // Reset form and close modal
    setWorkerForm({
      name: '',
      mobile: '',
      skill: '',
      experience: '',
      salary: '',
      profilePhoto: null
    });
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
    <div className="flex h-screen bg-gray-50">
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
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">
                  Worker added successfully!
                </span>
              </motion.div>
            )}

            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Worker Management</h1>
                <p className="text-gray-600 mt-2">Manage your tailoring team</p>
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Worker Details Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Workers List ({filteredWorkers.length})
              </h2>
              
              {filteredWorkers.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">
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
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-2xl font-bold text-gray-900">Add New Worker</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={workerForm.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter worker name"
                    />
                    {errors.name && (
                      <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Mobile */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={workerForm.mobile}
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

                  {/* Skill */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skill <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={workerForm.skill}
                      onChange={(e) => handleInputChange('skill', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                        errors.skill ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select skill</option>
                      <option value="Shirts & Formal Wear">Shirts & Formal Wear</option>
                      <option value="Traditional Wear">Traditional Wear</option>
                      <option value="Alterations">Alterations</option>
                      <option value="Both">Both</option>
                    </select>
                    {errors.skill && (
                      <p className="text-red-600 text-sm mt-1">{errors.skill}</p>
                    )}
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience (years) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={workerForm.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                        errors.experience ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0"
                      min="0"
                    />
                    {errors.experience && (
                      <p className="text-red-600 text-sm mt-1">{errors.experience}</p>
                    )}
                  </div>

                  {/* Salary */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Salary <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={workerForm.salary}
                      onChange={(e) => handleInputChange('salary', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                        errors.salary ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                    {errors.salary && (
                      <p className="text-red-600 text-sm mt-1">{errors.salary}</p>
                    )}
                  </div>

                  {/* Profile Photo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Photo
                    </label>
                    
                    {!photoPreview ? (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Click to upload</span>
                        <span className="text-xs text-gray-500 mt-1">JPG, PNG (max 5MB)</span>
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
                      <p className="text-red-600 text-sm mt-1">{errors.profilePhoto}</p>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
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

      {/* Edit Worker Modal */}
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
                mobile: '',
                skill: '',
                experience: '',
                salary: '',
                profilePhoto: null
              });
              setPhotoPreview(null);
              setErrors({});
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-2xl font-bold text-gray-900">Edit Worker</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingWorker(null);
                    setWorkerForm({
                      name: '',
                      mobile: '',
                      skill: '',
                      experience: '',
                      salary: '',
                      profilePhoto: null
                    });
                    setPhotoPreview(null);
                    setErrors({});
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={workerForm.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter worker name"
                    />
                    {errors.name && (
                      <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Mobile */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={workerForm.mobile}
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

                  {/* Skill */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skill <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={workerForm.skill}
                      onChange={(e) => handleInputChange('skill', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                        errors.skill ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select skill</option>
                      <option value="Shirts & Formal Wear">Shirts & Formal Wear</option>
                      <option value="Traditional Wear">Traditional Wear</option>
                      <option value="Alterations">Alterations</option>
                      <option value="Both">Both</option>
                    </select>
                    {errors.skill && (
                      <p className="text-red-600 text-sm mt-1">{errors.skill}</p>
                    )}
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience (years) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={workerForm.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                        errors.experience ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0"
                      min="0"
                    />
                    {errors.experience && (
                      <p className="text-red-600 text-sm mt-1">{errors.experience}</p>
                    )}
                  </div>

                  {/* Salary */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Salary <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={workerForm.salary}
                      onChange={(e) => handleInputChange('salary', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                        errors.salary ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                    {errors.salary && (
                      <p className="text-red-600 text-sm mt-1">{errors.salary}</p>
                    )}
                  </div>

                  {/* Profile Photo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Photo
                    </label>
                    
                    {!photoPreview ? (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Click to upload</span>
                        <span className="text-xs text-gray-500 mt-1">JPG, PNG (max 5MB)</span>
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
                      <p className="text-red-600 text-sm mt-1">{errors.profilePhoto}</p>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
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
                        salary: '',
                        profilePhoto: null
                      });
                      setPhotoPreview(null);
                      setErrors({});
                    }}
                    className="flex-1 py-3 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
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
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <h2 className="text-2xl font-bold text-gray-900">Worker Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {/* Personal Information Section */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Personal Information</h3>
                  
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Avatar */}
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

                    {/* Worker Details Grid */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-orange-500 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">Name</p>
                          <p className="text-lg font-semibold text-gray-900">{selectedWorker.name}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-orange-500 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="text-lg font-semibold text-gray-900">{selectedWorker.email}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-orange-500 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="text-lg font-semibold text-gray-900">{selectedWorker.phone}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Briefcase className="w-5 h-5 text-orange-500 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">Specialization</p>
                          <p className="text-lg font-semibold text-gray-900">{selectedWorker.specialization}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-orange-500 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">Join Date</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {new Date(selectedWorker.joinDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <DollarSign className="w-5 h-5 text-orange-500 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">Salary</p>
                          <p className="text-lg font-semibold text-gray-900">${selectedWorker.salary}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Award className="w-5 h-5 text-orange-500 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                              selectedWorker.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : selectedWorker.status === 'on-leave'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {selectedWorker.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Star className="w-5 h-5 text-orange-500 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">Rating</p>
                          <p className="text-lg font-semibold text-gray-900">{selectedWorker.rating} / 5.0</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Statistics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <Package className="w-8 h-8 text-blue-500" />
                        <div>
                          <p className="text-sm text-gray-600">Assigned Orders</p>
                          <p className="text-2xl font-bold text-gray-900">{selectedWorker.assignedOrders}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <Award className="w-8 h-8 text-green-500" />
                        <div>
                          <p className="text-sm text-gray-600">Completed Orders</p>
                          <p className="text-2xl font-bold text-gray-900">{selectedWorker.completedOrders}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-orange-500" />
                        <div>
                          <p className="text-sm text-gray-600">Performance</p>
                          <p className="text-2xl font-bold text-gray-900">{selectedWorker.performance}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Meter Section */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Performance Metrics</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Overall Performance</span>
                        <span className="text-sm font-bold text-gray-900">{selectedWorker.performance}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${selectedWorker.performance}%` }}
                          transition={{ duration: 1 }}
                          className={`h-4 rounded-full ${
                            selectedWorker.performance >= 90
                              ? 'bg-green-500'
                              : selectedWorker.performance >= 70
                              ? 'bg-orange-500'
                              : 'bg-red-500'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
                        <p className="text-xl font-bold text-gray-900">
                          {selectedWorker.completedOrders > 0
                            ? Math.round((selectedWorker.completedOrders / (selectedWorker.completedOrders + selectedWorker.assignedOrders)) * 100)
                            : 0}%
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Average Rating</p>
                        <p className="text-xl font-bold text-gray-900">{selectedWorker.rating} / 5.0</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assigned Orders Section */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Assigned Orders</h3>
                  
                  {assignedOrders.length > 0 ? (
                    <div className="space-y-4">
                      {assignedOrders.map((order) => (
                        <div
                          key={order.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-lg font-semibold text-gray-900">{order.id}</h4>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    order.status === 'ready'
                                      ? 'bg-green-100 text-green-800'
                                      : order.status === 'stitching'
                                      ? 'bg-blue-100 text-blue-800'
                                      : order.status === 'cutting'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {order.status}
                                </span>
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-1">
                                Customer: <span className="font-medium text-gray-900">{order.customerName}</span>
                              </p>
                              
                              <p className="text-sm text-gray-600">
                                Delivery Date:{' '}
                                <span className="font-medium text-gray-900">
                                  {new Date(order.deliveryDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </p>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              <p className="text-lg font-bold text-gray-900">${order.totalAmount}</p>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  order.priority === 'high'
                                    ? 'bg-red-100 text-red-800'
                                    : order.priority === 'medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {order.priority} priority
                              </span>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-sm text-gray-600 mb-2">Items:</p>
                            <div className="flex flex-wrap gap-2">
                              {order.items.map((item) => (
                                <span
                                  key={item.id}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                >
                                  {item.type} ({item.quantity})
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No orders currently assigned to this worker</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="flex-1 py-3 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
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
