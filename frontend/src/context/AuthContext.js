import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authApi from '../api/authApi';
import { authErrorEmitter } from '../api/axiosInstance';
import { Alert } from 'react-native';

// Auth Context Type Definitions
const AuthContext = createContext();

// Initial State
const initialState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

// Action Types
const AUTH_ACTIONS = {
  AUTH_START: 'AUTH_START',
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  AUTH_FAILURE: 'AUTH_FAILURE',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER',
};

// Auth Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.AUTH_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.AUTH_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.AUTH_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload.user },
      };

    default:
      return state;
  }
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing auth session on app start
  useEffect(() => {
    checkAuthSession();
  }, []);
  // Listen for 401 unauthorized errors from axiosInstance
  useEffect(() => {
    const unsubscribe = authErrorEmitter.on401(() => {
      console.log('🔒 401 Unauthorized detected, logging out user');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    });

    return () => unsubscribe();
  }, []);


  /**
   * Check authentication session from AsyncStorage
   */
  const checkAuthSession = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.AUTH_START });

      const token = await authApi.getStoredToken();
      const user = await authApi.getStoredUser();

      if (token && user) {
        // Verify token is still valid by fetching fresh user data
        const profileResult = await authApi.getProfile();
        
        if (profileResult.success) {
          dispatch({
            type: AUTH_ACTIONS.AUTH_SUCCESS,
            payload: {
              user: profileResult.user,
              token,
            },
          });
        } else {
          // Token is invalid, clear storage
          await clearAuthData();
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    } catch (error) {
      console.error('❌ Check auth session error:', error);
      await clearAuthData();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration result
   */
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.AUTH_START });
      console.log('🔍 Frontend register data:', userData);

      const result = await authApi.register(userData);

      if (result.success) {
        dispatch({
          type: AUTH_ACTIONS.AUTH_SUCCESS,
          payload: {
            user: result.user,
            token: result.token,
          },
        });

        return { success: true, user: result.user };
      } else {
        console.log('❌ Register failed:', result);
        dispatch({
          type: AUTH_ACTIONS.AUTH_FAILURE,
          payload: { error: result.message || 'Registration failed' },
        });

        return { 
          success: false, 
          error: result.message || 'Registration failed', 
          errors: result.errors || []
        };
      }
    } catch (error) {
      console.error('❌ Register error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      
      dispatch({
        type: AUTH_ACTIONS.AUTH_FAILURE,
        payload: { error: errorMessage },
      });

      return { 
        success: false, 
        error: errorMessage,
        errors: error.response?.data?.errors || []
      };
    }
  };

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @returns {Promise<Object>} Login result
   */
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.AUTH_START });
      console.log('🔍 Frontend login credentials:', credentials.email);

      const result = await authApi.login(credentials);

      if (result.success) {
        dispatch({
          type: AUTH_ACTIONS.AUTH_SUCCESS,
          payload: {
            user: result.user,
            token: result.token,
          },
        });

        return { success: true, user: result.user };
      } else {
        console.log('❌ Login failed:', result);
        dispatch({
          type: AUTH_ACTIONS.AUTH_FAILURE,
          payload: { error: result.message || 'Login failed' },
        });

        return { 
          success: false, 
          error: result.message || 'Login failed', 
          errors: result.errors || []
        };
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      
      dispatch({
        type: AUTH_ACTIONS.AUTH_FAILURE,
        payload: { error: errorMessage },
      });

      return { 
        success: false, 
        error: errorMessage,
        errors: error.response?.data?.errors || []
      };
    }
  };

  /**
   * Logout user
   * @returns {Promise<Object>} Logout result
   */
  const logout = async () => {
    try {
      await authApi.logout();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      
      return { success: true };
    } catch (error) {
      console.error('❌ Logout error:', error);
      
      // Even if server logout fails, clear local state
      await clearAuthData();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      
      return { success: true };
    }
  };

  /**
   * Update user profile
   * @param {Object} updateData - Profile update data
   * @returns {Promise<Object>} Update result
   */
  const updateProfile = async (updateData) => {
    try {
      const result = await authApi.updateProfile(updateData);

      if (result.success) {
        dispatch({
          type: AUTH_ACTIONS.UPDATE_USER,
          payload: { user: result.user },
        });

        return { success: true, user: result.user };
      } else {
        return { success: false, error: result.error, errors: result.errors };
      }
    } catch (error) {
      console.error('❌ Update profile error:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  };

  /**
   * Change user password
   * @param {Object} passwordData - Password change data
   * @returns {Promise<Object>} Password change result
   */
  const changePassword = async (passwordData) => {
    try {
      const result = await authApi.changePassword(passwordData);

      if (result.success) {
        return { success: true };
      } else {
        return { success: false, error: result.error, errors: result.errors };
      }
    } catch (error) {
      console.error('❌ Change password error:', error);
      return { success: false, error: 'Failed to change password' };
    }
  };

  /**
   * Delete user account
   * @returns {Promise<Object>} Deletion result
   */
  const deleteAccount = async () => {
    return new Promise((resolve) => {
      Alert.alert(
        'Delete Account',
        'Are you sure you want to delete your account? This action cannot be undone.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve({ success: false, error: 'Account deletion cancelled' }),
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                const result = await authApi.deleteAccount();

                if (result.success) {
                  dispatch({ type: AUTH_ACTIONS.LOGOUT });
                  resolve({ success: true });
                } else {
                  resolve({ success: false, error: result.error });
                }
              } catch (error) {
                console.error('❌ Delete account error:', error);
                resolve({ success: false, error: 'Failed to delete account' });
              }
            },
          },
        ]
      );
    });
  };

  /**
   * Clear authentication data from AsyncStorage
   */
  const clearAuthData = async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'user', 'authToken', 'userData']);
    } catch (error) {
      console.error('❌ Clear auth data error:', error);
    }
  };

  /**
   * Clear error state
   */
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  /**
   * Refresh user data
   * @returns {Promise<Object>} Refresh result
   */
  const refreshUserData = async () => {
    try {
      const result = await authApi.getProfile();

      if (result.success) {
        dispatch({
          type: AUTH_ACTIONS.UPDATE_USER,
          payload: { user: result.user },
        });

        return { success: true, user: result.user };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Refresh user data error:', error);
      return { success: false, error: 'Failed to refresh user data' };
    }
  };

  // Context value
  const value = {
    // State
    user: state.user,
    token: state.token,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    error: state.error,

    // Actions
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    deleteAccount,
    clearError,
    refreshUserData,
    checkAuthSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

// Higher-order component to protect routes
export const withAuth = (Component) => {
  return (props) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      // You can return a loading screen here
      return null;
    }

    if (!isAuthenticated) {
      // You can navigate to login screen here
      // This would typically be handled by the navigation system
      return null;
    }

    return <Component {...props} />;
  };
};

export default AuthContext;
