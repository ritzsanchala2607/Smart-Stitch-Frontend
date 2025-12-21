import { useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion, AnimatePresence } from 'framer-motion';
import usePageTitle from '../../hooks/usePageTitle';
import {
  Store,
  Users,
  Plus,
  Search,
  Eye,
  XCircle,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Key,
  RefreshCw,
  X,
  Package, 
  TrendingUp
} from 'lucide-react';

const OwnersShops = () => {
  usePageTitle('Owners & Shops');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [createdData, setCreatedData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock shops data
  const [shops, setShops] = useState([
    {
      id: 1,
      shopName: 'Elite Tailors',
      ownerName: 'Rajesh Kumar',
      email: 'rajesh@elitetailors.com',
      phone: '+91 98765 43210',
      city: 'Mumbai',
      address: '123 Fashion Street, Andheri West, Mumbai - 400058',
      gstNumber: '27AABCU9603R1ZM',
      shopType: 'Tailoring',
      totalOrders: 456,
      totalWorkers: 8,
      status: 'Active',
      registrationDate: '2023-01-15'
    },
    {
      id: 2,
      shopName: 'Modern Stitching',
      ownerName: 'Priya Sharma',
      email: 'priya@modernstitching.com',
      phone: '+91 98765 43211',
      city: 'Delhi',
      address: '456 Connaught Place, New Delhi - 110001',
      gstNumber: '07AABCU9603R1ZN',
      shopType: 'Both',
      totalOrders: 678,
      totalWorkers: 12,
      status: 'Active',
      registrationDate: '2023-02-20'
    },
    {
      id: 3,
      shopName: 'Classic Tailoring',
      ownerName: 'Amit Patel',
      email: 'amit@classictailoring.com',
      phone: '+91 98765 43212',
      city: 'Ahmedabad',
      address: '789 CG Road, Ahmedabad - 380009',
      gstNumber: '24AABCU9603R1ZO',
      shopType: 'Showroom',
      totalOrders: 234,
      totalWorkers: 5,
      status: 'Inactive',
      registrationDate: '2023-03-10'
    }
  ]);

  // Form state for adding new owner/shop
  const [ownerForm, setOwnerForm] = useState({
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    shopName: '',
    shopEmail: '',
    shopPhone: '',
    shopAddress: ''
  });

  // Generate random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setOwnerForm({ ...ownerForm, password });
  };

  // Handle form input
  const handleInputChange = (field, value) => {
    setOwnerForm({ ...ownerForm, [field]: value });
  };

  // Handle create owner account
  const handleCreateOwner = async () => {
    try {
      // Get JWT token from localStorage (for admin authentication)
      // Check both locations: separate 'token' key or inside 'user' object
      let token = localStorage.getItem('token');
      
      if (!token) {
        const userDataString = localStorage.getItem('user');
        if (userDataString) {
          try {
            const userData = JSON.parse(userDataString);
            token = userData.jwt;
          } catch (e) {
            console.error('Error parsing user data:', e);
          }
        }
      }

      console.log('Admin token:', token ? 'Token exists' : 'No token found');

      const payload = {
        user: {
          name: ownerForm.ownerName,
          email: ownerForm.email,
          password: ownerForm.password,
          contactNumber: ownerForm.phone,
          roleId: 1 // Owner role ID (was 1, should be 2 based on your backend)
        },
        shop: {
          name: ownerForm.shopName,
          email: ownerForm.shopEmail,
          contactNumber: ownerForm.shopPhone,
          address: ownerForm.shopAddress
        }
      };

      console.log('Creating owner with payload:', payload);

      // Prepare headers - include Authorization if token exists
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('http://localhost:8080/api/owners/create', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });

      console.log('Response status:', response.status);

      // Try to parse response as JSON, fallback to text if it fails
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textData = await response.text();
        // If response is successful but not JSON, treat it as success
        if (response.ok) {
          data = { message: textData || 'Owner and shop created successfully' };
        } else {
          throw new Error(textData || 'Failed to create owner');
        }
      }

      if (!response.ok) {
        throw new Error(data.message || data || 'Failed to create owner');
      }

      console.log('Owner created successfully:', data);

      // Store created data for success modal
      setCreatedData({
        owner: {
          name: ownerForm.ownerName,
          email: ownerForm.email,
          phone: ownerForm.phone,
          password: ownerForm.password
        },
        shop: {
          name: ownerForm.shopName,
          email: ownerForm.shopEmail,
          phone: ownerForm.shopPhone,
          address: ownerForm.shopAddress
        }
      });

      // Add to local state for display
      const newShop = {
        id: shops.length + 1,
        shopName: ownerForm.shopName,
        ownerName: ownerForm.ownerName,
        email: ownerForm.email,
        phone: ownerForm.phone,
        city: 'N/A',
        address: ownerForm.shopAddress,
        gstNumber: 'N/A',
        shopType: 'N/A',
        totalOrders: 0,
        totalWorkers: 0,
        status: 'Active',
        registrationDate: new Date().toISOString().split('T')[0]
      };

      setShops([...shops, newShop]);
      setShowAddModal(false);
      setShowSuccessModal(true);
      
      // Reset form
      setOwnerForm({
        ownerName: '',
        email: '',
        phone: '',
        password: '',
        shopName: '',
        shopEmail: '',
        shopPhone: '',
        shopAddress: ''
      });
    } catch (error) {
      setErrorMessage(error.message || 'An unexpected error occurred');
      setShowAddModal(false);
      setShowErrorModal(true);
    }
  };

  // Handle view shop details
  const handleViewShop = (shop) => {
    setSelectedShop(shop);
    setShowViewModal(true);
  };

  // Handle toggle shop status
  const handleToggleStatus = (shopId) => {
    setShops(shops.map(shop =>
      shop.id === shopId
        ? { ...shop, status: shop.status === 'Active' ? 'Inactive' : 'Active' }
        : shop
    ));
  };

  // Filter shops
  const filteredShops = shops.filter(shop =>
    shop.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="admin" />
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
                  <Store className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Owners & Shops</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Manage shop owners and their businesses</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                Add New Owner
              </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by shop name, owner, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            {/* Shops Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Shop Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Owner Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total Orders
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Workers
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredShops.map((shop) => (
                      <tr key={shop.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Store className="w-5 h-5 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{shop.shopName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {shop.ownerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {shop.totalOrders}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {shop.totalWorkers}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewShop(shop)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(shop.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                shop.status === 'Active'
                                  ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30'
                                  : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30'
                              }`}
                              title={shop.status === 'Active' ? 'Deactivate' : 'Activate'}
                            >
                              {shop.status === 'Active' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </main>
      </div>

      {/* Add Owner Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Add New Owner & Shop</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Create owner credentials and shop details</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Owner Details Section */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Owner Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={ownerForm.ownerName}
                        onChange={(e) => handleInputChange('ownerName', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Enter owner's full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email (Login ID) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={ownerForm.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="owner@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={ownerForm.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Temporary Password <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={ownerForm.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="Auto-generated password"
                          />
                        </div>
                        <button
                          onClick={generatePassword}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                          title="Generate Password"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Owner will use this to login for the first time
                      </p>
                    </div>
                  </div>
                </div>

                {/* Shop Details Section */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <Store className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    Shop Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Shop Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={ownerForm.shopName}
                        onChange={(e) => handleInputChange('shopName', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Enter shop name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Shop Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={ownerForm.shopEmail}
                          onChange={(e) => handleInputChange('shopEmail', e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="shop@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Shop Contact Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={ownerForm.shopPhone}
                          onChange={(e) => handleInputChange('shopPhone', e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="9123456789"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Shop Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <textarea
                          value={ownerForm.shopAddress}
                          onChange={(e) => handleInputChange('shopAddress', e.target.value)}
                          rows={3}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Enter complete shop address"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateOwner}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Create Owner Account
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Shop Details Modal */}
      <AnimatePresence>
        {showViewModal && selectedShop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowViewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Store className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedShop.shopName}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Shop Details & Information</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    selectedShop.status === 'Active'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}>
                    {selectedShop.status}
                  </span>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Registered On</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {new Date(selectedShop.registrationDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Shop Information */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <Store className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Shop Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Shop Name</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedShop.shopName}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Shop Type</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedShop.shopType}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg md:col-span-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Address</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedShop.address}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">City</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedShop.city}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">GST Number</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedShop.gstNumber || 'Not Provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Owner Information */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    Owner Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Owner Name</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedShop.ownerName}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedShop.email}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg md:col-span-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Phone</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedShop.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Business Metrics */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Business Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white">
                      <div className="flex items-center justify-between mb-2">
                        <Package className="w-8 h-8" />
                      </div>
                      <p className="text-3xl font-bold mb-1">{selectedShop.totalOrders}</p>
                      <p className="text-sm opacity-90">Total Orders</p>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg text-white">
                      <div className="flex items-center justify-between mb-2">
                        <Users className="w-8 h-8" />
                      </div>
                      <p className="text-3xl font-bold mb-1">{selectedShop.totalWorkers}</p>
                      <p className="text-sm opacity-90">Total Workers</p>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-lg text-white">
                      <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-8 h-8" />
                      </div>
                      <p className="text-3xl font-bold mb-1">₹{(selectedShop.totalOrders * 850).toLocaleString()}</p>
                      <p className="text-sm opacity-90">Revenue (Mock)</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      handleToggleStatus(selectedShop.id);
                      setShowViewModal(false);
                    }}
                    className={`flex-1 px-6 py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 ${
                      selectedShop.status === 'Active'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {selectedShop.status === 'Active' ? (
                      <>
                        <XCircle className="w-5 h-5" />
                        Deactivate Shop
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Activate Shop
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && createdData && (
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
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Success Header */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Successfully Created!</h2>
                    <p className="text-green-50">Owner account and shop have been created</p>
                  </div>
                </div>
              </div>

              {/* Success Body */}
              <div className="p-6 space-y-6">
                {/* Owner Details */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Owner Details
                  </h3>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Name:</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{createdData.owner.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Email:</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{createdData.owner.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Phone:</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{createdData.owner.phone}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-blue-200 dark:border-blue-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Temporary Password:</span>
                      <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">{createdData.owner.password}</span>
                    </div>
                  </div>
                </div>

                {/* Shop Details */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <Store className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    Shop Details
                  </h3>
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Shop Name:</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{createdData.shop.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Shop Email:</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{createdData.shop.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Shop Phone:</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{createdData.shop.phone}</span>
                    </div>
                    <div className="pt-2 border-t border-orange-200 dark:border-orange-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">Address:</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{createdData.shop.address}</span>
                    </div>
                  </div>
                </div>

                {/* Note */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Note:</strong> Please share the login credentials with the owner. They should change their password after first login.
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

      {/* Error Modal */}
      <AnimatePresence>
        {showErrorModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowErrorModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full"
            >
              {/* Error Header */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <XCircle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Error</h2>
                    <p className="text-red-50">Failed to create owner and shop</p>
                  </div>
                </div>
              </div>

              {/* Error Body */}
              <div className="p-6 space-y-4">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-200 font-medium">{errorMessage}</p>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Please check the information and try again. If the problem persists, contact support.
                </p>

                {/* Close Button */}
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
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

export default OwnersShops;
