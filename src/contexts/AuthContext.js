// import React, { createContext, useState, useContext, useEffect } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import apiService from '../services/apiService';

// const AuthContext = createContext();

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [token, setToken] = useState(null);

//   // Check if user is already logged in
//   useEffect(() => {
//     checkAuthState();
//   }, []);

//   const checkAuthState = async () => {
//     try {
//       const storedToken = await AsyncStorage.getItem('auth_token');
//       const storedUser = await AsyncStorage.getItem('user_data');

//       if (storedToken && storedUser) {
//         setToken(storedToken);
//         setUser(JSON.parse(storedUser));
//       }
//     } catch (error) {
//       console.error('Error checking auth state:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const login = async (credentials) => {
//     try {
//       setLoading(true);
//       const response = await apiService.login(credentials);
      
//       if (response.success) {
//         const { user: userData, token: userToken } = response.data;
        
//         // Store token and user data
//         await AsyncStorage.setItem('auth_token', userToken);
//         await AsyncStorage.setItem('user_data', JSON.stringify(userData));
        
//         setToken(userToken);
//         setUser(userData);
        
//         return { success: true, data: response.data };
//       } else {
//         return { success: false, message: response.message };
//       }
//     } catch (error) {
//       console.error('Login error:', error);
//       const message = error.response?.data?.message || 'Login failed. Please try again.';
//       return { success: false, message };
//     } finally {
//       setLoading(false);
//     }
//   };

//   const register = async (userData) => {
//     try {
//       setLoading(true);
//       const response = await apiService.register(userData);
      
//       if (response.success) {
//         const { user: newUser, token: userToken } = response.data;
        
//         // Store token and user data
//         await AsyncStorage.setItem('auth_token', userToken);
//         await AsyncStorage.setItem('user_data', JSON.stringify(newUser));
        
//         setToken(userToken);
//         setUser(newUser);
        
//         return { success: true, data: response.data };
//       } else {
//         return { success: false, message: response.message, errors: response.errors };
//       }
//     } catch (error) {
//       console.error('Registration error:', error);
//       const message = error.response?.data?.message || 'Registration failed. Please try again.';
//       const errors = error.response?.data?.errors || null;
//       return { success: false, message, errors };
//     } finally {
//       setLoading(false);
//     }
//   };

//   const logout = async () => {
//     try {
//       await apiService.logout();
//     } catch (error) {
//       console.error('Logout API error:', error);
//     } finally {
//       // Clear local storage regardless of API response
//       await AsyncStorage.removeItem('auth_token');
//       await AsyncStorage.removeItem('user_data');
//       setToken(null);
//       setUser(null);
//     }
//   };

//   const forgotPassword = async (email) => {
//     try {
//       setLoading(true);
//       const response = await apiService.forgotPassword(email);
//       return { success: response.success, message: response.message };
//     } catch (error) {
//       console.error('Forgot password error:', error);
//       const message = error.response?.data?.message || 'Failed to send reset email.';
//       return { success: false, message };
//     } finally {
//       setLoading(false);
//     }
//   };

//   const value = {
//     user,
//     token,
//     loading,
//     login,
//     register,
//     logout,
//     forgotPassword,
//     isAuthenticated: !!user,
//     isReader: user?.role === 'reader',
//     isWriter: user?.role === 'writer',
//     isAdmin: user?.role === 'admin',
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/apiService';

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
  const [token, setToken] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('auth_token');
      const storedUser = await AsyncStorage.getItem('user_data');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await apiService.login(credentials);
      
      if (response.success) {
        const { user, token } = response.data.data;
        // console.log('Login successful:', user, token);
        // console.log('Login response data:', response.data);
        // Store token and user data
        await AsyncStorage.setItem('auth_token', token);
        await AsyncStorage.setItem('user_data', JSON.stringify(user));
        
        setToken(token);
        setUser(user);
        
        
        return { success: true, data: response.data.data };
      } else {
        // console.log(response.error.message);    
        return { success: false, message: response.error.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.error?.message || 'Login failed. Please try again.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await apiService.register(userData);
      // console.log(response);
      if (response.success) {
        const { user, token } = response.data.data;
        // console.log(response.data);
        // Store token and user data
        await AsyncStorage.setItem('auth_token', token);
        await AsyncStorage.setItem('user_data', JSON.stringify(user));
        
        setToken(token);
        setUser(user);
        
        return { success: true, data: response.data.data };
      } else {
        return { success: false, message: response.error.message, errors: response.error.message};
      }
    } catch (error) {
      // console.error('Registration error:', error);
      console.log(error);
      const message = error.response?.message || 'Registration failed. Please try again.';
      const errors = error.response?.error?.message|| null;
      return { success: false, message, errors };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear local storage regardless of API response
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
      setToken(null);
      setUser(null);
    }
  };

 const forgotPassword = async (email) => {
  try {
    setLoading(true);
    const response = await apiService.forgotPassword(email);
    return { success: response.success, message: response.message };
  } catch (error) {
    console.error('Forgot password error:', error);

    // Check if error.response exists and contains error details
    const backendErrors = error?.response?.data?.errors;
    let message = 'Failed to send reset email.';

    if (backendErrors?.email && Array.isArray(backendErrors.email)) {
      message = backendErrors.email[0]; // Grab first email error
    } else if (error?.response?.data?.message) {
      message = error.response.data.message;
    }

    return { success: false, message };
  } finally {
    setLoading(false);
  }
};


  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    isAuthenticated: !!user,
    isReader: user?.role === 'reader',
    isWriter: user?.role === 'writer',
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
