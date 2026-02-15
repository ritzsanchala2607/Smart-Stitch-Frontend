import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion, AnimatePresence } from 'framer-motion';
import usePageTitle from '../../hooks/usePageTitle';
import { 
  FileText, Plus, Download, IndianRupee, TrendingUp, 
  Calendar, X, Building2, Search
} from 'lucide-react';
import { useState, useEffect } from 'react';
import AddCustomerModal from '../../components/AddCustomerModal';
import { useCustomers, useProfile } from '../../hooks/useDataFetch';

const Billing = () => {
  usePageTitle('Billing');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [additionalCost, setAdditionalCost] = useState(0);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Customer search state
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  // Use global state management for customers
  const { customers: globalCustomers, customersLoading, fetchCustomers } = useCustomers();
  const [customerList, setCustomerList] = useState([]);

  // Fetch owner profile for shop details
  const { profile: ownerProfile, isLoading: profileLoading } = useProfile();
  
  // Default shop info in case profile is not loaded yet
  const shopInfo = {
    name: ownerProfile?.shopName || 'Shop Name',
    address: ownerProfile?.shopAddress || 'Shop Address',
    phone: ownerProfile?.shopContactNumber || ownerProfile?.contactNumber || 'Contact Number',
    email: ownerProfile?.shopEmail || ownerProfile?.email || 'shop@email.com'
  };

  // Update customer list when global customers change
  useEffect(() => {
    if (globalCustomers && globalCustomers.length > 0) {
      setCustomerList(globalCustomers);
    }
  }, [globalCustomers]);

  // Filter customers based on search query
  const filteredCustomers = customerList.filter(customer =>
    customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
    customer.phone.includes(customerSearchQuery) ||
    customer.email.toLowerCase().includes(customerSearchQuery.toLowerCase())
  );

  // Handle customer selection
  const handleCustomerSelect = async (customer) => {
    setSelectedCustomer(customer);
    setCustomerSearchQuery(customer.name);
    setShowCustomerDropdown(false);
    setSelectedOrder(null);
    setCustomerOrders([]);

    // Fetch customer's orders
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

    if (token) {
      try {
        const { orderAPI } = await import('../../services/api');
        const result = await orderAPI.getOrders(token);
        
        if (result.success && result.data) {
          // Filter orders for this customer - try multiple field combinations
          const orders = result.data.filter(order => {
            // Try different possible customer ID fields
            const orderCustomerId = order.customer?.customerId || order.customer?.id || order.customerId;
            const orderCustomerName = order.customer?.name || order.customerName;
            
            // Match by ID or name
            return orderCustomerId == customer.id || 
                   orderCustomerId == customer.customerId ||
                   orderCustomerName === customer.name;
          });
          
          console.log('Customer:', customer);
          console.log('All orders:', result.data);
          console.log('Filtered orders for customer:', orders);
          setCustomerOrders(orders);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    }
  };

  const handleCustomerSearchChange = (e) => {
    setCustomerSearchQuery(e.target.value);
    setShowCustomerDropdown(true);
    if (!e.target.value) {
      setSelectedCustomer(null);
      setSelectedOrder(null);
      setCustomerOrders([]);
    }
  };

  const handleAddNewCustomer = (newCustomer) => {
    setCustomerList(prev => [...prev, newCustomer]);
    setSelectedCustomer(newCustomer);
    setCustomerSearchQuery(newCustomer.name);
    // Refresh global customers to include the new customer
    fetchCustomers(true);
  };

  const handleGenerateBill = async () => {
    if (!selectedOrder) {
      setErrorMessage('Please fetch an order first');
      return;
    }

    setIsGenerating(true);
    setErrorMessage('');

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
      setErrorMessage('Authentication required. Please login again.');
      setIsGenerating(false);
      return;
    }

    try {
      const { orderAPI } = await import('../../services/api');
      
      console.log('🔄 Generating bill for order:', selectedOrder.orderId);
      
      // Try PDF format first
      let result = await orderAPI.generateBill(selectedOrder.orderId, token, 'pdf');
      
      console.log('📄 Bill generation result:', result);
      
      // Check if we got a valid PDF
      if (result.success && result.data && result.data instanceof Blob) {
        console.log('📦 Blob size:', result.data.size, 'bytes');
        console.log('📦 Blob type:', result.data.type);
        
        // Check if it's actually JSON (backend doesn't support PDF)
        if (result.data.type.includes('json')) {
          console.warn('⚠️ Backend returned JSON instead of PDF. Falling back to JSON format...');
          // Try JSON format instead
          result = await orderAPI.generateBill(selectedOrder.orderId, token, 'json');
          
          if (result.success && result.data) {
            // Generate PDF on frontend using the JSON data
            await generatePDFFromData(result.data, selectedOrder);
            
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
            
            // Reset form
            setSelectedCustomer(null);
            setSelectedOrder(null);
            setCustomerSearchQuery('');
            setCustomerOrders([]);
            setAdditionalCost(0);
            setShowBillModal(false);
            return;
          }
        }
        
        if (result.data.size === 0) {
          throw new Error('Received empty PDF file from server');
        }
        
        // Valid PDF - download it
        const url = window.URL.createObjectURL(result.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Bill_Order_${selectedOrder.orderId}_${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 100);

        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        
        // Reset form
        setSelectedCustomer(null);
        setSelectedOrder(null);
        setCustomerSearchQuery('');
        setCustomerOrders([]);
        setAdditionalCost(0);
        setShowBillModal(false);
      } else {
        console.error('❌ Bill generation failed:', result.error);
        setErrorMessage(result.error || 'Failed to generate bill. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error generating bill:', error);
      setErrorMessage(`Failed to generate bill: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate PDF on frontend when backend doesn't support it
  const generatePDFFromData = async (billData, order) => {
    try {
      // Create a simple HTML-based PDF
      const printWindow = window.open('', '_blank');
      
      // Check if popup was blocked
      if (!printWindow || printWindow.closed || typeof printWindow.closed === 'undefined') {
        throw new Error('Popup blocked. Please allow popups for this site and try again.');
      }
      
      const orderTotal = order.totalAmount || order.totalPrice || 0;
      const finalTotal = orderTotal + (parseFloat(additionalCost) || 0);
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Bill - Order #${order.orderId}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .company-name { font-size: 24px; font-weight: bold; color: #f97316; }
            .bill-title { font-size: 20px; margin-top: 10px; }
            .section { margin: 20px 0; }
            .section-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
            .info-row { display: flex; justify-content: space-between; padding: 5px 0; }
            .label { font-weight: bold; }
            .total-section { margin-top: 30px; border-top: 2px solid #333; padding-top: 20px; }
            .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 18px; }
            .grand-total { font-weight: bold; font-size: 20px; color: #f97316; }
            @media print {
              body { padding: 20px; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">${shopInfo.name}</div>
            <div>${shopInfo.address}</div>
            <div>${shopInfo.phone} | ${shopInfo.email}</div>
            <div class="bill-title">BILL / INVOICE</div>
          </div>

          <div class="section">
            <div class="section-title">Bill Details</div>
            <div class="info-row">
              <span class="label">Bill Date:</span>
              <span>${new Date().toLocaleDateString()}</span>
            </div>
            <div class="info-row">
              <span class="label">Order ID:</span>
              <span>#${order.orderId}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Customer Information</div>
            <div class="info-row">
              <span class="label">Name:</span>
              <span>${order.customer?.name || order.customerName || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="label">Phone:</span>
              <span>${order.customer?.phone || order.customerPhone || 'N/A'}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Order Details</div>
            <div class="info-row">
              <span class="label">Garment Type:</span>
              <span>${order.garmentType || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="label">Status:</span>
              <span>${order.status || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="label">Delivery Date:</span>
              <span>${order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>

          <div class="total-section">
            <div class="total-row">
              <span>Order Amount:</span>
              <span>₹${orderTotal.toFixed(2)}</span>
            </div>
            ${additionalCost > 0 ? `
            <div class="total-row">
              <span>Additional Cost:</span>
              <span>₹${parseFloat(additionalCost).toFixed(2)}</span>
            </div>
            ` : ''}
            <div class="total-row">
              <span>Paid Amount:</span>
              <span>₹${(order.paidAmount || 0).toFixed(2)}</span>
            </div>
            <div class="total-row grand-total">
              <span>Total Bill Amount:</span>
              <span>₹${finalTotal.toFixed(2)}</span>
            </div>
            <div class="total-row grand-total">
              <span>Balance Due:</span>
              <span>₹${(finalTotal - (order.paidAmount || 0)).toFixed(2)}</span>
            </div>
          </div>

          <div style="margin-top: 40px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #f97316; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
              Print / Save as PDF
            </button>
            <button onclick="window.close()" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin-left: 10px;">
              Close
            </button>
          </div>

          <div style="margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>Thank you for your business!</p>
            <p>This is a computer-generated bill.</p>
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      console.log('✅ Bill opened in new window. User can print/save as PDF.');
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error(error.message || 'Failed to generate bill document');
    }
  };

  // Calculate order total
  const calculateOrderTotal = () => {
    if (!selectedOrder) return 0;
    const baseTotal = selectedOrder.totalAmount || selectedOrder.totalPrice || 0;
    return baseTotal + (parseFloat(additionalCost) || 0);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="owner" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
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
                className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4 flex items-center gap-3"
              >
                <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-green-800 dark:text-green-200 font-medium">
                  Bill generated and downloaded successfully!
                </span>
              </motion.div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Billing & Reports</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Generate bills for customer orders</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowBillModal(true)}
                className="bg-orange-500 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-orange-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Generate Bill
              </motion.button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <IndianRupee className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">This Month</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">₹0.00</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Bills Generated</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">0</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Pending Payments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">0</p>
              </motion.div>
            </div>

            {/* Monthly Report Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Monthly Financial Report</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
                    alert(`Downloading ${currentMonth} report...\nThis feature will generate a detailed PDF with:\n- Total Revenue\n- Total Expenses\n- Profit/Loss\n- Transaction Details`);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Monthly Report
                </motion.button>
              </div>

              {/* Month Selector */}
              <div className="flex items-center gap-4">
                <Calendar className="w-5 h-5 text-gray-400" />
                <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                  <option value="current">Current Month ({new Date().toLocaleString('default', { month: 'long', year: 'numeric' })})</option>
                  <option value="last">Last Month</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">How to Generate Bills</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                    <li>Click "Generate Bill" button above</li>
                    <li>Search and select a customer</li>
                    <li>Choose one of their orders</li>
                    <li>(Optional) Add additional costs</li>
                    <li>Click "Generate & Download Bill" to get PDF</li>
                  </ol>
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>

      {/* Generate Bill Modal */}
      <AnimatePresence>
        {showBillModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowBillModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Generate Bill</h2>
                <button
                  onClick={() => setShowBillModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {/* Error Message */}
                {errorMessage && (
                  <div className="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 flex items-center gap-3">
                    <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <span className="text-red-800 dark:text-red-300 font-medium">
                      {errorMessage}
                    </span>
                  </div>
                )}

                {/* Business Info */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{shopInfo.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{shopInfo.address}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{shopInfo.phone} | {shopInfo.email}</p>
                    </div>
                  </div>
                </div>

                {/* Customer Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Customer <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={customerSearchQuery}
                        onChange={handleCustomerSearchChange}
                        onFocus={() => setShowCustomerDropdown(true)}
                        placeholder="Search customer by name, phone, or email..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors placeholder-gray-500 dark:placeholder-gray-400"
                      />
                      
                      {/* Customer Dropdown */}
                      {showCustomerDropdown && customerSearchQuery && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {filteredCustomers.length > 0 ? (
                            filteredCustomers.map(customer => (
                              <div
                                key={customer.id}
                                onClick={() => handleCustomerSelect(customer)}
                                className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
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
                  
                  {selectedCustomer && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
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

                {/* Order Selection */}
                {selectedCustomer && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Order <span className="text-red-500">*</span>
                    </label>
                    {customerOrders.length > 0 ? (
                      <select
                        value={selectedOrder?.orderId || ''}
                        onChange={(e) => {
                          const order = customerOrders.find(o => o.orderId == e.target.value);
                          setSelectedOrder(order);
                        }}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Select an order</option>
                        {customerOrders.map(order => (
                          <option key={order.orderId} value={order.orderId}>
                            Order #{order.orderId} - {order.garmentType} - ₹{order.totalAmount || order.totalPrice || 0}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        No orders found for this customer
                      </p>
                    )}
                  </div>
                )}

                {/* Order Details */}
                {selectedOrder && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Order Details</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Garment Type:</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{selectedOrder.garmentType}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Status:</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{selectedOrder.status}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Order Amount:</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">₹{selectedOrder.totalAmount || selectedOrder.totalPrice || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Paid Amount:</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">₹{selectedOrder.paidAmount || 0}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Additional Cost */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={additionalCost}
                    onChange={(e) => setAdditionalCost(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Optional: Add any extra charges (delivery, rush order, etc.)
                  </p>
                </div>

                {/* Total */}
                {selectedOrder && (
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex justify-between text-gray-700 dark:text-gray-300">
                        <span>Order Amount:</span>
                        <span className="font-semibold">₹{selectedOrder.totalAmount || selectedOrder.totalPrice || 0}</span>
                      </div>
                      {additionalCost > 0 && (
                        <div className="flex justify-between text-gray-700 dark:text-gray-300">
                          <span>Additional Cost:</span>
                          <span className="font-semibold">₹{additionalCost.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-gray-100 pt-2 border-t border-gray-300 dark:border-gray-600">
                        <span>Total Bill Amount:</span>
                        <span>₹{calculateOrderTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal Footer */}
                <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowBillModal(false)}
                    disabled={isGenerating}
                    className="flex-1 py-3 rounded-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerateBill}
                    disabled={!selectedOrder || isGenerating}
                    className="flex-1 py-3 rounded-lg font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Generate & Download Bill
                      </>
                    )}
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

export default Billing;
