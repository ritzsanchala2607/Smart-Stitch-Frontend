import { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion, AnimatePresence } from 'framer-motion';
import usePageTitle from '../../hooks/usePageTitle';
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
import { inventory } from '../../data/dummyData';
import { workerAPI } from '../../services/api';

const WorkerTasks = () => {
  usePageTitle('My Tasks');

  // State management
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [garmentFilter, setGarmentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');
  const [selectedTask, setSelectedTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [workNotes, setWorkNotes] = useState('');
  const [uploadedPhoto, setUploadedPhoto] = useState(null);

  // Fetch tasks on mount
  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
    setIsLoading(true);
    setError(null);

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
      console.error('No token found for fetching tasks');
      setError('Authentication error. Please log in again.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await workerAPI.getMyTasks(token);

      if (result.success) {
        console.log('Tasks fetched successfully:', result.data);
        // Map API response to component format
        const mappedTasks = (result.data || []).map(task => ({
          id: `ORD${String(task.order?.orderId || task.orderId).padStart(3, '0')}`,
          taskId: task.taskId,
          orderId: task.order?.orderId || task.orderId,
          customerName: task.order?.customer?.user?.name || task.customerName || 'Unknown Customer',
          taskType: task.taskType,
          status: task.status?.toLowerCase() || 'pending',
          priority: 'medium', // Default priority
          orderDate: task.order?.createdAt ? new Date(task.order.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          deliveryDate: task.order?.deadline || task.deliveryDate || 'N/A',
          notes: task.order?.notes || task.notes || 'No special instructions',
          items: [{ type: task.taskType || 'Task', fabric: 'Standard', color: 'N/A', quantity: 1 }],
          measurements: {},
          totalAmount: task.order?.totalPrice || 0,
          paidAmount: task.order?.paidAmount || 0,
          balanceAmount: (task.order?.totalPrice || 0) - (task.order?.paidAmount || 0),
          assignedAt: task.assignedAt,
          startedAt: task.startedAt,
          completedAt: task.completedAt
        }));
        setTasks(mappedTasks);
      } else {
        console.error('Failed to fetch tasks:', result.error);
        setError(result.error);
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks. Please try again.');
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and search tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.taskType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesGarment = garmentFilter === 'all' || 
      task.taskType.toLowerCase().includes(garmentFilter.toLowerCase());

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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
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
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Tasks</h1>
                  <p className="text-gray-600 dark:text-gray-400">Manage your daily work assignments</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <span className="text-sm font-semibold text-blue-900 dark:text-blue-400">
                    {sortedTasks.length} Tasks
                  </span>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search by Order ID, Customer, or Garment Type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>

                {/* Filter Toggle Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-900 dark:text-gray-100"
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
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      {/* Status Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
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
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                        <select
                          value={priorityFilter}
                          onChange={(e) => setPriorityFilter(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                        >
                          <option value="all">All Priority</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>

                      {/* Garment Type Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Garment Type</label>
                        <select
                          value={garmentFilter}
                          onChange={(e) => setGarmentFilter(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
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
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort By</label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Garment Type</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Instructions</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Assigned Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Deadline</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {isLoading ? (
                      <tr>
                        <td colSpan="9" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                            <p className="text-gray-600 dark:text-gray-400">Loading tasks...</p>
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan="9" className="px-6 py-12 text-center">
                          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
                          <p className="text-red-600 dark:text-red-400 mb-3">{error}</p>
                          <button
                            onClick={fetchMyTasks}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Retry
                          </button>
                        </td>
                      </tr>
                    ) : sortedTasks.length > 0 ? (
                      sortedTasks.map((task) => (
                        <tr key={task.taskId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{task.id}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {task.taskType}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{task.customerName}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                            {task.notes || 'No special instructions'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{task.orderDate}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
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
                                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {task.status !== 'ready' && task.status !== 'completed' && (
                                <button
                                  onClick={() => setEditingTask(task)}
                                  className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                                  title="Edit Task"
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
                          <Package className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                          <p className="text-gray-500 dark:text-gray-400">No tasks found</p>
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

      {/* Task Details Modal (View Only) */}
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

      {/* Edit Task Modal */}
      <AnimatePresence>
        {editingTask && (
          <EditTaskModal
            task={editingTask}
            onClose={() => {
              setEditingTask(null);
              setWorkNotes('');
              setUploadedPhoto(null);
            }}
            onSave={(updatedTask) => {
              handleStatusUpdate(updatedTask.id, updatedTask.status);
              setEditingTask(null);
              setWorkNotes('');
              setUploadedPhoto(null);
            }}
            workNotes={workNotes}
            setWorkNotes={setWorkNotes}
            uploadedPhoto={uploadedPhoto}
            handlePhotoUpload={handlePhotoUpload}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Edit Task Modal Component
const EditTaskModal = ({
  task,
  onClose,
  onSave,
  workNotes,
  setWorkNotes,
  uploadedPhoto,
  handlePhotoUpload
}) => {
  const [editedStatus, setEditedStatus] = useState(task.status);
  const [editedNotes, setEditedNotes] = useState(workNotes);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = () => {
    onSave({
      ...task,
      status: editedStatus,
      notes: editedNotes
    });
  };

  const handleStatusChange = (newStatus) => {
    setEditedStatus(newStatus);
    setHasChanges(true);
  };

  const handleNotesChange = (value) => {
    setEditedNotes(value);
    setWorkNotes(value);
    setHasChanges(true);
  };

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
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full flex flex-col"
      >
        {/* Modal Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Edit Task - {task.id}</h2>
            <p className="text-xs text-gray-600 dark:text-gray-400">{task.customerName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-900 dark:text-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - Single Column, No Scroll */}
        <div className="p-4 space-y-3">
          {/* Status & Basic Info Row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Status Editor */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <label className="block text-xs font-bold text-gray-900 dark:text-gray-100 mb-1.5">Update Status</label>
              <select
                value={editedStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="pending">Pending</option>
                <option value="cutting">Cutting</option>
                <option value="stitching">Stitching</option>
                <option value="fitting">Fitting</option>
                <option value="ready">Ready</option>
              </select>
            </div>

            {/* Task Info */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 mb-1.5">Task Info</h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Type:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{task.items[0]?.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Deadline:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{task.deliveryDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions (if any) */}
          {task.notes && task.notes !== 'No special instructions' && (
            <div className="p-2.5 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-2">
                <FileText className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-0.5">Instructions:</p>
                  <p className="text-xs text-gray-700 dark:text-gray-300">{task.notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Work Notes Editor */}
          <div>
            <label className="block text-xs font-bold text-gray-900 dark:text-gray-100 mb-1.5">Work Notes</label>
            <textarea
              value={editedNotes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Add notes: material needed, issues found, progress updates..."
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none dark:bg-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              rows="2"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-xs font-bold text-gray-900 dark:text-gray-100 mb-1.5">Upload Work Photo</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                Choose Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
              {uploadedPhoto && (
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">✓ Photo uploaded</span>
              )}
            </div>
            {uploadedPhoto && (
              <div className="mt-2">
                <img
                  src={uploadedPhoto}
                  alt="Work preview"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                />
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges && !editedNotes.trim()}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
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
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Task Details</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{task.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-900 dark:text-gray-100"
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
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Customer Information</h3>
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
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Order Status</h3>
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
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Garment Details</h3>
            <div className="space-y-3">
              {task.items.map((item, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
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
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Customer Measurements</h3>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              {Object.keys(task.measurements).length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(task.measurements).map(([key, value]) => (
                    <div key={key}>
                      {typeof value === 'object' ? (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize mb-2">{key}:</p>
                          <div className="space-y-1 ml-2">
                            {Object.entries(value).map(([subKey, subValue]) => (
                              <p key={subKey} className="text-sm text-gray-600 dark:text-gray-400">
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
                <p className="text-sm text-gray-600 dark:text-gray-400">No measurements available</p>
              )}
            </div>
          </div>

          {/* Instructions & Notes */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Stitching Instructions</h3>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {task.notes || 'No special instructions provided'}
                </p>
              </div>
            </div>
          </div>

          {/* Material Needed */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Materials Needed</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {task.items.map((item, index) => {
                const material = inventory.find(inv => 
                  inv.name.toLowerCase().includes(item.fabric.toLowerCase())
                );
                return (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.fabric}</p>
                    {material && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
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
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Reference Images</h3>
            <div className="p-8 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-center">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
              <p className="text-sm text-gray-600 dark:text-gray-400">No reference images available</p>
            </div>
          </div>

          {/* Work Notes Section */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Add Work Notes</h3>
            <div className="space-y-3">
              <textarea
                value={workNotes}
                onChange={(e) => setWorkNotes(e.target.value)}
                placeholder="Add notes like: Need more material, Measurement mismatch, Repair required..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none dark:bg-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                rows="4"
              />
              <button
                onClick={handleAddWorkNote}
                disabled={!workNotes.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Note
              </button>
            </div>
          </div>

          {/* Upload Work Photo */}
          {task.status === 'fitting' && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Upload Work Photo</h3>
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
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">Photo uploaded!</span>
                  )}
                </div>
                {uploadedPhoto && (
                  <div className="mt-3">
                    <img
                      src={uploadedPhoto}
                      alt="Work preview"
                      className="max-w-xs rounded-lg border border-gray-300 dark:border-gray-600"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status Update Button */}
          {task.status !== 'ready' && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
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
    <span className="text-sm text-gray-600 dark:text-gray-400">{label}:</span>
    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{value}</span>
  </div>
);

// Priority Badge Component
const PriorityBadge = ({ priority }) => {
  const config = {
    high: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'High' },
    medium: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'Medium' },
    low: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Low' }
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
    pending: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-700 dark:text-gray-400', label: 'Pending', icon: Clock },
    cutting: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', label: 'Cutting', icon: Scissors },
    stitching: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'Stitching', icon: Scissors },
    fitting: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', label: 'Fitting', icon: AlertCircle },
    ready: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Ready', icon: CheckCircle }
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
