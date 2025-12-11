import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { motion } from 'framer-motion';

const PlaceholderPage = ({ role, title, description, icon: Icon }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              <p className="text-gray-600 mt-2">{description}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              {Icon && (
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon className="w-10 h-10 text-orange-600" />
                </div>
              )}
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                This feature is under development. Check back soon for updates!
              </p>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default PlaceholderPage;
