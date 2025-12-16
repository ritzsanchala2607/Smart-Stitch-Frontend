import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    // Store user data and token from backend response
    const normalizedUser = {
      ...userData,
      role: userData.role.toLowerCase(),
    };
    
    setUser(normalizedUser);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    if (token) {
      localStorage.setItem('token', token);
    }
    return normalizedUser;
  };

  const signup = (fullName, email, password, role) => {
    // Dummy signup logic
    const userData = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      role,
      name: fullName,
    };
    
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
