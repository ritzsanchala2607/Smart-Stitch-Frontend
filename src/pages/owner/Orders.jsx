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
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrderForView, setSelectedOrderForView] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [showDeliverConfirm, setShowDeliverConfirm] = useState(false);
  const [orderToDeliver, setOrderToDeliver] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // New Order Form State
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerList, setCustomerList] = useState(customers);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [orderStatus, setOrderStatus] = useState('PENDING'); // Add order status state
  const [advancePayment, setAdvancePayment] = useState('');
  const [notes, setNotes] = useState('');
  const [measurements, setMeasurements] = useState({
    shirt: { chest: '', waist: '', shoulder: '', length: '' },
    pant: { waist: '', length: '', hip: '' },
    custom: ''
  });
  const [orderItems, setOrderItems] = useState([
    { 
      id: Date.now(), 
      name: '', 
      quantity: '', 
      price: '', 
      fabricType: '', 
      tasks: [
        { id: `${Date.now()}-cutting`, type: 'CUTTING', workerId: null, workerName: null, deadline: '' },
        { id: `${Date.now()}-stitching`, type: 'STITCHING', workerId: null, workerName: null, deadline: '' },
        { id: `${Date.now()}-ironing`, type: 'IRONING', workerId: null, workerName: null, deadline: '' }
      ]
    }
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
          orderId: order.orderId, // Keep the numeric ID for API calls
          customerId: order.customer?.customerId || order.customerId,
          customerName: order.customer?.name || order.customerName || 'Unknown Customer',
          orderDate: order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          deliveryDate: order.deadline,
          status: order.status ? order.status.toLowerCase() : 'pending',
          priority: 'medium',
          items: order.items || [],
          totalAmount: order.totalPrice || 0,
          paidAmount: order.paidAmount || order.advancePayment || 0,
          balanceAmount: (order.totalPrice || 0) - (order.paidAmount || order.advancePayment || 0),
          measurements: order.measurements || {},
          notes: order.notes || order.additionalNotes || '',
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
    const newItemId = Date.now();
    setOrderItems(prev => [
      ...prev,
      { 
        id: newItemId, 
        name: '', 
        quantity: '', 
        price: '', 
        fabricType: '', 
        tasks: [
          { id: `${newItemId}-cutting`, type: 'CUTTING', workerId: null, workerName: null, deadline: '' },
          { id: `${newItemId}-stitching`, type: 'STITCHING', workerId: null, workerName: null, deadline: '' },
          { id: `${newItemId}-ironing`, type: 'IRONING', workerId: null, workerName: null, deadline: '' }
        ]
      }
    ]);
  };

  const handleTaskChange = (itemId, taskId, field, value) => {
    setOrderItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? {
              ...item,
              tasks: item.tasks.map(task =>
                task.id === taskId
                  ? { ...task, [field]: value }
                  : task
              )
            }
          : item
      )
    );
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
    const paidAmount = advancePayment && advancePayment.trim() !== '' ? Number(advancePayment) : 0;
    
    // Calculate payment status based on paid amount
    let paymentStatus = 'PENDING';
    if (paidAmount >= totalAmount) {
      paymentStatus = 'PAID';
    } else if (paidAmount > 0) {
      paymentStatus = 'PARTIAL';
    }
    
    const orderPayload = {
      customerId: selectedCustomer.id,
      deadline: deliveryDate,
      totalPrice: totalAmount,
      paidAmount: isNaN(paidAmount) ? 0 : paidAmount, // Ensure valid number, never null/NaN
      paymentStatus: paymentStatus, // Backend expects paymentStatus
      notes: notes || '', // Backend expects notes (not additionalNotes)
      items: orderItems.map(item => ({
        itemName: item.name,
        quantity: Number(item.quantity),
        price: Number(item.price),
        fabricType: item.fabricType || 'Standard'
      })),
      tasks: []
    };

    // Add tasks from items - each item can have multiple tasks (cutting, stitching, ironing)
    orderPayload.tasks = [];
    orderItems.forEach(item => {
      if (item.tasks && item.tasks.length > 0) {
        item.tasks.forEach(task => {
          if (task.workerId && task.deadline) {
            orderPayload.tasks.push({
              workerId: task.workerId,
              taskType: task.type,
              deadline: task.deadline
            });
          }
        });
      }
    });

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
        setSuccessMessage('Order created successfully! 🎉');
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
    const newItemId = Date.now();
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
      { 
        id: newItemId, 
        name: '', 
        quantity: '', 
        price: '', 
        fabricType: '', 
        tasks: [
          { id: `${newItemId}-cutting`, type: 'CUTTING', workerId: null, workerName: null, deadline: '' },
          { id: `${newItemId}-stitching`, type: 'STITCHING', workerId: null, workerName: null, deadline: '' },
          { id: `${newItemId}-ironing`, type: 'IRONING', workerId: null, workerName: null, deadline: '' }
        ]
      }
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
  const handleEditOrder = async (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

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
      setSuccessMessage('Authentication error. Please log in again.');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      return;
    }

    try {
      // Fetch full order details from API
      const result = await orderAPI.getOrderById(order.orderId, token);
      
      if (result.success) {
        const orderDetails = result.data;
        
        // Set editing order with full details
        setEditingOrder({
          ...order,
          customerId: orderDetails.customer?.customerId || order.customerId,
          customerName: orderDetails.customer?.name || order.customerName
        });
        
        // Set customer info (read-only in edit mode)
        const customer = {
          id: orderDetails.customer?.customerId || order.customerId,
          name: orderDetails.customer?.name || order.customerName,
          email: orderDetails.customer?.email || '',
          phone: orderDetails.customer?.contactNumber || ''
        };
        setSelectedCustomer(customer);
        
        // Pre-fill editable fields with order data from API
        setDeliveryDate(orderDetails.deadline || order.deliveryDate);
        setOrderStatus(orderDetails.status || order.status || 'PENDING'); // Set order status
        setAdvancePayment((orderDetails.advancePayment || order.paidAmount || 0).toString());
        setNotes(orderDetails.additionalNotes || order.notes || '');
        
        // Set items from API
        if (orderDetails.items && orderDetails.items.length > 0) {
          setOrderItems(orderDetails.items.map(item => ({
            id: item.itemId || Date.now() + Math.random(),
            name: item.itemName || item.itemType || item.type || '',
            quantity: (item.quantity || 1).toString(),
            price: (item.price || 0).toString(),
            fabricType: item.fabricType || item.fabric || ''
          })));
        } else {
          setOrderItems(order.items.map(item => ({
            id: Date.now() + Math.random(),
            name: item.type,
            quantity: item.quantity.toString(),
            price: item.price.toString(),
            fabricType: item.fabric
          })));
        }
        
        setShowEditModal(true);
      } else {
        setSuccessMessage(`Failed to fetch order details: ${result.error}`);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setSuccessMessage('Failed to load order details. Please try again.');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  };

  // Handle Update Order
  const handleUpdateOrder = async () => {
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
      setSuccessMessage('Authentication error. Please log in again.');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      return;
    }

    // Prepare order payload for API - use existing customer ID
    const paidAmount = advancePayment && advancePayment.trim() !== '' ? Number(advancePayment) : 0;
    
    // Calculate payment status based on paid amount
    let paymentStatus = 'PENDING';
    if (paidAmount >= totalAmount) {
      paymentStatus = 'PAID';
    } else if (paidAmount > 0) {
      paymentStatus = 'PARTIAL';
    }
    
    const orderPayload = {
      customerId: editingOrder.customerId, // Keep the original customer
      deadline: deliveryDate,
      totalPrice: totalAmount,
      paidAmount: isNaN(paidAmount) ? 0 : paidAmount, // Ensure valid number, never null/NaN
      paymentStatus: paymentStatus, // Backend expects paymentStatus
      notes: notes || '', // Backend expects notes (not additionalNotes)
      status: orderStatus, // Include order status in update
      items: orderItems.map(item => ({
        itemName: item.name,
        quantity: Number(item.quantity),
        price: Number(item.price),
        fabricType: item.fabricType || 'Standard'
      }))
    };

    console.log('Updating order with payload:', orderPayload);

    try {
      const result = await orderAPI.updateOrder(editingOrder.orderId, orderPayload, token);

      if (result.success) {
        console.log('Order updated successfully:', result.data);

        setSuccessMessage('Order updated successfully! ✅');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);

        // Refresh orders from API
        fetchOrders();

        // Reset form
        resetForm();
        setEditingOrder(null);
        setShowEditModal(false);
      } else {
        console.error('Order update failed:', result.error);
        setSuccessMessage(`Failed to update order: ${result.error}`);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      setSuccessMessage('An error occurred while updating the order. Please try again.');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  };

  // Handle Delete Order - Show Modal
  const handleDeleteOrder = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    setOrderToDelete(order);
    setShowDeleteModal(true);
  };

  // Cancel Delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setOrderToDelete(null);
  };

  // Confirm Delete Order
  const confirmDelete = async () => {
    if (!orderToDelete) return;

    setIsDeleting(true);

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
      setSuccessMessage('Authentication error. Please log in again.');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      setIsDeleting(false);
      setShowDeleteModal(false);
      return;
    }

    try {
      console.log('Deleting order:', orderToDelete.orderId);
      const result = await orderAPI.deleteOrder(orderToDelete.orderId, token);

      if (result.success) {
        // Remove from local state only after successful API call
        setOrders(prev => prev.filter(o => o.id !== orderToDelete.id));
        setSuccessMessage('Order deleted successfully! 🗑️');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        
        // Close modal
        setShowDeleteModal(false);
        setOrderToDelete(null);
        
        // Refresh orders from API
        fetchOrders();
      } else {
        console.error('Failed to delete order:', result.error);
        setSuccessMessage(`Failed to delete order: ${result.error}`);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      setSuccessMessage('An error occurred while deleting the order. Please try again.');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Mark as Delivered
  const handleMarkAsDelivered = async (orderId) => {
    setOrderToDeliver(orderId);
    setShowDeliverConfirm(true);
  };

  const confirmDelivery = async () => {
    setShowDeliverConfirm(false);
    
    if (!orderToDeliver) return;

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
      setSuccessMessage('Authentication error. Please log in again.');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      return;
    }

    try {
      const result = await orderAPI.markAsDelivered(orderToDeliver, token);
      
      if (result.success) {
        // Update the order status in the local state
        setOrders(prev => prev.map(o => 
          o.orderId === orderToDeliver ? { ...o, status: 'Delivered' } : o
        ));
        setSuccessMessage('Order marked as delivered successfully! 🎉');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
        // Refresh orders list
        fetchOrders();
      } else {
        // Check if endpoint is not implemented
        if (result.error.includes('No static resource') || result.error.includes('not found')) {
          setSuccessMessage('⚠️ Delivery feature coming soon! Backend endpoint not yet available.');
        } else {
          setSuccessMessage(`Failed: ${result.error}`);
        }
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
      }
    } catch (error) {
      console.error('Error marking as delivered:', error);
      setSuccessMessage('Failed to mark order as delivered. Please try again.');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
    
    setOrderToDeliver(null);
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // "now" shows orders currently in progress (cutting, stitching, fitting)
    const matchesStatus = filterStatus === 'all' 
      ? true 
      : filterStatus === 'now' 
        ? ['cutting', 'stitching', 'fitting'].includes(order.status)
        : order.status === filterStatus;
    
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
                initial={{ opacity: 0, y: -50, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, y: -50, x: '-50%' }}
                className="fixed top-6 left-1/2 z-50 max-w-md w-full"
              >
                <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 ${
                  successMessage.includes('Failed') || successMessage.includes('coming soon') 
                    ? 'border-orange-500 dark:border-orange-400' 
                    : 'border-green-500 dark:border-green-400'
                } p-4 flex items-center gap-3`}>
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    successMessage.includes('Failed') || successMessage.includes('coming soon')
                      ? 'bg-orange-100 dark:bg-orange-900/30'
                      : 'bg-green-100 dark:bg-green-900/30'
                  }`}>
                    {successMessage.includes('Failed') || successMessage.includes('coming soon') ? (
                      <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    ) : (
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {successMessage || 'Order created successfully!'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowSuccess(false)}
                    className="flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
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
                  <option value="now">Now</option>
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
                            <span className="font-semibold text-gray-900 dark:text-gray-100">₹{order.totalAmount}</span>
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
                              {(order.status.toLowerCase() === 'ready' || order.status.toLowerCase() === 'completed') && (
                                <button 
                                  onClick={() => handleMarkAsDelivered(order.orderId)}
                                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1" 
                                  title="Mark as Delivered"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                  Deliver
                                </button>
                              )}
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

                {/* Order Items & Task Assignment */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-500" />
                    Order Items & Task Assignment
                  </h3>

                  <div className="space-y-6">
                    {orderItems.map((item, index) => (
                      <div key={item.id} className="p-5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100">Item {index + 1}</h4>
                          {orderItems.length > 1 && (
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>

                        {/* Item Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fabric Type</label>
                            <input
                              type="text"
                              value={item.fabricType}
                              onChange={(e) => handleItemChange(item.id, 'fabricType', e.target.value)}
                              placeholder="e.g., Cotton"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                            />
                          </div>
                        </div>

                        {/* Task Assignment for this Item */}
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <h5 className="font-semibold text-sm text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Task Assignment for this Item
                          </h5>
                          <div className="space-y-3">
                            {item.tasks && item.tasks.map((task) => (
                              <div key={task.id} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    {task.type} Worker
                                  </label>
                                  <select
                                    value={task.workerId || ''}
                                    onChange={(e) => {
                                      const workerId = e.target.value;
                                      const worker = workers.find(w => w.id === workerId);
                                      handleTaskChange(item.id, task.id, 'workerId', workerId || null);
                                      handleTaskChange(item.id, task.id, 'workerName', worker ? worker.name : null);
                                    }}
                                    disabled={isLoadingWorkers}
                                    className="w-full px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                                  >
                                    <option value="">-- Select Worker --</option>
                                    {workers.filter(w => w.status === 'active').map(worker => (
                                      <option key={worker.id} value={worker.id}>
                                        {worker.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Deadline
                                  </label>
                                  <input
                                    type="date"
                                    value={task.deadline}
                                    onChange={(e) => handleTaskChange(item.id, task.id, 'deadline', e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                  />
                                </div>
                                <div className="flex items-end">
                                  {task.workerId && task.deadline ? (
                                    <span className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                                      <CheckCircle className="w-4 h-4" />
                                      Assigned
                                    </span>
                                  ) : (
                                    <span className="text-xs text-gray-400 dark:text-gray-500">Optional</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}

                    {errors.items && (
                      <p className="text-red-500 dark:text-red-400 text-sm">{errors.items}</p>
                    )}

                    <button
                      onClick={handleAddItem}
                      className="flex items-center gap-2 px-4 py-3 text-orange-600 dark:text-orange-400 border-2 border-dashed border-orange-600 dark:border-orange-400 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors font-medium w-full justify-center"
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
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-5xl w-full"
            >
              {/* Modal Header */}
              <div className="bg-gray-800 dark:bg-gray-900 px-6 py-4 flex items-center justify-between rounded-t-xl border-b-2 border-orange-500">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedOrderForView.id}</h2>
                  <p className="text-gray-300 text-sm">{selectedOrderForView.customerName}</p>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-300" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {/* Top Info Cards - 4 columns */}
                <div className="grid grid-cols-4 gap-4 mb-5">
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">STATUS</p>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedOrderForView.status)}`}>
                      {getStatusIcon(selectedOrderForView.status)}
                      {selectedOrderForView.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">ORDER DATE</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{selectedOrderForView.orderDate}</p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">DELIVERY DATE</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{selectedOrderForView.deliveryDate}</p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border-2 border-orange-500 dark:border-orange-600">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">TOTAL AMOUNT</p>
                    <p className="text-xl font-bold text-orange-600 dark:text-orange-500">₹{selectedOrderForView.totalAmount}</p>
                  </div>
                </div>

                {/* Main Content - 2 Columns */}
                <div className="grid grid-cols-2 gap-5">
                  {/* Left Column - Order Items */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                      <Package className="w-4 h-4 text-orange-500" />
                      ORDER ITEMS
                    </h3>
                    <div className="space-y-2.5 max-h-44 overflow-y-auto pr-2">
                      {selectedOrderForView.items.map((item, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 transition-colors">
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.type}</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">₹{item.quantity * item.price}</p>
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
                            <span>Fabric: {item.fabric}</span>
                            <span>Qty: {item.quantity} × ₹{item.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column - Payment & Notes */}
                  <div className="space-y-4">
                    {/* Payment Information */}
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                        <DollarSign className="w-4 h-4 text-orange-500" />
                        PAYMENT DETAILS
                      </h3>
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center p-2.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Total Amount</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">₹{selectedOrderForView.totalAmount}</span>
                        </div>
                        <div className="flex justify-between items-center p-2.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Paid Amount</span>
                          <span className="text-sm font-bold text-green-600 dark:text-green-500">₹{selectedOrderForView.paidAmount}</span>
                        </div>
                        <div className="flex justify-between items-center p-2.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Balance Due</span>
                          <span className="text-sm font-bold text-orange-600 dark:text-orange-500">₹{selectedOrderForView.balanceAmount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {selectedOrderForView.notes && (
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                          <FileText className="w-4 h-4 text-orange-500" />
                          NOTES
                        </h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{selectedOrderForView.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 rounded-b-xl">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="flex-1 py-2.5 rounded-lg font-semibold text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditOrder(selectedOrderForView.id);
                  }}
                  className="flex-1 py-2.5 rounded-lg font-semibold text-sm text-white bg-orange-500 hover:bg-orange-600 transition-colors shadow-sm"
                >
                  Edit Order
                </button>
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
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header - Fixed */}
              <div className="bg-gray-800 dark:bg-gray-900 px-5 py-3 flex items-center justify-between border-b-2 border-orange-500 flex-shrink-0">
                <h2 className="text-lg font-bold text-white">Edit Order - {editingOrder.id}</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingOrder(null);
                    resetForm();
                  }}
                  className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-300" />
                </button>
              </div>

              {/* Modal Body - Scrollable */}
              <div className="p-4 space-y-3 overflow-y-auto flex-1">
                {/* Customer Info - Read Only */}
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-orange-500" />
                    CUSTOMER
                  </h3>
                  
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <User className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {selectedCustomer?.name || editingOrder.customerName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {selectedCustomer?.phone || selectedCustomer?.email || 'Customer details'}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 italic">
                      (Read-only)
                    </div>
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
                        Order Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={orderStatus}
                        onChange={(e) => setOrderStatus(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="IN_CUTTING">In Cutting</option>
                        <option value="IN_STITCHING">In Stitching</option>
                        <option value="IN_IRONING">In Ironing</option>
                        <option value="READY">Ready</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="DELIVERED">Delivered</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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

      {/* Deliver Confirmation Modal */}
      <AnimatePresence>
        {showDeliverConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeliverConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
            >
              {/* Icon */}
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-center text-gray-900 dark:text-gray-100 mb-2">
                Mark as Delivered?
              </h3>

              {/* Message */}
              <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to mark this order as delivered? The customer will be notified.
              </p>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeliverConfirm(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelivery}
                  className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && orderToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={cancelDelete}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full"
            >
              {/* Modal Header */}
              <div className="bg-red-50 dark:bg-red-900/20 px-6 py-4 rounded-t-2xl border-b border-red-200 dark:border-red-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-red-900 dark:text-red-100">Delete Order</h2>
                    <p className="text-sm text-red-700 dark:text-red-300">This action cannot be undone</p>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Are you sure you want to delete order <span className="font-semibold text-gray-900 dark:text-gray-100">{orderToDelete.id}</span> for customer <span className="font-semibold text-gray-900 dark:text-gray-100">{orderToDelete.customerName}</span>?
                </p>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-2">
                    ⚠️ This will permanently delete:
                  </p>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 ml-4">
                    <li>• Order details and items</li>
                    <li>• Payment information</li>
                    <li>• All associated tasks</li>
                    <li>• Order history records</li>
                  </ul>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 px-6 pb-6">
                <button
                  onClick={cancelDelete}
                  disabled={isDeleting}
                  className="flex-1 py-3 rounded-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  No, Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-3 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      Yes, Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Orders;
