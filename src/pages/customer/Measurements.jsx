import { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion, AnimatePresence } from 'framer-motion';
import usePageTitle from '../../hooks/usePageTitle';
import {
  Ruler,
  User,
  Clock,
  ChevronDown,
  ChevronUp,
  Loader,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useProfile } from '../../hooks/useDataFetch';

const Measurements = () => {
  usePageTitle('Measurements');

  const [selectedProfile, setSelectedProfile] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState('shirt');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch profile from global state - this already contains measurements
  const { profile: profileData, profileLoading: loading, profileError: error, fetchProfile } = useProfile();

  // Debug logging
  useEffect(() => {
    console.log('=== MEASUREMENTS PAGE DEBUG ===');
    console.log('Profile data:', profileData);
    console.log('Loading:', loading);
    console.log('Error:', error);
    if (profileData) {
      console.log('Has measurements?', !!profileData.measurements);
      if (profileData.measurements) {
        console.log('Measurements keys:', Object.keys(profileData.measurements));
        console.log('Measurements:', JSON.stringify(profileData.measurements, null, 2));
      }
    }
    console.log('=== END MEASUREMENTS PAGE DEBUG ===');
  }, [profileData, loading, error]);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchProfile(true); // Force refetch
    setIsRefreshing(false);
  };

  // Transform profile measurements into profiles array using useMemo
  const profiles = useMemo(() => {
    console.log('=== PROFILES TRANSFORMATION ===');
    console.log('profileData:', profileData);
    
    if (!profileData || !profileData.measurements) {
      console.log('No profileData or measurements, returning empty array');
      return [];
    }

    // Create profiles from the measurements object
    const measurementProfiles = [];
    const measurements = profileData.measurements;
    
    console.log('Measurements object:', measurements);

    // Check each dress type and create a profile if measurements exist
    const dressTypes = [
      { key: 'shirt', label: 'Shirt', icon: '👔' },
      { key: 'pant', label: 'Pant', icon: '👖' },
      { key: 'coat', label: 'Coat', icon: '🧥' },
      { key: 'kurta', label: 'Kurta', icon: '🥻' },
      { key: 'dhoti', label: 'Dhoti', icon: '🎽' }
    ];

    dressTypes.forEach((dressType, index) => {
      const dressMeasurements = measurements[dressType.key];
      console.log(`Checking ${dressType.key}:`, dressMeasurements);
      
      // Check if this dress type has any measurements
      const hasMeasurements = dressMeasurements && Object.values(dressMeasurements).some(val => val && val !== '');
      console.log(`  Has measurements: ${hasMeasurements}`);
      
      if (hasMeasurements) {
        measurementProfiles.push({
          id: `profile-${dressType.key}`,
          name: `${dressType.label} Measurements`,
          dressType: dressType.key,
          isDefault: index === 0, // First profile is default
          createdAt: profileData.createdAt?.split('T')[0] || 'N/A',
          updatedAt: profileData.updatedAt?.split('T')[0] || new Date().toISOString().split('T')[0],
          notes: '',
          measurements: measurements
        });
      }
    });

    console.log('Final profiles array:', measurementProfiles);
    console.log('=== END PROFILES TRANSFORMATION ===');
    return measurementProfiles;
  }, [profileData]);

  // Select first profile by default
  useEffect(() => {
    if (profiles.length > 0 && !selectedProfile) {
      setSelectedProfile(profiles[0]);
      setExpandedCategory(profiles[0].dressType);
    }
  }, [profiles, selectedProfile]);

  // Measurement categories configuration
  const categories = {
    pant: {
      label: 'Pant Measurements',
      icon: '👖',
      fields: [
        { key: 'length', label: 'Length', unit: 'inches', placeholder: 'e.g., 40' },
        { key: 'waist', label: 'Waist', unit: 'inches', placeholder: 'e.g., 32' },
        { key: 'seatHips', label: 'Seat / Hips', unit: 'inches', placeholder: 'e.g., 38' },
        { key: 'knee', label: 'Knee', unit: 'inches', placeholder: 'e.g., 16' },
        { key: 'bottomOpening', label: 'Bottom Opening / Ankle', unit: 'inches', placeholder: 'e.g., 14' },
        { key: 'thighCircumference', label: 'Thigh Circumference / Flare', unit: 'inches', placeholder: 'e.g., 24' },
        { key: 'thigh', label: 'Thigh', unit: 'inches', placeholder: 'e.g., 22' }
      ]
    },
    shirt: {
      label: 'Shirt Measurements',
      icon: '👔',
      fields: [
        { key: 'length', label: 'Length', unit: 'inches', placeholder: 'e.g., 28' },
        { key: 'chest', label: 'Chest', unit: 'inches', placeholder: 'e.g., 38' },
        { key: 'waist', label: 'Waist', unit: 'inches', placeholder: 'e.g., 32' },
        { key: 'shoulder', label: 'Shoulder', unit: 'inches', placeholder: 'e.g., 16' },
        { key: 'sleeveLength', label: 'Sleeve Length', unit: 'inches', placeholder: 'e.g., 24' },
        { key: 'armhole', label: 'Armhole', unit: 'inches', placeholder: 'e.g., 18' },
        { key: 'collar', label: 'Collar (Neck)', unit: 'inches', placeholder: 'e.g., 15' }
      ]
    },
    coat: {
      label: 'Coat Measurements',
      icon: '🧥',
      fields: [
        { key: 'length', label: 'Length', unit: 'inches', placeholder: 'e.g., 32' },
        { key: 'chest', label: 'Chest', unit: 'inches', placeholder: 'e.g., 40' },
        { key: 'waist', label: 'Waist', unit: 'inches', placeholder: 'e.g., 34' },
        { key: 'shoulder', label: 'Shoulder', unit: 'inches', placeholder: 'e.g., 17' },
        { key: 'sleeveLength', label: 'Sleeve Length', unit: 'inches', placeholder: 'e.g., 25' },
        { key: 'armhole', label: 'Armhole', unit: 'inches', placeholder: 'e.g., 19' }
      ]
    },
    kurta: {
      label: 'Kurta Measurements',
      icon: '🥻',
      fields: [
        { key: 'length', label: 'Length', unit: 'inches', placeholder: 'e.g., 42' },
        { key: 'chest', label: 'Chest', unit: 'inches', placeholder: 'e.g., 38' },
        { key: 'waist', label: 'Waist', unit: 'inches', placeholder: 'e.g., 32' },
        { key: 'seatHips', label: 'Seat / Hips', unit: 'inches', placeholder: 'e.g., 38' },
        { key: 'flare', label: 'Flare / Circumference', unit: 'inches', placeholder: 'e.g., 44' },
        { key: 'shoulder', label: 'Shoulder', unit: 'inches', placeholder: 'e.g., 16' },
        { key: 'armhole', label: 'Armhole', unit: 'inches', placeholder: 'e.g., 18' },
        { key: 'sleeve', label: 'Sleeve', unit: 'inches', placeholder: 'e.g., 24' },
        { key: 'bottomOpening', label: 'Bottom Opening / Cuff', unit: 'inches', placeholder: 'e.g., 12' },
        { key: 'frontNeck', label: 'Front Neck', unit: 'inches', placeholder: 'e.g., 8' },
        { key: 'backNeck', label: 'Back Neck', unit: 'inches', placeholder: 'e.g., 6' }
      ]
    },
    dhoti: {
      label: 'Dhoti Measurements',
      icon: '🎽',
      fields: [
        { key: 'length', label: 'Length', unit: 'inches', placeholder: 'e.g., 45' },
        { key: 'waist', label: 'Waist', unit: 'inches', placeholder: 'e.g., 32' },
        { key: 'hip', label: 'Hip', unit: 'inches', placeholder: 'e.g., 38' },
        { key: 'sideLength', label: 'Side Length', unit: 'inches', placeholder: 'e.g., 40' },
        { key: 'foldLength', label: 'Fold Length', unit: 'inches', placeholder: 'e.g., 12' }
      ]
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="customer" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6 relative z-10">
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
                  <p className="text-gray-600 dark:text-gray-400">View your measurement profiles</p>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing || loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-8 h-8 text-blue-500 animate-spin" />
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading measurements...</span>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  <div>
                    <h3 className="text-lg font-bold text-red-900 dark:text-red-100">Error</h3>
                    <p className="text-red-700 dark:text-red-300">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* No Measurements State */}
            {!loading && !error && profiles.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Ruler className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  No Measurements Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Your measurements haven't been added yet. Please contact the shop owner to add your measurements.
                </p>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Checking...' : 'Check Again'}
                </button>
              </div>
            )}

            {/* Main Content Grid */}
            {!loading && !error && profiles.length > 0 && selectedProfile && (
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
                            setExpandedCategory(profile.dressType.toLowerCase());
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

                {/* Right Content - Measurements Display */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Profile Info Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedProfile.name}</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Created: {selectedProfile.createdAt} | Last Updated: {selectedProfile.updatedAt}</p>
                      {selectedProfile.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          <span className="font-medium">Notes:</span> {selectedProfile.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Measurement Category for Selected Profile */}
                  {Object.entries(categories).map(([categoryKey, category]) => {
                    // Only show category if it matches the selected profile's dress type
                    const profileDressType = selectedProfile.dressType?.toLowerCase();
                    if (profileDressType && categoryKey !== profileDressType) {
                      return null;
                    }
                    
                    return (
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
                                {category.fields.map((field) => {
                                  const fieldValue = selectedProfile.measurements[categoryKey][field.key] || '';
                                  return (
                                    <div key={field.key}>
                                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {field.label} <span className="text-gray-500 dark:text-gray-400">({field.unit})</span>
                                      </label>
                                      <input
                                        type="text"
                                        value={fieldValue}
                                        placeholder={field.placeholder}
                                        disabled
                                        className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-gray-50"
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Measurements;
