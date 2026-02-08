import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Edit, Trash2, User, Mail, Phone, ShoppingBag, IndianRupee } from 'lucide-react';
import PropTypes from 'prop-types';

const CustomerCard = ({ customer, onView, onEdit, onDelete }) => {
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.3 }}
      data-testid="customer-card"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {customer.avatar ? (
            <img
              src={customer.avatar}
              alt={customer.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
          )}
        </div>

        {/* Customer Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
            {customer.name}
          </h3>
          
          <div className="mt-2 space-y-1">
            {/* Email */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{customer.email}</span>
            </div>
            
            {/* Phone */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span>{customer.phone}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                <ShoppingBag className="w-4 h-4" />
                <span className="text-xs font-medium">Total Orders</span>
              </div>
              <p className="text-lg font-bold text-blue-900 dark:text-blue-300">{customer.totalOrders}</p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
                <IndianRupee className="w-4 h-4" />
                <span className="text-xs font-medium">Total Spent</span>
              </div>
              <p className="text-lg font-bold text-green-900 dark:text-green-300">
                ₹{customer.totalSpent.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        <motion.button
          onClick={() => onView(customer.id)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          whileTap={{ scale: 0.95 }}
          data-testid="view-button"
        >
          <Eye className="w-4 h-4" />
          <span className="text-sm font-medium">View</span>
        </motion.button>
        
        <motion.button
          onClick={() => onEdit(customer.id)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          whileTap={{ scale: 0.95 }}
          data-testid="edit-button"
        >
          <Edit className="w-4 h-4" />
          <span className="text-sm font-medium">Edit</span>
        </motion.button>

        {onDelete && (
          <motion.button
            onClick={() => onDelete(customer.id)}
            className="px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
            whileTap={{ scale: 0.95 }}
            data-testid="delete-button"
            title="Delete Customer"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

CustomerCard.propTypes = {
  customer: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    email: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
    totalOrders: PropTypes.number.isRequired,
    totalSpent: PropTypes.number.isRequired,
  }).isRequired,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
};

export default CustomerCard;
