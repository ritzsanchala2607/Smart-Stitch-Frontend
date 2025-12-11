import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  DollarSign, 
  FileText, 
  User,
  Ruler,
  CheckCircle
} from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import AddCustomerModal from '../../components/AddCustomerModal';
import { customers } from '../../data/dummyData';
import { isValidDate, isValidAmount } from '../../utils/validation';

/**
 * NewOrder Component
 * Full-page form for creating new tailoring orders
 * 
 * Features:
 * - Customer selection with dropdown
 * - Quick customer creation via modal
 * - Measurement input sections (shirt, pant, custom)
 * - Order details (delivery date, advance payment, notes)
 * - Dynamic order items with add/remove functionality
 * - Form validation
 * - Success animation on save
 * 
 * Backend Integration Notes:
 * - Replace handleSaveOrder with API call to /api/orders
 * - Send complete order object
 * - Handle validation errors from backend
 * - Implement proper error handling for network failures
 * - Add loading states during submission
 */
function NewOrder() {
  // Customer selection state
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerList, setCustomerList] = useState(customers);

  // Order details state
  const [deliveryDate, setDeliveryDate] = useState('');
  const [advancePayment, setAdvancePayment] = useState('');
  const [notes, setNotes] = useState('');

  // Measurements state
  const [measurements, setMeasurements] = useState({
    shirt: {
      chest: '',
      waist: '',
      shoulder: '',
      length: ''
    },
    pant: {
      waist: '',
      length: '',
      hip: ''
    },
    custom: ''
  });

  // Order items state
  const [orderItems, setOrderItems] = useState([
    {
      id: Date.now(),
      name: '',
      quantity: '',
      price: '',
      fabricType: ''
    }
  ]);

  // UI state
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [errors, setErrors] = useState({});

  // Handle customer selection
  const handleCustomerSelect = (e) => {
    const customerId = e.target.value;
    
    if (customerId === 'add-new') {
      setShowCustomerModal(true);
      return;
    }
    
    const customer = customerList.find(c => c.id === customerId);
    setSelectedCustomer(customer);
    
    // Pre-fill measurements if customer has them
    if (customer && customer.measurements) {
      setMeasurements(prev => ({
        ...prev,
        ...customer.measurements
      }));
    }
    
    // Clear customer error if exists
    if (errors.customer) {
      setErrors(prev => ({ ...prev, customer: null }));
    }
  };

  // Handle new customer creation from modal
  const handleAddNewCustomer = (newCustomer) => {
    setCustomerList(prev => [...prev, newCustomer]);
    setSelectedCustomer(newCustomer);
  };

  // Handle measurement changes
  const handleMeasurementChange = (section, field, value) => {
    setMeasurements(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Handle custom measurement change
  const handleCustomMeasurementChange = (value) => {
    setMeasurements(prev => ({
      ...prev,
      custom: value
    }));
  };

  // Handle order item changes
  const handleItemChange = (itemId, field, value) => {
    setOrderItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
    
    // Clear item errors if exists
    if (errors.items) {
      setErrors(prev => ({ ...prev, items: null }));
    }
  };

  // Add new order item
  const handleAddItem = () => {
    setOrderItems(prev => [
      ...prev,
      {
        id: Date.now(),
        name: '',
        quantity: '',
        price: '',
        fabricType: ''
      }
    ]);
  };

  // Remove order item
  const handleRemoveItem = (itemId) => {
    if (orderItems.length > 1) {
      setOrderItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Customer validation
    if (!selectedCustomer) {
      newErrors.customer = 'Please select a customer';
    }

    // Delivery date validation
    if (!deliveryDate) {
      newErrors.deliveryDate = 'Delivery date is required';
    } else if (!isValidDate(deliveryDate)) {
      newErrors.deliveryDate = 'Delivery date must be in the future';
    }

    // Advance payment validation
    if (advancePayment && !isValidAmount(advancePayment)) {
      newErrors.advancePayment = 'Please enter a valid amount';
    }

    // Order items validation
    const hasEmptyItems = orderItems.some(
      item => !item.name || !item.quantity || !item.price
    );
    
    if (hasEmptyItems) {
      newErrors.items = 'Please fill in all item details (name, quantity, price)';
    }

    // Check for positive values
    const hasInvalidQuantity = orderItems.some(
      item => item.quantity && (isNaN(item.quantity) || Number(item.quantity) <= 0)
    );
    
    const hasInvalidPrice = orderItems.some(
      item => item.price && (isNaN(item.price) || Number(item.price) <= 0)
    );

    if (hasInvalidQuantity) {
      newErrors.items = 'Quantity must be a positive number';
    }

    if (hasInvalidPrice) {
      newErrors.items = 'Price must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save order
  const handleSaveOrder = () => {
    if (!validateForm()) {
      return;
    }

    // Calculate total amount
    const totalAmount = orderItems.reduce(
      (sum, item) => sum + (Number(item.quantity) * Number(item.price)),
      0
    );

    // Create order object
    const newOrder = {
      id: `ORD${Date.now()}`,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      orderDate: new Date().toISOString(),
      deliveryDate,
      status: 'pending',
      priority: 'medium',
      items: orderItems.map(item => ({
        id: `ITEM${item.id}`,
        type: item.name,
        fabric: item.fabricType || 'Standard',
        quantity: Number(item.quantity),
        price: Number(item.price)
      })),
      totalAmount,
      paidAmount: advancePayment ? Number(advancePayment) : 0,
      balanceAmount: totalAmount - (advancePayment ? Number(advancePayment) : 0),
      measurements,
      notes,
      assignedWorker: null,
      workerName: null,
      timeline: [
        {
          status: 'ordered',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        }
      ]
    };

    // Log order (frontend-only simulation)
    console.log('Order created:', newOrder);

    // Show success animation
    setShowSuccessAnimation(true);

    // Reset form after 2 seconds
    setTimeout(() => {
      setShowSuccessAnimation(false);
      resetForm();
    }, 2000);
  };

  // Reset form
  const resetForm = () => {
    setSelectedCustomer(null);
    setDeliveryDate('');
    setAdvancePayment('');
    setNotes('');
    setMeasurements({
      shirt: { chest: '', waist: '', shoulder: '', length: '' },
      pant: { waist: '', length: '', hip: '' },
      custom: ''
    });
    setOrderItems([
      {
        id: Date.now(),
        name: '',
        quantity: '',
        price: '',
        fabricType: ''
      }
    ]);
    setErrors({});
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="owner" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        
        <div className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-6xl mx-auto"
          >
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Create New Order
              </h1>
              <p className="text-gray-600">
                Fill in the details below to create a new tailoring order
              </p>
            </div>

            {/* Main Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
              {/* Customer Selection Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-orange-500" />
                  Customer Information
                </h2>
                
                <div>
                  <label htmlFor="customer-select" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Customer <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="customer-select"
                    value={selectedCustomer?.id || ''}
                    onChange={handleCustomerSelect}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                      errors.customer ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">-- Select a customer --</option>
                    {customerList.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone}
                      </option>
                    ))}
                    <option value="add-new" className="font-semibold text-orange-600">
                      + Add New Customer
                    </option>
                  </select>
                  {errors.customer && (
                    <p className="text-red-500 text-sm mt-1">{errors.customer}</p>
                  )}
                </div>

                {selectedCustomer && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Email:</span> {selectedCustomer.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Phone:</span> {selectedCustomer.phone}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Measurements Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-orange-500" />
                  Measurements
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Shirt Measurements */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-700">Shirt Measurements (inches)</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Chest</label>
                        <input
                          type="number"
                          value={measurements.shirt.chest}
                          onChange={(e) => handleMeasurementChange('shirt', 'chest', e.target.value)}
                          placeholder="40"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Waist</label>
                        <input
                          type="number"
                          value={measurements.shirt.waist}
                          onChange={(e) => handleMeasurementChange('shirt', 'waist', e.target.value)}
                          placeholder="34"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Shoulder</label>
                        <input
                          type="number"
                          value={measurements.shirt.shoulder}
                          onChange={(e) => handleMeasurementChange('shirt', 'shoulder', e.target.value)}
                          placeholder="17"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Length</label>
                        <input
                          type="number"
                          value={measurements.shirt.length}
                          onChange={(e) => handleMeasurementChange('shirt', 'length', e.target.value)}
                          placeholder="30"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pant Measurements */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-700">Pant Measurements (inches)</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Waist</label>
                        <input
                          type="number"
                          value={measurements.pant.waist}
                          onChange={(e) => handleMeasurementChange('pant', 'waist', e.target.value)}
                          placeholder="34"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Length</label>
                        <input
                          type="number"
                          value={measurements.pant.length}
                          onChange={(e) => handleMeasurementChange('pant', 'length', e.target.value)}
                          placeholder="42"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm text-gray-600 mb-1">Hip</label>
                        <input
                          type="number"
                          value={measurements.pant.hip}
                          onChange={(e) => handleMeasurementChange('pant', 'hip', e.target.value)}
                          placeholder="38"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Custom Measurements */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Measurements / Special Instructions
                  </label>
                  <textarea
                    value={measurements.custom}
                    onChange={(e) => handleCustomMeasurementChange(e.target.value)}
                    placeholder="Enter any special measurements or instructions..."
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Order Items Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-500" />
                  Order Items
                </h2>

                <div className="space-y-4">
                  {orderItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-700">Item {index + 1}</h3>
                        {orderItems.length > 1 && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </motion.button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Item Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                            placeholder="e.g., Formal Shirt"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Quantity <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                            placeholder="1"
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Price <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                            placeholder="800"
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Fabric Type</label>
                          <input
                            type="text"
                            value={item.fabricType}
                            onChange={(e) => handleItemChange(item.id, 'fabricType', e.target.value)}
                            placeholder="e.g., Cotton"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {errors.items && (
                    <p className="text-red-500 text-sm">{errors.items}</p>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddItem}
                    className="flex items-center gap-2 px-4 py-2 text-orange-600 border-2 border-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    Add Another Item
                  </motion.button>
                </div>
              </div>

              {/* Order Details Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  Order Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="delivery-date" className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="delivery-date"
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => {
                        setDeliveryDate(e.target.value);
                        if (errors.deliveryDate) {
                          setErrors(prev => ({ ...prev, deliveryDate: null }));
                        }
                      }}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                        errors.deliveryDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.deliveryDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.deliveryDate}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="advance-payment" className="block text-sm font-medium text-gray-700 mb-2">
                      Advance Payment
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="advance-payment"
                        type="number"
                        value={advancePayment}
                        onChange={(e) => {
                          setAdvancePayment(e.target.value);
                          if (errors.advancePayment) {
                            setErrors(prev => ({ ...prev, advancePayment: null }));
                          }
                        }}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                          errors.advancePayment ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.advancePayment && (
                      <p className="text-red-500 text-sm mt-1">{errors.advancePayment}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter any special instructions or notes for this order..."
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetForm}
                  className="flex-1 py-3 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Reset Form
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveOrder}
                  className="flex-1 py-3 rounded-lg font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
                >
                  Save Order
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onSave={handleAddNewCustomer}
      />

      {/* Success Animation */}
      <AnimatePresence>
        {showSuccessAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="bg-white rounded-2xl p-8 shadow-2xl text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Order Created Successfully!
              </h2>
              <p className="text-gray-600">
                The order has been saved and is ready for processing.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NewOrder;
