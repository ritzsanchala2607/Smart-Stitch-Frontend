import { useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion, AnimatePresence } from 'framer-motion';
import usePageTitle from '../../hooks/usePageTitle';
import {
  CreditCard,
  Smartphone,
  Building,
  Wallet,
  CheckCircle,
  Download,
  Home,
  Calendar,
  Package,
  DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Payment = () => {
  usePageTitle('Payment');
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Mock order data
  const orderData = {
    items: [
      { name: 'Classic Formal Shirt', quantity: 2, price: 800 },
      { name: 'Designer Kurta', quantity: 1, price: 1700 },
      { name: 'Formal Pants', quantity: 1, price: 1000 }
    ],
    subtotal: 4300,
    discount: 430,
    deliveryCharge: 0,
    gst: 696,
    total: 4566,
    deliveryDate: '2024-02-15',
    orderId: 'ORD' + Date.now()
  };

  // Payment methods
  const paymentMethods = [
    {
      id: 'upi',
      name: 'UPI',
      icon: Smartphone,
      description: 'Pay using UPI apps',
      popular: true
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Visa, Mastercard, Rupay'
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      icon: Building,
      description: 'All major banks'
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      icon: Wallet,
      description: 'Pay when you receive'
    }
  ];

  // Handle payment
  const handlePayment = () => {
    setProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      setPaymentSuccess(true);
    }, 2000);
  };

  // Download invoice
  const downloadInvoice = () => {
    alert('Invoice download started (UI only)');
  };

  if (paymentSuccess) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar role="customer" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-y-auto p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-3xl mx-auto"
            >
              {/* Success Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                </motion.div>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Payment Successful!</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">Your order has been placed successfully</p>

                {/* Order Details */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6 text-left">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Order ID</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{orderData.orderId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Amount Paid</p>
                      <p className="font-semibold text-green-600 dark:text-green-400">₹{orderData.total.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Payment Method</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100 capitalize">{selectedMethod}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Expected Delivery</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{orderData.deliveryDate}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Order Items:</p>
                    <div className="space-y-1">
                      {orderData.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-700 dark:text-gray-300">{item.name} × {item.quantity}</span>
                          <span className="text-gray-900 dark:text-gray-100">₹{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Invoice Preview */}
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">Invoice Ready</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Invoice_{orderData.orderId}.pdf</p>
                      </div>
                    </div>
                    <button
                      onClick={downloadInvoice}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate('/customer/orders')}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                  >
                    View Orders
                  </button>
                  <button
                    onClick={() => navigate('/customer/dashboard')}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium"
                  >
                    <Home className="w-4 h-4" />
                    Dashboard
                  </button>
                </div>
              </div>
            </motion.div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="customer" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto space-y-6"
          >
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Payment</h1>
                <p className="text-gray-600 dark:text-gray-400">Complete your order payment</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Payment Methods */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Select Payment Method</h2>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      return (
                        <motion.button
                          key={method.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedMethod(method.id)}
                          className={`w-full p-4 rounded-lg border-2 transition-all ${
                            selectedMethod === method.id
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              selectedMethod === method.id ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-700'
                            }`}>
                              <Icon className={`w-6 h-6 ${
                                selectedMethod === method.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                              }`} />
                            </div>
                            <div className="flex-1 text-left">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-900 dark:text-gray-100">{method.name}</p>
                                {method.popular && (
                                  <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
                                    Popular
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{method.description}</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedMethod === method.id
                                ? 'border-blue-600 bg-blue-600'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}>
                              {selectedMethod === method.id && (
                                <CheckCircle className="w-4 h-4 text-white" />
                              )}
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Payment Form */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Payment Details</h2>
                  
                  {selectedMethod === 'upi' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">UPI ID</label>
                        <input
                          type="text"
                          placeholder="yourname@upi"
                          className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                        />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Enter your UPI ID to complete the payment
                      </p>
                    </div>
                  )}

                  {selectedMethod === 'card' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Card Number</label>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                          className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expiry Date</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            maxLength="5"
                            className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CVV</label>
                          <input
                            type="text"
                            placeholder="123"
                            maxLength="3"
                            className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cardholder Name</label>
                        <input
                          type="text"
                          placeholder="Name on card"
                          className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                        />
                      </div>
                    </div>
                  )}

                  {selectedMethod === 'netbanking' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Bank</label>
                        <select className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100">
                          <option>State Bank of India</option>
                          <option>HDFC Bank</option>
                          <option>ICICI Bank</option>
                          <option>Axis Bank</option>
                          <option>Punjab National Bank</option>
                          <option>Other Banks</option>
                        </select>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        You will be redirected to your bank's website to complete the payment
                      </p>
                    </div>
                  )}

                  {selectedMethod === 'cod' && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Cash on Delivery:</strong> Pay when you receive your order. Please keep exact change ready.
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Additional charges may apply for COD orders.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Payment Summary</h2>

                  {/* Order Items */}
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Order Items:</p>
                    <div className="space-y-2">
                      {orderData.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-700 dark:text-gray-300">{item.name} × {item.quantity}</span>
                          <span className="text-gray-900 dark:text-gray-100">₹{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-2 mb-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between text-gray-700 dark:text-gray-300">
                      <span>Subtotal</span>
                      <span>₹{orderData.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Discount</span>
                      <span>-₹{orderData.discount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-700 dark:text-gray-300">
                      <span>Delivery</span>
                      <span className="text-green-600 dark:text-green-400">FREE</span>
                    </div>
                    <div className="flex justify-between text-gray-700 dark:text-gray-300">
                      <span>GST (18%)</span>
                      <span>₹{orderData.gst.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">Total Amount</span>
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹{orderData.total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Delivery Date */}
                  <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-gray-700 dark:text-gray-300">Expected Delivery:</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{orderData.deliveryDate}</span>
                    </div>
                  </div>

                  {/* Pay Button */}
                  <button
                    onClick={handlePayment}
                    disabled={processing}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-semibold"
                  >
                    {processing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <DollarSign className="w-5 h-5" />
                        Pay ₹{orderData.total.toLocaleString()}
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-3">
                    By proceeding, you agree to our terms and conditions
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Payment;
