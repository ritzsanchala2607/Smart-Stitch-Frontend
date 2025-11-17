import React from 'react';
import { useState } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';

/**
 * Main App Component
 * Manages navigation between Login and Signup pages
 * 
 * Backend Integration Notes:
 * - Replace state management with Redux/Context API for production
 * - Add route handling with React Router
 * - Connect form submissions to backend API endpoints
 */
function App() {
  const [currentPage, setCurrentPage] = useState('login'); // 'login' or 'signup'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Animated background pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-5">
          <svg
            className="w-full h-full"
            viewBox="0 0 1200 800"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <pattern id="fabric-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="40" height="40" fill="none" stroke="#1B2A41" strokeWidth="0.5" />
                <circle cx="10" cy="10" r="2" fill="#CBA135" opacity="0.3" />
                <circle cx="30" cy="30" r="2" fill="#CBA135" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="1200" height="800" fill="url(#fabric-pattern)" />
          </svg>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {currentPage === 'login' ? (
          <Login onSwitchToSignup={() => setCurrentPage('signup')} />
        ) : (
          <Signup onSwitchToLogin={() => setCurrentPage('login')} />
        )}
      </div>
    </div>
  );
}

export default App;
