import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Edit, Trash2, User } from 'lucide-react';
import PropTypes from 'prop-types';

const WorkerCard = ({ worker, onViewDetails, onEdit, onDelete }) => {
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.3 }}
      data-testid="worker-card"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {worker.avatar ? (
            <img
              src={worker.avatar}
              alt={worker.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
          )}
        </div>

        {/* Worker Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
            {worker.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{worker.specialization}</p>
          
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Assigned Orders:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{worker.assignedOrders}</span>
            </div>
            
            {/* Performance Meter */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Performance:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{worker.performance}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${worker.performance}%` }}
                />
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  worker.status === 'active'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                    : worker.status === 'on-leave'
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                }`}
              >
                {worker.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        <motion.button
          onClick={() => onViewDetails(worker.id)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          whileTap={{ scale: 0.95 }}
          data-testid="view-details-button"
        >
          <Eye className="w-4 h-4" />
          <span className="text-sm font-medium">View Details</span>
        </motion.button>
        
        <motion.button
          onClick={() => onEdit(worker.id)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          whileTap={{ scale: 0.95 }}
          data-testid="edit-button"
        >
          <Edit className="w-4 h-4" />
          <span className="text-sm font-medium">Edit</span>
        </motion.button>
        
        <motion.button
          onClick={() => onDelete(worker.id)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
          whileTap={{ scale: 0.95 }}
          data-testid="delete-button"
        >
          <Trash2 className="w-4 h-4" />
          <span className="text-sm font-medium">Delete</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

WorkerCard.propTypes = {
  worker: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    specialization: PropTypes.string.isRequired,
    assignedOrders: PropTypes.number.isRequired,
    performance: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
  }).isRequired,
  onViewDetails: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default WorkerCard;
