import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Upload, X, CheckCircle } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import WorkerCard from '../../components/common/WorkerCard';
import { workers as initialWorkers } from '../../data/dummyData';
import { validateWorkerForm } from '../../utils/validation';

const AddWorker = () => {
  const navigate = useNavigate();
  
  const [workerForm, setWorkerForm] = useState({
    name: '',
    mobile: '',
    skill: '',
    experience: '',
    salary: '',
    profilePhoto: null
  });

  const [workers, setWorkers] = useState(initialWorkers);
  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (field, value) => {
    setWorkerForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
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
          profilePhoto: 'Please upload a valid image file (JPG, PNG, or GIF)'
        }));
        return;
      }

      // Validate file size (max 5MB)
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

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Clear error
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

  const handleAddWorker = () => {
    // Validate form
    const validationErrors = validateWorkerForm(workerForm);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Create new worker object
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

    // Add worker to list
    setWorkers(prev => [...prev, newWorker]);

    // Show success message
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);

    // Reset form
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
  };

  const handleViewDetails = (workerId) => {
    navigate(`/owner/worker/${workerId}`);
  };

  const handleEdit = (workerId) => {
    // For now, just show an alert. In a real app, this would open an edit modal
    alert(`Edit worker ${workerId} - This feature will be implemented in a future update`);
  };

  const handleDelete = (workerId) => {
    if (window.confirm('Are you sure you want to delete this worker?')) {
      setWorkers(prev => prev.filter(w => w.id !== workerId));
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="owner" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar role="owner" />
        
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <UserPlus className="w-8 h-8 text-orange-500" />
                Add Worker
              </h1>
              <p className="text-gray-600 mt-2">
                Add new workers to your team and manage their information
              </p>
            </div>

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

            {/* Add Worker Form */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Worker Information
              </h2>

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
                    <option value="Shirt">Shirt</option>
                    <option value="Pant">Pant</option>
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
                      <span className="text-sm text-gray-600">Click to upload photo</span>
                      <span className="text-xs text-gray-500 mt-1">JPG, PNG or GIF (max 5MB)</span>
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

              {/* Add Worker Button */}
              <div className="mt-6 flex justify-end">
                <motion.button
                  onClick={handleAddWorker}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  Add Worker
                </motion.button>
              </div>
            </div>

            {/* Workers List */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Workers List ({workers.length})
              </h2>
              
              {workers.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No workers yet. Add your first worker above!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {workers.map((worker) => (
                    <WorkerCard
                      key={worker.id}
                      worker={worker}
                      onViewDetails={handleViewDetails}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AddWorker;
