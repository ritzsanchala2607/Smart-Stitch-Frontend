import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, IndianRupee, Calendar, FileText, CreditCard, Wallet, Smartphone, Building2, CheckCircle, Clock } from 'lucide-react';

const PaymentUpdateModal = ({ isOpen, onClose, order, onPaymentUpdate }) => {
  const [additionalPayment, setAdditionalPayment] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentNote, setPaymentNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Calculate remaining balance with safe defaults
  const totalPrice = order?.totalPrice || order?.totalAmount || 0;
  const paidAmount = order?.paidAmount || order?.advancePayment || 0;
  const remainingBalance = totalPrice - paidAmount;

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setAdditionalPayment('');
      setPaymentMethod('CASH');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaymentNote('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    const amount = parseFloat(additionalPayment);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }

    if (amount > remainingBalance) {
      setError(`Payment amount cannot exceed remaining balance of ₹${remainingBalance.toLocaleString()}`);
      return;
    }

    setIsSubmitting(true);

    const paymentData = {
      additionalPayment: amount,
      paymentMethod,
      paymentDate: new Date(paymentDate).toISOString(),
      paymentNote: paymentNote.trim()
    };

    try {
      const orderId = order?.orderId || order?.id;
      await onPaymentUpdate(orderId, paymentData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentMethods = [
    { value: 'CASH', label: 'Cash', icon: Wallet },
    { value: 'CARD', label: 'Card', icon: CreditCard },
    { value: 'UPI', label: 'UPI', icon: Smartphone },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: Building2 }
  ];

  if (!isOpen || !order) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Update Payment</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Order #{order?.orderId || order?.id || 'N/A'}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Payment Summary */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Payment Summary</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Amount</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">₹{totalPrice.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Paid Amount</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">₹{paidAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Balance Due</p>
                  <p className="text-xl font-bold text-orange-600 dark:text-orange-400">₹{remainingBalance.toLocaleString()}</p>
                </div>
              </div>
              
              {/* Payment Progress */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Payment Progress</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {totalPrice > 0 ? ((paidAmount / totalPrice) * 100).toFixed(0) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all"
                    style={{ width: `${totalPrice > 0 ? (paidAmount / totalPrice) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Additional Payment Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Payment Amount *
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={additionalPayment}
                    onChange={(e) => {
                      const value = e.target.value;
                      const numValue = parseFloat(value);
                      
                      // Allow empty input for user to type
                      if (value === '') {
                        setAdditionalPayment('');
                        setError('');
                        return;
                      }
                      
                      // Prevent values greater than remaining balance
                      if (numValue > remainingBalance) {
                        setError(`Payment amount cannot exceed remaining balance of ₹${remainingBalance.toLocaleString()}`);
                        return;
                      }
                      
                      // Prevent negative values
                      if (numValue < 0) {
                        setError('Payment amount must be positive');
                        return;
                      }
                      
                      // Clear error and set value
                      setError('');
                      setAdditionalPayment(value);
                    }}
                    onBlur={(e) => {
                      const value = e.target.value;
                      const numValue = parseFloat(value);
                      
                      // Validate on blur
                      if (value && numValue > remainingBalance) {
                        setAdditionalPayment(remainingBalance.toString());
                        setError('');
                      }
                    }}
                    placeholder="Enter amount"
                    min="0.01"
                    step="0.01"
                    max={remainingBalance}
                    required
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors ${
                      error && additionalPayment
                        ? 'border-red-500 dark:border-red-600 focus:ring-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500'
                    }`}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Maximum: ₹{remainingBalance.toLocaleString()}
                </p>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Method *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() => setPaymentMethod(method.value)}
                        className={`p-3 border-2 rounded-lg flex items-center gap-3 transition-all ${
                          paymentMethod === method.value
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30'
                            : 'border-gray-300 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-700'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${
                          paymentMethod === method.value
                            ? 'text-orange-600 dark:text-orange-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }`} />
                        <span className={`font-medium ${
                          paymentMethod === method.value
                            ? 'text-orange-600 dark:text-orange-400'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {method.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Payment Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              {/* Payment Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Note (Optional)
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    placeholder="Add any notes about this payment..."
                    rows="3"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Update Payment
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PaymentUpdateModal;
