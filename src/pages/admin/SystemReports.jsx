import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion } from 'framer-motion';
import usePageTitle from '../../hooks/usePageTitle';
import {
  FileText,
  Download,
  Calendar,
  Store,
  Users,
  Package,
  TrendingUp,
  Filter
} from 'lucide-react';
import { useState } from 'react';

const SystemReports = () => {
  usePageTitle('System Reports');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('thisMonth');
  const [downloadingReport, setDownloadingReport] = useState(null);

  // Mock report data
  const reports = [
    {
      id: 1,
      title: 'Shops Report',
      description: 'Complete list of all registered shops with their details and status',
      icon: Store,
      color: 'blue',
      records: 45,
      lastGenerated: '2024-12-20',
      formats: ['PDF', 'CSV']
    },
    {
      id: 2,
      title: 'Owners Report',
      description: 'Detailed information about all shop owners and their accounts',
      icon: Users,
      color: 'purple',
      records: 45,
      lastGenerated: '2024-12-20',
      formats: ['PDF', 'CSV']
    },
    {
      id: 3,
      title: 'Workers Report',
      description: 'Comprehensive data on all registered workers across all shops',
      icon: Users,
      color: 'green',
      records: 234,
      lastGenerated: '2024-12-20',
      formats: ['PDF', 'CSV']
    },
    {
      id: 4,
      title: 'Orders Summary Report',
      description: 'Complete order history with status, dates, and shop information',
      icon: Package,
      color: 'orange',
      records: 3456,
      lastGenerated: '2024-12-20',
      formats: ['PDF', 'CSV']
    }
  ];

  const dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'last3Months', label: 'Last 3 Months' },
    { value: 'thisYear', label: 'This Year' },
    { value: 'allTime', label: 'All Time' }
  ];

  const handleDownload = (reportTitle, format) => {
    setDownloadingReport(`${reportTitle}-${format}`);
    
    // Simulate download
    setTimeout(() => {
      setDownloadingReport(null);
      // Show success message (in real app, this would trigger actual download)
      alert(`${reportTitle} downloaded as ${format} successfully!`);
    }, 1500);
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        icon: 'text-blue-600 dark:text-blue-400',
        button: 'bg-blue-600 hover:bg-blue-700'
      },
      purple: {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        icon: 'text-purple-600 dark:text-purple-400',
        button: 'bg-purple-600 hover:bg-purple-700'
      },
      green: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        icon: 'text-green-600 dark:text-green-400',
        button: 'bg-green-600 hover:bg-green-700'
      },
      orange: {
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        icon: 'text-orange-600 dark:text-orange-400',
        button: 'bg-orange-600 hover:bg-orange-700'
      }
    };
    return colors[color];
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">System Reports</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Generate and download platform reports</p>
                </div>
              </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Date Range:</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {dateRanges.map((range) => (
                    <button
                      key={range.value}
                      onClick={() => setSelectedDateRange(range.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedDateRange === range.value
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {reports.map((report) => {
                const colors = getColorClasses(report.color);
                const Icon = report.icon;

                return (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: report.id * 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    {/* Report Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`p-3 ${colors.bg} rounded-lg`}>
                        <Icon className={`w-6 h-6 ${colors.icon}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                          {report.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {report.description}
                        </p>
                      </div>
                    </div>

                    {/* Report Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Records</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {report.records.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Generated</p>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {new Date(report.lastGenerated).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Download Buttons */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Download as:
                      </p>
                      <div className="flex gap-2">
                        {report.formats.map((format) => {
                          const isDownloading = downloadingReport === `${report.title}-${format}`;
                          
                          return (
                            <button
                              key={format}
                              onClick={() => handleDownload(report.title, format)}
                              disabled={isDownloading}
                              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 ${colors.button} text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
                              {isDownloading ? 'Downloading...' : `Download ${format}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Info Section */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                    Report Information
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-400">
                    Reports are generated based on the selected date range. PDF format includes detailed formatting and charts, 
                    while CSV format is suitable for data analysis in spreadsheet applications. All reports include real-time 
                    data from the platform.
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

export default SystemReports;
