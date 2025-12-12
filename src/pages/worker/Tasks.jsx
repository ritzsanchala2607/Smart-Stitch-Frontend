import { useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  X,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Scissors,
  FileText,
  Image as ImageIcon,
  Upload,
  Save,
  ChevronDown,
  Package
} from 'lucide-react';
import { orders, inventory } from '../../data/dummyData';

const WorkerTasks = () => {
  // Mock worker ID
  const currentWorkerId = 'WORK001';

  // Get worker's tasks
  const workerTasks = orders.filter(o => o.assignedWorker === currentWorkerId);

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [garmentFilter, setGarmentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [workNotes, setWorkNotes] = useState('');
  const [uploadedPhoto, setUploadedPhoto] = useState(null);

  // Filter and search tasks
  const filteredTasks = workerTasks.filter(task => {
    const matchesSearch = 
      task.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.items.some(item => item.type.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesGarment = garmentFilter === 'all' || 
      task.items.some(item => item.type.toLowerCase().includes(garmentFilter.toLowerCase()));

    return matchesSearch && matchesStatus && matchesPriority && matchesGarment;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'deadline') {
      return new Date(a.deliveryDate) - new Date(b.deliveryDate);
    } else if (sortBy === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    } else if (sortBy === 'date') {
      return new Date(b.orderDate) - new Date(a.orderDate);
    }
    return 0;
  });

  // Status update handler
  const handleStatusUpdate = (taskId, newStatus) => {
    console.log(`Updating task ${taskId} to status: ${newStatus}`);
    // In real app, this would update the backend
    alert(`Task ${taskId} status updated to ${newStatus}`);
  };

  // Work notes handler
  const handleAddWorkNote = () => {
    if (workNotes.trim()) {
      console.log(`Adding work note for task ${selectedTask.id}: ${workNotes}`);
      alert(`Work note added: ${workNotes}`);
      setWorkNotes('');
    }
  };

  // Photo upload handler
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Get next status
  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      pending: 'cutting',
      cutting: 'stitching',
      stitching: 'fitting',
      fitting: 'ready',
      ready: 'ready'
    };
    return statusFlow[currentStatus] || currentStatus;
  };

  // Get status label
  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Start Task',
      cutting: 'Move to Stitching',
      stitching: 'Move to Fitting',
      fitting: 'Mark as Ready',
      ready: 'Completed'
    };
    return labels[status] || 'Update Status';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="worker" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
                  <p className="text-gray-600">Manage your daily work assignments</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-blue-100 rounded-lg">
                  <span className="text-sm font-semibold text-blue-900">
                    {sortedTasks.length} Tasks
                  </span>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by Order ID, Customer, or Garment Type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Filter Toggle Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Filter className="w-5 h-5" />
                  <span className="font-medium">Filters</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Filter Options */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
                      {/* Status Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="all">All Status</option>
                          <option value="pending">Pending</option>
                          <option value="cutting">Cutting</option>
                          <option value="stitching">Stitching</option>
                          <option value="fitting">Fitting</option>
                          <option value="ready">Ready</option>
                        </select>
                      </div>

                      {/* Priority Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                        <select
                          value={priorityFilter}
                          onChange={(e) => setPriorityFilter(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="all">All Priority</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>

                      {/* Garment Type Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Garment Type</label>
                        <select
                          value={garmentFilter}
                          onChange={(e) => setGarmentFilter(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="all">All Types</option>
                          <option value="shirt">Shirt</option>
                          <option value="pant">Pant</option>
                          <option value="blouse">Blouse</option>
                          <option value="kurta">Kurta</option>
                          <option value="sherwani">Sherwani</option>
                        </select>
                      </div>

                      {/* Sort By */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="deadline">Deadline</option>
                          <option value="priority">Priority</option>
                          <option value="date">Assigned Date</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tasks Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Garment Type</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Instructions</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Assigned Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Deadline</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedTasks.length > 0 ? (
                      sortedTasks.map((task) => (
                        <tr key={task.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{task.id}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {task.items.map(item => item.type).join(', ')}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{task.customerName}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                            {task.notes || 'No special instructions'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{task.orderDate}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {task.deliveryDate}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <PriorityBadge priority={task.priority} />
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={task.status} />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedTask(task)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {task.status !== 'ready' && (
                                <button
                                  onClick={() => handleStatusUpdate(task.id, getNextStatus(task.status))}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Update Status"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="px-6 py-12 text-center">
                          <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p className="text-gray-500">No tasks found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </main>
      </div>

      {/* Task Details Modal */}
      <AnimatePresence>
        {selectedTask && (
          <TaskDetailsModal
            task={selectedTask}
            onClose={() => {
              setSelectedTask(null);
              setWorkNotes('');
              setUploadedPhoto(null);
            }}
            onStatusUpdate={handleStatusUpdate}
            getNextStatus={getNextStatus}
            getStatusLabel={getStatusLabel}
            workNotes={workNotes}
            setWorkNotes={setWorkNotes}
            handleAddWorkNote={handleAddWorkNote}
            uploadedPhoto={uploadedPhoto}
            handlePhotoUpload={handlePhotoUpload}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Task Details Modal Component
const TaskDetailsModal = ({
  task,
  onClose,
  onStatusUpdate,
  getNextStatus,
  getStatusLabel,
  workNotes,
  setWorkNotes,
  handleAddWorkNote,
  uploadedPhoto,
  handlePhotoUpload
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Task Details</h2>
            <p className="text-sm text-gray-600">{task.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Customer & Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Customer Information</h3>
                <div className="space-y-2">
                  <InfoRow label="Customer Name" value={task.customerName} />
                  <InfoRow label="Order Date" value={task.orderDate} />
                  <InfoRow label="Delivery Date" value={task.deliveryDate} />
                  <InfoRow label="Priority" value={<PriorityBadge priority={task.priority} />} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Order Status</h3>
                <div className="space-y-2">
                  <InfoRow label="Current Status" value={<StatusBadge status={task.status} />} />
                  <InfoRow label="Total Amount" value={`₹${task.totalAmount.toLocaleString()}`} />
                  <InfoRow label="Paid Amount" value={`₹${task.paidAmount.toLocaleString()}`} />
                  <InfoRow label="Balance" value={`₹${task.balanceAmount.toLocaleString()}`} />
                </div>
              </div>
            </div>
          </div>

          {/* Garment Items */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Garment Details</h3>
            <div className="space-y-3">
              {task.items.map((item, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <InfoRow label="Type" value={item.type} />
                    <InfoRow label="Fabric" value={item.fabric} />
                    <InfoRow label="Color" value={item.color} />
                    <InfoRow label="Quantity" value={item.quantity} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Measurements */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Customer Measurements</h3>
            <div className="p-4 bg-blue-50 rounded-lg">
              {Object.keys(task.measurements).length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(task.measurements).map(([key, value]) => (
                    <div key={key}>
                      {typeof value === 'object' ? (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 capitalize mb-2">{key}:</p>
                          <div className="space-y-1 ml-2">
                            {Object.entries(value).map(([subKey, subValue]) => (
                              <p key={subKey} className="text-sm text-gray-600">
                                <span className="capitalize">{subKey}:</span> {subValue}
                              </p>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <InfoRow label={key} value={value} />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">No measurements available</p>
              )}
            </div>
          </div>

          {/* Instructions & Notes */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Stitching Instructions</h3>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  {task.notes || 'No special instructions provided'}
                </p>
              </div>
            </div>
          </div>

          {/* Material Needed */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Materials Needed</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {task.items.map((item, index) => {
                const material = inventory.find(inv => 
                  inv.name.toLowerCase().includes(item.fabric.toLowerCase())
                );
                return (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">{item.fabric}</p>
                    {material && (
                      <p className="text-xs text-gray-600 mt-1">
                        Available: {material.quantity} {material.unit}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reference Images */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Reference Images</h3>
            <div className="p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-center">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">No reference images available</p>
            </div>
          </div>

          {/* Work Notes Section */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Add Work Notes</h3>
            <div className="space-y-3">
              <textarea
                value={workNotes}
                onChange={(e) => setWorkNotes(e.target.value)}
                placeholder="Add notes like: Need more material, Measurement mismatch, Repair required..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="4"
              />
              <button
                onClick={handleAddWorkNote}
                disabled={!workNotes.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Note
              </button>
            </div>
          </div>

          {/* Upload Work Photo */}
          {task.status === 'fitting' && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Upload Work Photo</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    Choose Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  {uploadedPhoto && (
                    <span className="text-sm text-green-600 font-medium">Photo uploaded!</span>
                  )}
                </div>
                {uploadedPhoto && (
                  <div className="mt-3">
                    <img
                      src={uploadedPhoto}
                      alt="Work preview"
                      className="max-w-xs rounded-lg border border-gray-300"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status Update Button */}
          {task.status !== 'ready' && (
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  onStatusUpdate(task.id, getNextStatus(task.status));
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                <CheckCircle className="w-5 h-5" />
                {getStatusLabel(task.status)}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Info Row Component
const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-gray-600">{label}:</span>
    <span className="text-sm font-medium text-gray-900">{value}</span>
  </div>
);

// Priority Badge Component
const PriorityBadge = ({ priority }) => {
  const config = {
    high: { bg: 'bg-red-100', text: 'text-red-700', label: 'High' },
    medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Medium' },
    low: { bg: 'bg-green-100', text: 'text-green-700', label: 'Low' }
  };

  const { bg, text, label } = config[priority] || config.low;

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${bg} ${text}`}>
      {label}
    </span>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const config = {
    pending: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Pending', icon: Clock },
    cutting: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Cutting', icon: Scissors },
    stitching: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Stitching', icon: Scissors },
    fitting: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Fitting', icon: AlertCircle },
    ready: { bg: 'bg-green-100', text: 'text-green-700', label: 'Ready', icon: CheckCircle }
  };

  const { bg, text, label, icon: Icon } = config[status] || config.pending;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${bg} ${text}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

export default WorkerTasks;
