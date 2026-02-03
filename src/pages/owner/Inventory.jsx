import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion, AnimatePresence } from 'framer-motion';
import usePageTitle from '../../hooks/usePageTitle';
import { 
  Package, Plus, Search, AlertTriangle, TrendingDown, 
  Edit, Trash2, Eye, X, Upload, CheckCircle, Download,
  ShoppingCart, Ruler, Scissors, Box, Filter
} from 'lucide-react';
import { useState } from 'react';

const Inventory = () => {
  usePageTitle('Inventory');
  const [inventoryItems, setInventoryItems] = useState([
    {
      id: 'INV001',
      name: 'Cotton Fabric',
      category: 'Fabric',
      quantity: 150,
      unit: 'meter',
      minStock: 50,
      purchasePrice: 25,
      supplier: 'Fabric World Ltd',
      photo: 'https://images.unsplash.com/photo-1558769132-cb1aea3c8e5e?w=200',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'INV002',
      name: 'Silk Fabric',
      category: 'Fabric',
      quantity: 30,
      unit: 'meter',
      minStock: 40,
      purchasePrice: 85,
      supplier: 'Premium Textiles',
      photo: 'https://images.unsplash.com/photo-1519810755548-39cd217da494?w=200',
      lastUpdated: '2024-01-14'
    },
    {
      id: 'INV003',
      name: 'Thread Spools',
      category: 'Accessories',
      quantity: 200,
      unit: 'piece',
      minStock: 100,
      purchasePrice: 5,
      supplier: 'Thread Masters',
      photo: 'https://images.unsplash.com/photo-1604695573706-53170668f6a6?w=200',
      lastUpdated: '2024-01-16'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showSuccess, setShowSuccess] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [itemForm, setItemForm] = useState({
    name: '',
    category: '',
    unit: '',
    quantity: '',
    minStock: '',
    purchasePrice: '',
    supplier: '',
    photo: null
  });

  const [adjustmentForm, setAdjustmentForm] = useState({
    type: 'increase',
    quantity: '',
    reason: ''
  });

  const [errors, setErrors] = useState({});

  // Calculate stats
  const totalItems = inventoryItems.length;
  const lowStockItems = inventoryItems.filter(item => item.quantity <= item.minStock).length;
  const outOfStockItems = inventoryItems.filter(item => item.quantity === 0).length;
  const totalFabricQuantity = inventoryItems
    .filter(item => item.category === 'Fabric')
    .reduce((sum, item) => sum + item.quantity, 0);

  const handleInputChange = (field, value) => {
    setItemForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setItemForm(prev => ({ ...prev, photo: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = () => {
    const newErrors = {};
    if (!itemForm.name) newErrors.name = 'Item name is required';
    if (!itemForm.category) newErrors.category = 'Category is required';
    if (!itemForm.unit) newErrors.unit = 'Unit type is required';
    if (!itemForm.quantity) newErrors.quantity = 'Quantity is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newItem = {
      id: `INV${String(inventoryItems.length + 1).padStart(3, '0')}`,
      name: itemForm.name,
      category: itemForm.category,
      quantity: parseFloat(itemForm.quantity),
      unit: itemForm.unit,
      minStock: parseFloat(itemForm.minStock) || 0,
      purchasePrice: parseFloat(itemForm.purchasePrice) || 0,
      supplier: itemForm.supplier || 'N/A',
      photo: photoPreview || 'https://via.placeholder.com/200',
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    setInventoryItems(prev => [newItem, ...prev]);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    resetForm();
    setShowAddModal(false);
  };

  const handleEditItem = (itemId) => {
    const item = inventoryItems.find(i => i.id === itemId);
    if (item) {
      setEditingItem(item);
      setItemForm({
        name: item.name,
        category: item.category,
        unit: item.unit,
        quantity: item.quantity.toString(),
        minStock: item.minStock.toString(),
        purchasePrice: item.purchasePrice.toString(),
        supplier: item.supplier,
        photo: null
      });
      setPhotoPreview(item.photo);
      setShowEditModal(true);
    }
  };

  const handleUpdateItem = () => {
    const updatedItem = {
      ...editingItem,
      name: itemForm.name,
      category: itemForm.category,
      unit: itemForm.unit,
      quantity: parseFloat(itemForm.quantity),
      minStock: parseFloat(itemForm.minStock) || 0,
      purchasePrice: parseFloat(itemForm.purchasePrice) || 0,
      supplier: itemForm.supplier || 'N/A',
      photo: photoPreview || editingItem.photo,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    setInventoryItems(prev => prev.map(i => i.id === editingItem.id ? updatedItem : i));
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    resetForm();
    setEditingItem(null);
    setShowEditModal(false);
  };

  const handleDeleteItem = (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setInventoryItems(prev => prev.filter(i => i.id !== itemId));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleViewItem = (itemId) => {
    const item = inventoryItems.find(i => i.id === itemId);
    setSelectedItem(item);
    setShowViewModal(true);
  };

  const handleStockAdjustment = () => {
    if (!adjustmentForm.quantity || !adjustmentForm.reason) {
      alert('Please fill in all fields');
      return;
    }

    const adjustment = parseFloat(adjustmentForm.quantity);
    const updatedItem = {
      ...selectedItem,
      quantity: adjustmentForm.type === 'increase' 
        ? selectedItem.quantity + adjustment 
        : selectedItem.quantity - adjustment,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    setInventoryItems(prev => prev.map(i => i.id === selectedItem.id ? updatedItem : i));
    setSelectedItem(updatedItem);
    setAdjustmentForm({ type: 'increase', quantity: '', reason: '' });
    setShowAdjustModal(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const resetForm = () => {
    setItemForm({
      name: '',
      category: '',
      unit: '',
      quantity: '',
      minStock: '',
      purchasePrice: '',
      supplier: '',
      photo: null
    });
    setPhotoPreview(null);
    setErrors({});
  };

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    
    let matchesStatus = true;
    if (filterStatus === 'in-stock') {
      matchesStatus = item.quantity > item.minStock;
    } else if (filterStatus === 'low-stock') {
      matchesStatus = item.quantity <= item.minStock && item.quantity > 0;
    } else if (filterStatus === 'out-of-stock') {
      matchesStatus = item.quantity === 0;
    }
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

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
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-green-800 dark:text-green-400 font-medium">Action completed successfully!</span>
              </motion.div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Inventory Management</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Track and manage your stock items</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="bg-orange-500 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-orange-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add New Item
              </motion.button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <motion.div whileHover={{ scale: 1.02 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Stock Items</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">{totalItems}</p>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Low Stock Alerts</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-2">{lowStockItems}</p>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">{outOfStockItems}</p>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Ruler className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Fabric</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">{totalFabricQuantity}m</p>
              </motion.div>
            </div>

            {/* Search Bar and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search items by name, category, or supplier..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">All Categories</option>
                  <option value="Fabric">Fabric</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Tools">Tools</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">All Status</option>
                  <option value="in-stock">In Stock</option>
                  <option value="low-stock">Low Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
              </div>
            </div>

            {/* Inventory List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Inventory Items ({filteredItems.length})
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Item</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Category</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Quantity</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Last Updated</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center">
                          <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-600 dark:text-gray-400">
                            {searchQuery ? 'No items found matching your search.' : 'No inventory items yet. Add your first item!'}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={item.photo} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-gray-100">{item.name}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.supplier}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                              {item.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-gray-900 dark:text-gray-100">{item.quantity} {item.unit}</span>
                          </td>
                          <td className="px-6 py-4">
                            {item.quantity === 0 ? (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 flex items-center gap-1 w-fit">
                                <AlertTriangle className="w-3 h-3" />
                                Out of Stock
                              </span>
                            ) : item.quantity <= item.minStock ? (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 flex items-center gap-1 w-fit">
                                <AlertTriangle className="w-3 h-3" />
                                Low Stock
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                In Stock
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{item.lastUpdated}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleViewItem(item.id)}
                                className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" 
                                title="View Details"
                              >
                                <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              </button>
                              <button 
                                onClick={() => handleEditItem(item.id)}
                                className="p-2 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition-colors" 
                                title="Edit"
                              >
                                <Edit className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                              </button>
                              <button 
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" 
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Reports Section */}
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Inventory Reports</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => alert('CSV Export feature - Ready for backend integration')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Low Stock Alert List */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    Low Stock Alerts
                  </h3>
                  <div className="space-y-2">
                    {inventoryItems.filter(item => item.quantity <= item.minStock && item.quantity > 0).map(item => (
                      <div key={item.id} className="flex justify-between items-center p-2 bg-orange-50 dark:bg-orange-900/30 rounded">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</span>
                        <span className="text-sm text-orange-600 dark:text-orange-400">{item.quantity} {item.unit}</span>
                      </div>
                    ))}
                    {inventoryItems.filter(item => item.quantity <= item.minStock && item.quantity > 0).length === 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No low stock items</p>
                    )}
                  </div>
                </div>

                {/* Top Used Items (Mock) */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-blue-500" />
                    Top Used Items
                  </h3>
                  <div className="space-y-2">
                    {inventoryItems.slice(0, 5).map((item, index) => (
                      <div key={item.id} className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-900/30 rounded">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">#{index + 1} {item.name}</span>
                        <span className="text-sm text-blue-600 dark:text-blue-400">{Math.floor(Math.random() * 100)} uses</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>

      {/* Add Item Modal */}
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
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Add New Item</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Item Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={itemForm.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${errors.name ? 'border-red-500 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}`}
                      placeholder="e.g., Cotton Fabric"
                    />
                    {errors.name && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={itemForm.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${errors.category ? 'border-red-500 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}`}
                    >
                      <option value="">Select category</option>
                      <option value="Fabric">Fabric</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Tools">Tools</option>
                      <option value="Others">Others</option>
                    </select>
                    {errors.category && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.category}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Unit Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={itemForm.unit}
                      onChange={(e) => handleInputChange('unit', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${errors.unit ? 'border-red-500 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}`}
                    >
                      <option value="">Select unit</option>
                      <option value="meter">Meter</option>
                      <option value="piece">Piece</option>
                      <option value="roll">Roll</option>
                      <option value="kg">Kilogram</option>
                      <option value="box">Box</option>
                    </select>
                    {errors.unit && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.unit}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Quantity in Stock <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={itemForm.quantity}
                      onChange={(e) => handleInputChange('quantity', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${errors.quantity ? 'border-red-500 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}`}
                      placeholder="0"
                      min="0"
                    />
                    {errors.quantity && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.quantity}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Minimum Stock Alert Level</label>
                    <input
                      type="number"
                      value={itemForm.minStock}
                      onChange={(e) => handleInputChange('minStock', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Purchase Price</label>
                    <input
                      type="number"
                      value={itemForm.purchasePrice}
                      onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Supplier Name</label>
                    <input
                      type="text"
                      value={itemForm.supplier}
                      onChange={(e) => handleInputChange('supplier', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="e.g., Fabric World Ltd"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Item Photo</label>
                    {!photoPreview ? (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-orange-500 dark:hover:border-orange-500 transition-colors">
                        <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Click to upload</span>
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                      </label>
                    ) : (
                      <div className="relative w-32 h-32">
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                        <button
                          onClick={() => { setPhotoPreview(null); setItemForm(prev => ({ ...prev, photo: null })); }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 rounded-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddItem}
                    className="flex-1 py-3 rounded-lg font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
                  >
                    Add Item
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Item Modal - Similar to Add Modal */}
      <AnimatePresence>
        {showEditModal && editingItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => { setShowEditModal(false); setEditingItem(null); resetForm(); }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Item</h2>
                <button onClick={() => { setShowEditModal(false); setEditingItem(null); resetForm(); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Item Name</label>
                    <input
                      type="text"
                      value={itemForm.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                    <select
                      value={itemForm.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="Fabric">Fabric</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Tools">Tools</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Unit Type</label>
                    <select
                      value={itemForm.unit}
                      onChange={(e) => handleInputChange('unit', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="meter">Meter</option>
                      <option value="piece">Piece</option>
                      <option value="roll">Roll</option>
                      <option value="kg">Kilogram</option>
                      <option value="box">Box</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quantity</label>
                    <input
                      type="number"
                      value={itemForm.quantity}
                      onChange={(e) => handleInputChange('quantity', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Min Stock Level</label>
                    <input
                      type="number"
                      value={itemForm.minStock}
                      onChange={(e) => handleInputChange('minStock', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Purchase Price</label>
                    <input
                      type="number"
                      value={itemForm.purchasePrice}
                      onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Supplier</label>
                    <input
                      type="text"
                      value={itemForm.supplier}
                      onChange={(e) => handleInputChange('supplier', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => { setShowEditModal(false); setEditingItem(null); resetForm(); }}
                    className="flex-1 py-3 rounded-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateItem}
                    className="flex-1 py-3 rounded-lg font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
                  >
                    Update Item
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Item Details Modal */}
      <AnimatePresence>
        {showViewModal && selectedItem && (
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
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Item Details</h2>
                <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex gap-6 mb-6">
                  <img src={selectedItem.photo} alt={selectedItem.name} className="w-32 h-32 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{selectedItem.name}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Category</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedItem.category}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Supplier</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedItem.supplier}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Current Stock</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedItem.quantity} {selectedItem.unit}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Min Stock Level</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedItem.minStock} {selectedItem.unit}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Purchase Price</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">₹{selectedItem.purchasePrice}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Last Updated</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{selectedItem.lastUpdated}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => { setShowViewModal(false); setShowAdjustModal(true); }}
                    className="flex-1 py-3 rounded-lg font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-colors"
                  >
                    Adjust Stock
                  </button>
                  <button
                    onClick={() => { setShowViewModal(false); handleEditItem(selectedItem.id); }}
                    className="flex-1 py-3 rounded-lg font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
                  >
                    Edit Details
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stock Adjustment Modal */}
      <AnimatePresence>
        {showAdjustModal && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAdjustModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full"
            >
              <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Stock Adjustment</h2>
                <button onClick={() => setShowAdjustModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current Stock</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedItem.quantity} {selectedItem.unit}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Adjustment Type</label>
                    <select
                      value={adjustmentForm.type}
                      onChange={(e) => setAdjustmentForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="increase">Increase Stock</option>
                      <option value="decrease">Decrease Stock</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quantity</label>
                    <input
                      type="number"
                      value={adjustmentForm.quantity}
                      onChange={(e) => setAdjustmentForm(prev => ({ ...prev, quantity: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason</label>
                    <select
                      value={adjustmentForm.reason}
                      onChange={(e) => setAdjustmentForm(prev => ({ ...prev, reason: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Select reason</option>
                      <option value="purchased">New Purchase</option>
                      <option value="work_usage">Work Usage</option>
                      <option value="damaged">Damaged</option>
                      <option value="lost">Lost</option>
                      <option value="returned">Returned</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setShowAdjustModal(false)}
                    className="flex-1 py-3 rounded-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStockAdjustment}
                    className="flex-1 py-3 rounded-lg font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
                  >
                    Update Stock
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

export default Inventory;
