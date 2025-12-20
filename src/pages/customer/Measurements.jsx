import { useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ruler,
  Save,
  Plus,
  Edit2,
  Trash2,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  History
} from 'lucide-react';

const Measurements = () => {
  // Mock customer ID (in real app, this would come from auth context)
  const currentCustomerId = 'CUST001';

  // State for profiles
  const [profiles, setProfiles] = useState([
    {
      id: 1,
      name: 'My Measurements',
      isDefault: true,
      createdAt: '2024-01-15',
      updatedAt: '2024-03-10',
      measurements: {
        shirt: {
          chest: '38',
          shoulder: '16',
          sleeveLength: '24',
          neck: '15',
          waist: '32',
          shirtLength: '28'
        },
        pant: {
          waist: '32',
          hip: '38',
          inseam: '30',
          outseam: '40',
          thigh: '22',
          knee: '16',
          ankle: '14'
        },
        kurta: {
          chest: '38',
          shoulder: '16',
          sleeveLength: '24',
          kurtaLength: '42',
          waist: '32'
        },
        custom: [
          { label: 'Arm Hole', value: '18' },
          { label: 'Cuff', value: '9' }
        ]
      }
    }
  ]);

  const [selectedProfile, setSelectedProfile] = useState(profiles[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [expandedCategory, setExpandedCategory] = useState('shirt');
  const [successMessage, setSuccessMessage] = useState('');
  const [editedMeasurements, setEditedMeasurements] = useState(selectedProfile.measurements);

  // Mock measurement history
  const measurementHistory = [
    { id: 1, date: '2024-03-10', profile: 'My Measurements', category: 'Shirt', field: 'Chest', oldValue: '37', newValue: '38', updatedBy: 'Self' },
    { id: 2, date: '2024-02-20', profile: 'My Measurements', category: 'Pant', field: 'Waist', oldValue: '31', newValue: '32', updatedBy: 'Self' },
    { id: 3, date: '2024-01-15', profile: 'My Measurements', category: 'All', field: 'Initial Setup', oldValue: '-', newValue: 'Complete', updatedBy: 'Self' }
  ];

  // Handle measurement change
  const handleMeasurementChange = (category, field, value) => {
    setEditedMeasurements(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  // Handle custom measurement change
  const handleCustomChange = (index, field, value) => {
    const newCustom = [...editedMeasurements.custom];
    newCustom[index] = { ...newCustom[index], [field]: value };
    setEditedMeasurements(prev => ({
      ...prev,
      custom: newCustom
    }));
  };

  // Add custom measurement
  const addCustomMeasurement = () => {
    setEditedMeasurements(prev => ({
      ...prev,
      custom: [...prev.custom, { label: '', value: '' }]
    }));
  };

  // Remove custom measurement
  const removeCustomMeasurement = (index) => {
    setEditedMeasurements(prev => ({
      ...prev,
      custom: prev.custom.filter((_, i) => i !== index)
    }));
  };

  // Save measurements
  const handleSave = () => {
    const updatedProfiles = profiles.map(p => 
      p.id === selectedProfile.id 
        ? { ...p, measurements: editedMeasurements, updatedAt: new Date().toISOString().split('T')[0] }
        : p
    );
    setProfiles(updatedProfiles);
    setSelectedProfile({ ...selectedProfile, measurements: editedMeasurements });
    setIsEditing(false);
    setSuccessMessage('Measurements saved successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Cancel editing
  const handleCancel = () => {
    setEditedMeasurements(selectedProfile.measurements);
    setIsEditing(false);
  };

  // Add new profile
  const handleAddProfile = () => {
    if (!newProfileName.trim()) return;
    
    const newProfile = {
      id: profiles.length + 1,
      name: newProfileName,
      isDefault: false,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      measurements: {
        shirt: { chest: '', shoulder: '', sleeveLength: '', neck: '', waist: '', shirtLength: '' },
        pant: { waist: '', hip: '', inseam: '', outseam: '', thigh: '', knee: '', ankle: '' },
        kurta: { chest: '', shoulder: '', sleeveLength: '', kurtaLength: '', waist: '' },
        custom: []
      }
    };
    
    setProfiles([...profiles, newProfile]);
    setSelectedProfile(newProfile);
    setEditedMeasurements(newProfile.measurements);
    setNewProfileName('');
    setShowAddProfile(false);
    setIsEditing(true);
    setSuccessMessage('New profile created! Please add measurements.');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Delete profile
  const handleDeleteProfile = (profileId) => {
    if (profiles.length === 1) {
      alert('Cannot delete the last profile!');
      return;
    }
    const updatedProfiles = profiles.filter(p => p.id !== profileId);
    setProfiles(updatedProfiles);
    if (selectedProfile.id === profileId) {
      setSelectedProfile(updatedProfiles[0]);
      setEditedMeasurements(updatedProfiles[0].measurements);
    }
    setSuccessMessage('Profile deleted successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Measurement categories configuration
  const categories = {
    shirt: {
      label: 'Shirt Measurements',
      icon: '👔',
      fields: [
        { key: 'chest', label: 'Chest', unit: 'inches', placeholder: 'e.g., 38' },
        { key: 'shoulder', label: 'Shoulder', unit: 'inches', placeholder: 'e.g., 16' },
        { key: 'sleeveLength', label: 'Sleeve Length', unit: 'inches', placeholder: 'e.g., 24' },
        { key: 'neck', label: 'Neck', unit: 'inches', placeholder: 'e.g., 15' },
        { key: 'waist', label: 'Waist', unit: 'inches', placeholder: 'e.g., 32' },
        { key: 'shirtLength', label: 'Shirt Length', unit: 'inches', placeholder: 'e.g., 28' }
      ]
    },
    pant: {
      label: 'Pant Measurements',
      icon: '👖',
      fields: [
        { key: 'waist', label: 'Waist', unit: 'inches', placeholder: 'e.g., 32' },
        { key: 'hip', label: 'Hip', unit: 'inches', placeholder: 'e.g., 38' },
        { key: 'inseam', label: 'Inseam', unit: 'inches', placeholder: 'e.g., 30' },
        { key: 'outseam', label: 'Outseam', unit: 'inches', placeholder: 'e.g., 40' },
        { key: 'thigh', label: 'Thigh', unit: 'inches', placeholder: 'e.g., 22' },
        { key: 'knee', label: 'Knee', unit: 'inches', placeholder: 'e.g., 16' },
        { key: 'ankle', label: 'Ankle', unit: 'inches', placeholder: 'e.g., 14' }
      ]
    },
    kurta: {
      label: 'Kurta / Blouse Measurements',
      icon: '🥻',
      fields: [
        { key: 'chest', label: 'Chest', unit: 'inches', placeholder: 'e.g., 38' },
        { key: 'shoulder', label: 'Shoulder', unit: 'inches', placeholder: 'e.g., 16' },
        { key: 'sleeveLength', label: 'Sleeve Length', unit: 'inches', placeholder: 'e.g., 24' },
        { key: 'kurtaLength', label: 'Kurta Length', unit: 'inches', placeholder: 'e.g., 42' },
        { key: 'waist', label: 'Waist', unit: 'inches', placeholder: 'e.g., 32' }
      ]
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="customer" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Ruler className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Measurements</h1>
                  <p className="text-gray-600 dark:text-gray-400">Manage your measurement profiles</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  <History className="w-4 h-4" />
                  History
                </button>
                <button
                  onClick={() => setShowAddProfile(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Profile
                </button>
              </div>
            </div>

            {/* Success Message */}
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg"
                >
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-green-700 dark:text-green-400 font-medium">{successMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left Sidebar - Profile Selection */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-6">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Profiles</h2>
                  <div className="space-y-2">
                    {profiles.map((profile) => (
                      <motion.div
                        key={profile.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => {
                          setSelectedProfile(profile);
                          setEditedMeasurements(profile.measurements);
                          setIsEditing(false);
                        }}
                        className={`p-3 rounded-lg cursor-pointer transition-all ${
                          selectedProfile.id === profile.id
                            ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500 dark:border-blue-400'
                            : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            <span className="font-medium text-gray-900 dark:text-gray-100">{profile.name}</span>
                          </div>
                          {!profile.isDefault && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProfile(profile.id);
                              }}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        {profile.isDefault && (
                          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Default</span>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3" />
                          Updated: {profile.updatedAt}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Content - Measurements Form */}
              <div className="lg:col-span-3 space-y-6">
                {/* Profile Info Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedProfile.name}</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Created: {selectedProfile.createdAt} | Last Updated: {selectedProfile.updatedAt}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isEditing ? (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={handleCancel}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                          >
                            <Save className="w-4 h-4" />
                            Save
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Measurement Categories */}
                {Object.entries(categories).map(([categoryKey, category]) => (
                  <motion.div
                    key={categoryKey}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedCategory(expandedCategory === categoryKey ? null : categoryKey)}
                      className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{category.icon}</span>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{category.label}</h3>
                      </div>
                      {expandedCategory === categoryKey ? (
                        <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                    
                    <AnimatePresence>
                      {expandedCategory === categoryKey && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-gray-200 dark:border-gray-700"
                        >
                          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {category.fields.map((field) => (
                              <div key={field.key}>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  {field.label} <span className="text-gray-500 dark:text-gray-400">({field.unit})</span>
                                </label>
                                <input
                                  type="text"
                                  value={editedMeasurements[categoryKey][field.key] || ''}
                                  onChange={(e) => handleMeasurementChange(categoryKey, field.key, e.target.value)}
                                  placeholder={field.placeholder}
                                  disabled={!isEditing}
                                  className={`w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                                    isEditing ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'
                                  }`}
                                />
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}

                {/* Custom Measurements */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedCategory(expandedCategory === 'custom' ? null : 'custom')}
                    className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📏</span>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Custom Measurements</h3>
                    </div>
                    {expandedCategory === 'custom' ? (
                      <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {expandedCategory === 'custom' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-200 dark:border-gray-700"
                      >
                        <div className="p-6 space-y-4">
                          {editedMeasurements.custom.map((custom, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <input
                                type="text"
                                value={custom.label}
                                onChange={(e) => handleCustomChange(index, 'label', e.target.value)}
                                placeholder="Measurement Name"
                                disabled={!isEditing}
                                className={`flex-1 px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                                  isEditing ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'
                                }`}
                              />
                              <input
                                type="text"
                                value={custom.value}
                                onChange={(e) => handleCustomChange(index, 'value', e.target.value)}
                                placeholder="Value (inches)"
                                disabled={!isEditing}
                                className={`w-32 px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                                  isEditing ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'
                                }`}
                              />
                              {isEditing && (
                                <button
                                  onClick={() => removeCustomMeasurement(index)}
                                  className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                          {isEditing && (
                            <button
                              onClick={addCustomMeasurement}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              Add Custom Measurement
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>

      {/* Add Profile Modal */}
      <AnimatePresence>
        {showAddProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddProfile(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Add New Profile</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Create a new measurement profile for family members or different occasions.</p>
              <input
                type="text"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                placeholder="Profile Name (e.g., Dad's Measurements)"
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 mb-4"
                autoFocus
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAddProfile(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddProfile}
                  disabled={!newProfileName.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Profile
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Measurement History Modal */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowHistory(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Measurement History</h2>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-3">
                {measurementHistory.map((entry) => (
                  <div key={entry.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{entry.profile}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{entry.date}</span>
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">{entry.category}</span> - {entry.field}
                      {entry.oldValue !== '-' && (
                        <span className="ml-2">
                          <span className="text-red-600 dark:text-red-400">{entry.oldValue}"</span>
                          {' → '}
                          <span className="text-green-600 dark:text-green-400">{entry.newValue}"</span>
                        </span>
                      )}
                      {entry.oldValue === '-' && (
                        <span className="ml-2 text-green-600 dark:text-green-400">{entry.newValue}</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Updated by: {entry.updatedBy}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Measurements;
