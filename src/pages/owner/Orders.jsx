import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion, AnimatePresence } from 'framer-motion';
import usePageTitle from '../../hooks/usePageTitle';
import { 
  Plus, Package, Search, Filter, Eye, Edit, Trash2,
  Clock, CheckCircle, AlertCircle, X, Calendar,
  DollarSign, FileText, User, Users
} from 'lucide-react';
import { customers } from '../../data/dummyData';
import { useState, useEffect } from 'react';
import { isValidDate, isValidAmount } from '../../utils/validation';
import AddCustomerModal from '../../components/AddCustomerModal';
import { customerAPI, orderAPI, workerAPI } from '../../services/api';

const Orders = () => {
  usePageTitle('Orders');
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrderForView, setSelectedOrderForView] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  
  // New Order Form State
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerList, setCustomerList] = useState(customers);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [advancePayment, setAdvancePayment] = useState('');
  const [notes, setNotes] = useState('');
  const [measurements, setMeasurements] = useState({
    shirt: { chest: '', waist: '', shoulder: '', length: '' },
    pant: { waist: '', length: '', hip: '' },
    custom: ''
  });
  const [orderItems, setOrderItems] = useState([
    { id: Date.now(), name: '', quantity: '', price: '', fabricType: '', assignedWorker: null }
  ]);
  const [errors, setErrors] = useState({});
  
  // Worker assignment state
  const [assignmentMode, setAssignmentMode] = useState('individual'); // 'individual' or 'whole'
  const [wholeOrderWorker, setWholeOrderWorker] = useState(null);

  // Customer search state
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
  const [searchedCustomers, setSearchedCustomers] = useState([]);

  // Worker state
  const [workers, setWorkers] = useState([]);
  const [isLoadingWorkers, setIsLoadingWorkers] = useState(false);
  const [workersError, setWorkersError] = useState(null);

  // Fetch workers on component mount
  useEffect(() => {
    fetchWorkers();
    fetchOrders();
  }, []);

  // Fetch workers from API
  const fetchWorkers = async () => {
    setIsLoadingWorkers(true);
    setWorkersError(null);

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

    if (!token) {
      console.error('No token found for fetching workers');
      setWorkersError('Authentication error. Please log in again.');
      setIsLoadingWorkers(false);
      return;
    }

    try {
      const result = await workerAPI.getWorkers(token);

      if (result.success) {
        console.log('Workers fetched successfully:', result.data);
        // Map API response to component format
        const mappedWorkers = (result.data.data || result.data || []).map(worker => ({
          id: worker.workerId || worker.id,
          name: worker.name,
          email: worker.email,
          phone: worker.contactNumber,
          specialization: worker.workType || 'General',
          experience: worker.experience || 0,
          status: 'active', // Assume all fetched workers are active
          ratings: worker.ratings || null
        }));
        setWorkers(mappedWorkers);
      } else {
        console.error('Failed to fetch workers:', result.error);
        setWorkersError(result.error);
      }
    } catch (error) {
      console.error('Error fetching workers:', error);
      setWorkersError('Failed to load workers. Please try again.');
    } finally {
      setIsLoadingWorkers(false);
    }
  };

  // Fetch orders from API
  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    setOrdersError(null);

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

    if (!token) {
      console.error('No token found for fetching orders');
      setOrdersError('Authentication error. Please log in again.');
      setIsLoadingOrders(false);
      return;
    }

    try {
      const result = await orderAPI.getOrders(token);

      if (result.success) {
        console.log('Orders fetched successfully:', result.data);
        // Map API response to component format
        const mappedOrders = (result.data || []).map(order => ({
          id: `ORD${String(order.orderId).padStart(3, '0')}`,
          customerId: order.customerId,
          customerName: order.customerName,
          orderDate: order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          deliveryDate: order.deadline,
          status: order.status ? order.status.toLowerCase() : 'pending',
          priority: 'medium',
          items: order.items || [],
          totalAmount: order.totalPrice || 0,
          paidAmount: order.advancePayment || 0,
          balanceAmount: (order.totalPrice || 0) - (order.advancePayment || 0),
          measurements: order.measurements || {},
          notes: order.additionalNotes || '',
          assignedWorker: null,
          workerName: null,
          assignmentMode: 'individual'
        }));
        setOrders(mappedOrders);
      } else {
        console.error('Failed to fetch orders:', result.error);
        setOrdersError(result.error);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrdersError('Failed to load orders. Please try again.');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Debounced customer search effect
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (customerSearchQuery.trim() && customerSearchQuery.trim().length >= 2) {
        searchCustomersAPI(customerSearchQuery.trim());
      } else {
        setSearchedCustomers([]);
        setIsSearchingCustomers(false);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(delaySearch);
  }, [customerSearchQuery]);

  // Search customers via API
  const searchCustomersAPI = async (query) => {
    setIsSearchingCustomers(true);

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

    if (!token) {
      console.error('No token found for customer search');
      setIsSearchingCustomers(false);
      return;
    }

    try {
      const result = await customerAPI.searchCustomers(query, token);
      
      if (result.success) {
        console.log('Customer search results:', result.data);
        // Map API response to component format
        const mappedCustomers = (result.data || []).map(customer => ({
          id: customer.customerId || customer.id,
          name: customer.user?.name || customer.name,
          email: customer.user?.email || customer.email,
          phone: customer.user?.contactNumber || customer.phone,
          measurements: customer.measurements
        }));
        setSearchedCustomers(mappedCustomers);
      } else {
        console.error('Customer search failed:', result.error);
        setSearchedCustomers([]);
      }
    } catch (error) {
      console.error('Customer search error:', error);
      setSearchedCustomers([]);
    } finally {
      setIsSearchingCustomers(false);
    }
  };

  // Use searched customers from API if available, otherwise use local list
  const filteredCustomers = customerSearchQuery.trim().length >= 2 && searchedCustomers.length > 0
    ? searchedCustomers
    : customerSearchQuery.trim().length >= 2 && !isSearchingCustomers
    ? []
    : customerList.filter(customer =>
        customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
        customer.phone.includes(customerSearchQuery) ||
        customer.email.toLowerCase().includes(customerSearchQuery.toLowerCase())
      );

  // Handle customer selection
  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setCustomerSearchQuery(customer.name);
    setShowCustomerDropdown(false);
    
    if (customer && customer.measurements) {
      setMeasurements(prev => ({
        ...prev,
        ...customer.measurements
      }));
    }
    
    if (errors.customer) {
      setErrors(prev => ({ ...prev, customer: null }));
    }
  };

  const handleCustomerSearchChange = (e) => {
    setCustomerSearchQuery(e.target.value);
    setShowCustomerDropdown(true);
    if (!e.target.value) {
      setSelectedCustomer(null);
    }
  };

  const handleAddNewCustomer = (newCustomer) => {
    setCustomerList(prev => [...prev, newCustomer]);
    setSelectedCustomer(newCustomer);
  };

  const handleMeasurementChange = (section, field, value) => {
    setMeasurements(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleCustomMeasurementChange = (value) => {
    setMeasurements(prev => ({
      ...prev,
      custom: value
    }));
  };

  const handleItemChange = (itemId, field, value) => {
    setOrderItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
    
    if (errors.items) {
      setErrors(prev => ({ ...prev, items: null }));
    }
  };

  const handleAddItem = () => {
    setOrderItems(prev => [
      ...prev,
      { id: Date.now(), name: '', quantity: '', price: '', fabricType: '', assignedWorker: null }
    ]);
  };

  const handleRemoveItem = (itemId) => {
    if (orderItems.length > 1) {
      setOrderItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedCustomer) {
      newErrors.customer = 'Please select a customer';
    }

    if (!deliveryDate) {
      newErrors.deliveryDate = 'Delivery date is required';
    } else if (!isValidDate(deliveryDate)) {
      newErrors.deliveryDate = 'Delivery date must be in the future';
    }

    if (advancePayment && !isValidAmount(advancePayment)) {
      newErrors.advancePayment = 'Please enter a valid amount';
    }

    const hasEmptyItems = orderItems.some(
      item => !item.name || !item.quantity || !item.price
    );
    
    if (hasEmptyItems) {
      newErrors.items = 'Please fill in all item details (name, quantity, price)';
    }

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

  const handleSaveOrder = async () => {
    if (!validateForm()) {
      return;
    }

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + (Number(item.quantity) * Number(item.price)),
      0
    );

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

    if (!token) {
      alert('Authentication error. Please log in again.');
      return;
    }

    // Prepare order payload for API
    const orderPayload = {
      customerId: selectedCustomer.id,
      deadline: deliveryDate,
      totalPrice: totalAmount,
      advancePayment: advancePayment ? Number(advancePayment) : 0,
      additionalNotes: notes || '',
      items: orderItems.map(item => ({
        itemName: item.name,
        quantity: Number(item.quantity),
        price: Number(item.price),
        fabricType: item.fabricType || 'Standard'
      })),
      tasks: []
    };

    // Add tasks based on worker assignment mode
    if (assignmentMode === 'whole' && wholeOrderWorker) {
      // Assign all items to one worker
      orderPayload.tasks = orderItems.map(item => ({
        workerId: wholeOrderWorker.id,
        taskType: 'STITCHING' // Default task type
      }));
    } else if (assignmentMode === 'individual') {
      // Assign items individually
      orderPayload.tasks = orderItems
        .filter(item => item.assignedWorker)
        .map(item => ({
          workerId: item.assignedWorker,
          taskType: 'STITCHING' // Default task type
        }));
    }

    console.log('Creating order with payload:', orderPayload);

    try {
      const result = await orderAPI.createOrder(orderPayload, token);

      if (result.success) {
        console.log('Order created successfully:', result.data);

        // Determine worker assignment for local state
        let assignedWorker = null;
        let workerName = null;
        let itemsWithWorkers = orderItems;

        if (assignmentMode === 'whole' && wholeOrderWorker) {
          assignedWorker = wholeOrderWorker.id;
          workerName = wholeOrderWorker.name;
          itemsWithWorkers = orderItems.map(item => ({
            ...item,
            assignedWorker: wholeOrderWorker.id,
            workerName: wholeOrderWorker.name
          }));
        }

        // Add to local state for immediate UI update
        const newOrder = {
          id: result.data.orderId || `ORD${String(orders.length + 1).padStart(3, '0')}`,
          customerId: selectedCustomer.id,
          customerName: selectedCustomer.name,
          orderDate: new Date().toISOString().split('T')[0],
          deliveryDate,
          status: 'pending',
          priority: 'medium',
          items: itemsWithWorkers.map(item => ({
            id: `ITEM${item.id}`,
            type: item.name,
            fabric: item.fabricType || 'Standard',
            quantity: Number(item.quantity),
            price: Number(item.price),
            assignedWorker: item.assignedWorker || null,
            workerName: item.workerName || null
          })),
          totalAmount,
          paidAmount: advancePayment ? Number(advancePayment) : 0,
          balanceAmount: totalAmount - (advancePayment ? Number(advancePayment) : 0),
          measurements,
          notes,
          assignedWorker,
          workerName,
          assignmentMode
        };

        setOrders(prev => [newOrder, ...prev]);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);

        // Refresh orders from API
        fetchOrders();

        // Reset form
        resetForm();
        setShowNewOrderModal(false);
      } else {
        console.error('Order creation failed:', result.error);
        alert(`Failed to create order: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('An error occurred while creating the order. Please try again.');
    }
  };

  const resetForm = () => {
    setSelectedCustomer(null);
    setCustomerSearchQuery('');
    setShowCustomerDropdown(false);
    setDeliveryDate('');
    setAdvancePayment('');
    setNotes('');
    setMeasurements({
      shirt: { chest: '', waist: '', shoulder: '', length: '' },
      pant: { waist: '', length: '', hip: '' },
      custom: ''
    });
    setOrderItems([
      { id: Date.now(), name: '', quantity: '', price: '', fabricType: '', assignedWorker: null }
    ]);
    setAssignmentMode('individual');
    setWholeOrderWorker(null);
    setErrors({});
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'stitching':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'cutting':
        return <Clock className="w-5 h-5 text-purple-600" />;
      case 'fitting':
        return <Clock className="w-5 h-5 text-indigo-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'stitching':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'cutting':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
      case 'fitting':
        return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400';
      default:
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
    }
  };

  // Handle View Order
  const handleViewOrder = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    setSelectedOrderForView(order);
    setShowViewModal(true);
  };

  // Handle Edit Order
  const handleEditOrder = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    setEditingOrder(order);
    
    // Pre-fill form with order data
    const customer = customerList.find(c => c.id === order.customerId);
    setSelectedCustomer(customer);
    setDeliveryDate(order.deliveryDate);
    setAdvancePayment(order.paidAmount.toString());
    setNotes(order.notes || '');
    setMeasurements(order.measurements || {
      shirt: { chest: '', waist: '', shoulder: '', length: '' },
      pant: { waist: '', length: '', hip: '' },
      custom: ''
    });
    setOrderItems(order.items.map(item => ({
      id: Date.now() + Math.random(),
      name: item.type,
      quantity: item.quantity.toString(),
      price: item.price.toString(),
      fabricType: item.fabric
    })));
    
    setShowEditModal(true);
  };

  // Handle Update Order
  const handleUpdateOrder = () => {
    if (!validateForm()) {
      return;
    }

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + (Number(item.quantity) * Number(item.price)),
      0
    );

    const updatedOrder = {
      ...editingOrder,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      deliveryDate,
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
      notes
    };

    setOrders(prev => prev.map(o => o.id === editingOrder.id ? updatedOrder : o));
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);

    // Reset form
    resetForm();
    setEditingOrder(null);
    setShowEditModal(false);
  };

  // Handle Delete Order
  const handleDeleteOrder = (orderId) => {
    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      setOrders(prev => prev.filter(o => o.id !== orderId));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    
    return matchesSearch && matchesStatus;
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
                className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-green-800 dark:text-green-400 font-medium">
                    Order created successfully!
                  </span>
                </div>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Order Management</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Track and manage all orders</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNewOrderModal(true)}
                className="bg-orange-500 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-orange-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
                New Order
              </motion.button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search orders by ID or customer name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
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
                  <option value="pending">Pending</option>
                  <option value="cutting">Cutting</option>
                  <option value="stitching">Stitching</option>
                  <option value="fitting">Fitting</option>
                  <option value="ready">Ready</option>
                </select>
              </div>
            </div>

            {/* Orders List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Order ID</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Customer</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Delivery</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Amount</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {isLoadingOrders ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                            <p className="text-gray-600 dark:text-gray-400">Loading orders...</p>
                          </div>
                        </td>
                      </tr>
                    ) : ordersError ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                          <p className="text-red-600 dark:text-red-400 mb-3">{ordersError}</p>
                          <button
                            onClick={fetchOrders}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                          >
                            Retry
                          </button>
                        </td>
                      </tr>
                    ) : filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-600 dark:text-gray-400">
                            {searchQuery || filterStatus !== 'all' 
                              ? 'No orders found matching your filters.' 
                              : 'No orders yet. Create your first order!'}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-semibold text-gray-900 dark:text-gray-100">{order.id}</span>
                          </td>
                          <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{order.customerName}</td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{order.orderDate}</td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{order.deliveryDate}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-gray-900 dark:text-gray-100">${order.totalAmount}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleViewOrder(order.id)}
                                className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" 
                                title="View"
                              >
                                <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              </button>
                              <button 
                                onClick={() => handleEditOrder(order.id)}
                                className="p-2 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition-colors" 
                                title="Edit"
                              >
                                <Edit className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                              </button>
                              <button 
                                onClick={() => handleDeleteOrder(order.id)}
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
          </motion.div>
        </main>
      </div>

      {/* New Order Modal */}
      <AnimatePresence>
        {showNewOrderModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowNewOrderModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create New Order</h2>
                <button
                  onClick={() => setShowNewOrderModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Customer Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-orange-500" />
                    Customer Information
                  </h3>
                  
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Customer <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input
                          type="text"
                          value={customerSearchQuery}
                          onChange={handleCustomerSearchChange}
                          onFocus={() => setShowCustomerDropdown(true)}
                          placeholder="Search customer by name"
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                            errors.customer ? 'border-red-500 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                          }`}
                        />
                        
                        {/* Customer Dropdown */}
                        {showCustomerDropdown && customerSearchQuery && (
                          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {isSearchingCustomers ? (
                              <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400 text-sm">
                                <div className="flex items-center justify-center gap-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                                  Searching...
                                </div>
                              </div>
                            ) : filteredCustomers.length > 0 ? (
                              filteredCustomers.map(customer => (
                                <div
                                  key={customer.id}
                                  onClick={() => handleCustomerSelect(customer)}
                                  className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                                >
                                  <p className="font-medium text-gray-900 dark:text-gray-100">{customer.name}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{customer.phone} • {customer.email}</p>
                                </div>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">
                                No customers found
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => setShowCustomerModal(true)}
                        className="px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 whitespace-nowrap"
                      >
                        <Plus className="w-4 h-4" />
                        Add New
                      </button>
                    </div>
                    {errors.customer && (
                      <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.customer}</p>
                    )}
                  </div>

                  {selectedCustomer && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Email:</span> {selectedCustomer.email}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Phone:</span> {selectedCustomer.phone}
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-500" />
                    Order Items
                  </h3>

                  <div className="space-y-4">
                    {orderItems.map((item, index) => (
                      <div key={item.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-700 dark:text-gray-300">Item {index + 1}</h4>
                          {orderItems.length > 1 && (
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                              Item Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                              placeholder="e.g., Formal Shirt"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                              Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                              placeholder="1"
                              min="1"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                              Price <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                              placeholder="800"
                              min="0"
                              step="0.01"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Fabric Type</label>
                            <input
                              type="text"
                              value={item.fabricType}
                              onChange={(e) => handleItemChange(item.id, 'fabricType', e.target.value)}
                              placeholder="e.g., Cotton"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {errors.items && (
                      <p className="text-red-500 dark:text-red-400 text-sm">{errors.items}</p>
                    )}

                    <button
                      onClick={handleAddItem}
                      className="flex items-center gap-2 px-4 py-2 text-orange-600 dark:text-orange-400 border-2 border-orange-600 dark:border-orange-400 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors font-medium"
                    >
                      <Plus className="w-5 h-5" />
                      Add Another Item
                    </button>
                  </div>
                </div>

                {/* Worker Assignment */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-orange-500" />
                    Worker Assignment
                  </h3>

                  {/* Assignment Mode Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Assignment Mode
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="assignmentMode"
                          value="individual"
                          checked={assignmentMode === 'individual'}
                          onChange={(e) => setAssignmentMode(e.target.value)}
                          className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Assign items individually</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="assignmentMode"
                          value="whole"
                          checked={assignmentMode === 'whole'}
                          onChange={(e) => setAssignmentMode(e.target.value)}
                          className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Assign whole order to one worker</span>
                      </label>
                    </div>
                  </div>

                  {/* Individual Assignment */}
                  {assignmentMode === 'individual' && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-800 dark:text-blue-400 mb-3">
                        💡 You can assign each item to a different worker below.
                      </p>
                      <div className="space-y-2">
                        {orderItems.map((item, index) => {
                          const assignedWorker = workers.find(w => w.id === item.assignedWorker);
                          return (
                            <div key={item.id} className="flex items-center justify-between bg-white dark:bg-gray-700 rounded-lg p-3">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                  Item {index + 1}: {item.name || 'Unnamed Item'}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <select
                                  value={item.assignedWorker || ''}
                                  onChange={(e) => {
                                    const workerId = e.target.value;
                                    const worker = workers.find(w => w.id === workerId);
                                    handleItemChange(item.id, 'assignedWorker', workerId || null);
                                    handleItemChange(item.id, 'workerName', worker ? worker.name : null);
                                  }}
                                  disabled={isLoadingWorkers}
                                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <option value="">
                                    {isLoadingWorkers ? 'Loading workers...' : '-- Select Worker --'}
                                  </option>
                                  {workers.filter(w => w.status === 'active').map(worker => (
                                    <option key={worker.id} value={worker.id}>
                                      {worker.name} - {worker.specialization}
                                    </option>
                                  ))}
                                </select>
                                {assignedWorker && (
                                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                                    ✓ {assignedWorker.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Whole Order Assignment */}
                  {assignmentMode === 'whole' && (
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800">
                      <p className="text-sm text-purple-800 dark:text-purple-400 mb-3">
                        💡 Select one worker to handle all items in this order.
                      </p>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Select Worker for Entire Order
                        </label>
                        <select
                          value={wholeOrderWorker?.id || ''}
                          onChange={(e) => {
                            const workerId = e.target.value;
                            const worker = workers.find(w => w.id === workerId);
                            setWholeOrderWorker(worker || null);
                          }}
                          disabled={isLoadingWorkers}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">
                            {isLoadingWorkers ? 'Loading workers...' : '-- Select a worker --'}
                          </option>
                          {workers.filter(w => w.status === 'active').map(worker => (
                            <option key={worker.id} value={worker.id}>
                              {worker.name} - {worker.specialization}
                            </option>
                          ))}
                        </select>
                        {workersError && (
                          <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                            {workersError}
                            <button
                              onClick={fetchWorkers}
                              className="ml-2 underline hover:no-underline"
                            >
                              Retry
                            </button>
                          </div>
                        )}
                        {wholeOrderWorker && (
                          <div className="mt-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Selected Worker:</span> {wholeOrderWorker.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Specialization:</span> {wholeOrderWorker.specialization}
                            </p>
                            <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                              ✓ All {orderItems.length} item(s) will be assigned to this worker
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    Order Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Delivery Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => {
                          setDeliveryDate(e.target.value);
                          if (errors.deliveryDate) {
                            setErrors(prev => ({ ...prev, deliveryDate: null }));
                          }
                        }}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                          errors.deliveryDate ? 'border-red-500 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      />
                      {errors.deliveryDate && (
                        <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.deliveryDate}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Advance Payment
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input
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
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                            errors.advancePayment ? 'border-red-500 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                          }`}
                        />
                      </div>
                      {errors.advancePayment && (
                        <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.advancePayment}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Enter any special instructions or notes for this order..."
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowNewOrderModal(false)}
                    className="flex-1 py-3 rounded-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveOrder}
                    className="flex-1 py-3 rounded-lg font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
                  >
                    Create Order
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Order Modal */}
      <AnimatePresence>
        {showViewModal && selectedOrderForView && (
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
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Order Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Order ID</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{selectedOrderForView.id}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold mt-1 ${getStatusColor(selectedOrderForView.status)}`}>
                      {getStatusIcon(selectedOrderForView.status)}
                      {selectedOrderForView.status}
                    </span>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Customer</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedOrderForView.customerName}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Order Date</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedOrderForView.orderDate}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Delivery Date</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedOrderForView.deliveryDate}</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">${selectedOrderForView.totalAmount}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrderForView.items.map((item, index) => (
                      <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">{item.type}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Fabric: {item.fabric}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-900 dark:text-gray-100">Qty: {item.quantity} × ${item.price}</p>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">${item.quantity * item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Info */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Payment Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Paid Amount:</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">${selectedOrderForView.paidAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Balance:</span>
                      <span className="font-semibold text-orange-600 dark:text-orange-400">${selectedOrderForView.balanceAmount}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrderForView.notes && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Notes</h3>
                    <p className="text-gray-700 dark:text-gray-300">{selectedOrderForView.notes}</p>
                  </div>
                )}

                {/* Footer */}
                <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleEditOrder(selectedOrderForView.id);
                    }}
                    className="flex-1 py-3 rounded-lg font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
                  >
                    Edit Order
                  </button>
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

      {/* Edit Order Modal - Reuse New Order Modal with pre-filled data */}
      <AnimatePresence>
        {showEditModal && editingOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowEditModal(false);
              setEditingOrder(null);
              resetForm();
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Order</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingOrder(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Modal Body - Same structure as New Order Modal */}
              <div className="p-6 space-y-6">
                {/* Customer Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-orange-500" />
                    Customer Information
                  </h3>
                  
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Customer <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input
                          type="text"
                          value={customerSearchQuery}
                          onChange={handleCustomerSearchChange}
                          onFocus={() => setShowCustomerDropdown(true)}
                          placeholder="Search customer by name, phone, or email..."
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                            errors.customer ? 'border-red-500 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                          }`}
                        />
                        
                        {/* Customer Dropdown */}
                        {showCustomerDropdown && customerSearchQuery && (
                          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {isSearchingCustomers ? (
                              <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400 text-sm">
                                <div className="flex items-center justify-center gap-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                                  Searching...
                                </div>
                              </div>
                            ) : filteredCustomers.length > 0 ? (
                              filteredCustomers.map(customer => (
                                <div
                                  key={customer.id}
                                  onClick={() => handleCustomerSelect(customer)}
                                  className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                                >
                                  <p className="font-medium text-gray-900 dark:text-gray-100">{customer.name}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{customer.phone} • {customer.email}</p>
                                </div>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">
                                No customers found
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => setShowCustomerModal(true)}
                        className="px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 whitespace-nowrap"
                      >
                        <Plus className="w-4 h-4" />
                        Add New
                      </button>
                    </div>
                    {errors.customer && (
                      <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.customer}</p>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-500" />
                    Order Items
                  </h3>

                  <div className="space-y-4">
                    {orderItems.map((item, index) => (
                      <div key={item.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-700 dark:text-gray-300">Item {index + 1}</h4>
                          {orderItems.length > 1 && (
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                              Item Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                              placeholder="e.g., Formal Shirt"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                              Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                              placeholder="1"
                              min="1"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                              Price <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                              placeholder="800"
                              min="0"
                              step="0.01"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Fabric Type</label>
                            <input
                              type="text"
                              value={item.fabricType}
                              onChange={(e) => handleItemChange(item.id, 'fabricType', e.target.value)}
                              placeholder="e.g., Cotton"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {errors.items && (
                      <p className="text-red-500 dark:text-red-400 text-sm">{errors.items}</p>
                    )}

                    <button
                      onClick={handleAddItem}
                      className="flex items-center gap-2 px-4 py-2 text-orange-600 dark:text-orange-400 border-2 border-orange-600 dark:border-orange-400 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors font-medium"
                    >
                      <Plus className="w-5 h-5" />
                      Add Another Item
                    </button>
                  </div>
                </div>

                {/* Order Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    Order Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Delivery Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => {
                          setDeliveryDate(e.target.value);
                          if (errors.deliveryDate) {
                            setErrors(prev => ({ ...prev, deliveryDate: null }));
                          }
                        }}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                          errors.deliveryDate ? 'border-red-500 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      />
                      {errors.deliveryDate && (
                        <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.deliveryDate}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Advance Payment
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input
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
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                            errors.advancePayment ? 'border-red-500 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                          }`}
                        />
                      </div>
                      {errors.advancePayment && (
                        <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.advancePayment}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Enter any special instructions or notes for this order..."
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingOrder(null);
                      resetForm();
                    }}
                    className="flex-1 py-3 rounded-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateOrder}
                    className="flex-1 py-3 rounded-lg font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
                  >
                    Update Order
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onSave={handleAddNewCustomer}
      />
    </div>
  );
};

export default Orders;
