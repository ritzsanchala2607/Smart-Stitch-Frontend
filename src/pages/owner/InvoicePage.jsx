import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Trash2, Download, User, Building2 } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { owners, customers } from '../../data/dummyData';
import { calculateInvoiceTotals } from '../../utils/calculations';

const InvoicePage = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [taxRate, setTaxRate] = useState(10); // Default 10% tax
  const [orderItems, setOrderItems] = useState([
    { id: Date.now(), description: '', quantity: 1, unitPrice: 0 }
  ]);
  const [notes, setNotes] = useState('');

  // Get owner information (first owner from dummy data)
  const owner = owners[0];

  // Calculate totals whenever items or tax rate changes
  const totals = calculateInvoiceTotals(orderItems, taxRate);

  const handleCustomerSelect = (e) => {
    const customerId = e.target.value;
    const customer = customers.find(c => c.id === customerId);
    setSelectedCustomer(customer || null);
  };

  const handleAddItem = () => {
    setOrderItems([
      ...orderItems,
      { id: Date.now(), description: '', quantity: 1, unitPrice: 0 }
    ]);
  };

  const handleRemoveItem = (itemId) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter(item => item.id !== itemId));
    }
  };

  const handleItemChange = (itemId, field, value) => {
    setOrderItems(orderItems.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    ));
  };

  const handleDownloadPDF = () => {
    // UI-only button - no actual PDF generation
    alert('PDF download functionality will be implemented with backend integration');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-5xl mx-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <FileText className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Generate Invoice</h1>
                  <p className="text-sm text-gray-600">Create professional invoices for your customers</p>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 bg-primary-navy text-white rounded-lg hover:bg-secondary-navy transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </motion.button>
            </div>

            {/* Invoice Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white rounded-lg shadow-lg p-8"
            >
              {/* Invoice Header */}
              <div className="border-b-2 border-gray-200 pb-6 mb-6">
                <div className="flex justify-between items-start">
                  {/* Owner Information */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-5 h-5 text-orange-600" />
                      <h2 className="text-2xl font-bold text-gray-900">{owner.shopName}</h2>
                    </div>
                    <p className="text-sm text-gray-600">{owner.name}</p>
                    <p className="text-sm text-gray-600">{owner.address}</p>
                    <p className="text-sm text-gray-600">Phone: {owner.phone}</p>
                    <p className="text-sm text-gray-600">Email: {owner.email}</p>
                  </div>
                  
                  {/* Invoice Details */}
                  <div className="text-right">
                    <h3 className="text-3xl font-bold text-orange-600 mb-2">INVOICE</h3>
                    <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">Invoice #: INV-{Date.now().toString().slice(-6)}</p>
                  </div>
                </div>
              </div>

              {/* Customer Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Bill To
                  </div>
                </label>
                <select
                  value={selectedCustomer?.id || ''}
                  onChange={handleCustomerSelect}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select Customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone}
                    </option>
                  ))}
                </select>
                
                {/* Display Selected Customer Info */}
                {selectedCustomer && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <p className="font-medium text-gray-900">{selectedCustomer.name}</p>
                    <p className="text-sm text-gray-600">{selectedCustomer.address}</p>
                    <p className="text-sm text-gray-600">Phone: {selectedCustomer.phone}</p>
                    <p className="text-sm text-gray-600">Email: {selectedCustomer.email}</p>
                  </motion.div>
                )}
              </div>

              {/* Order Items Table */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddItem}
                    className="flex items-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </motion.button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Description</th>
                        <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700 w-24">Quantity</th>
                        <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700 w-32">Unit Price</th>
                        <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700 w-32">Total</th>
                        <th className="w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderItems.map((item, index) => (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-gray-100"
                        >
                          <td className="py-3 px-2">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                              placeholder="Item description"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                            />
                          </td>
                          <td className="py-3 px-2">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 1)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-center"
                            />
                          </td>
                          <td className="py-3 px-2">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-right"
                            />
                          </td>
                          <td className="py-3 px-2 text-right font-medium text-gray-900">
                            ${(item.quantity * item.unitPrice).toFixed(2)}
                          </td>
                          <td className="py-3 px-2 text-center">
                            {orderItems.length > 1 && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleRemoveItem(item.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Calculations Section */}
              <div className="flex justify-end mb-6">
                <div className="w-full max-w-sm">
                  {/* Tax Rate Input */}
                  <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
                    <label className="text-sm font-medium text-gray-700">Tax Rate (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                      className="w-24 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-right"
                    />
                  </div>

                  {/* Subtotal */}
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Subtotal:</span>
                    <span className="text-lg font-medium text-gray-900">${totals.subtotal.toFixed(2)}</span>
                  </div>

                  {/* Tax */}
                  <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Tax ({taxRate}%):</span>
                    <span className="text-lg font-medium text-gray-900">${totals.tax.toFixed(2)}</span>
                  </div>

                  {/* Grand Total */}
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Grand Total:</span>
                    <span className="text-2xl font-bold text-orange-600">${totals.grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes / Terms & Conditions
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes or terms..."
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Footer */}
              <div className="border-t-2 border-gray-200 pt-6 text-center">
                <p className="text-sm text-gray-600">Thank you for your business!</p>
                <p className="text-xs text-gray-500 mt-2">
                  This invoice was generated by {owner.shopName}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default InvoicePage;
