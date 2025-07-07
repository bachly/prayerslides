import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthChange } from '../lib/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      setIsAdmin(!!user); // If user is logged in, they're admin
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    isAdmin,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
