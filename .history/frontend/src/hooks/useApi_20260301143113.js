import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';

/**
 * Custom hook for handling API calls with loading states and error handling
 * @param {Function} apiFunction - The API function to call
 * @param {Object} options - Configuration options
 * @param {boolean} options.immediate - Whether to call the API immediately (default: false)
 * @param {boolean} options.showErrorAlert - Whether to show error alerts (default: true)
 * @param {Function} options.onSuccess - Callback for successful responses
 * @param {Function} options.onError - Callback for error responses
 * @returns {Object} API state and functions
 */
export const useApi = (apiFunction, options = {}) => {
  const {
    immediate = false,
    showErrorAlert = true,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Execute the API call
   * @param {...any} args - Arguments to pass to the API function
   * @returns {Promise<Object>} API response
   */
  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Executing API call:', apiFunction.name);
      const response = await apiFunction(...args);

      if (response.success) {
        setData(response.data || response);
        
        if (onSuccess) {
          onSuccess(response);
        }

        console.log('✅ API call successful');
        return { success: true, data: response.data || response };
      } else {
        const errorMessage = response.error || 'An error occurred';
        setError(errorMessage);

        if (showErrorAlert) {
          Alert.alert('Error', errorMessage);
        }

        if (onError) {
          onError(response);
        }

        console.error('❌ API call failed:', errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);

      if (showErrorAlert) {
        Alert.alert('Error', errorMessage);
      }

      if (onError) {
        onError(err);
      }

      console.error('❌ API call exception:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [apiFunction, showErrorAlert, onSuccess, onError]);

  /**
   * Reset the hook state
   */
  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  /**
   * Execute API call with loading state but don't update error state
   * Useful for background operations
   * @param {...any} args - Arguments to pass to the API function
   * @returns {Promise<Object>} API response
   */
  const executeSilent = useCallback(async (...args) => {
    try {
      const response = await apiFunction(...args);

      if (response.success) {
        if (onSuccess) {
          onSuccess(response);
        }
        return { success: true, data: response.data || response };
      } else {
        if (onError) {
          onError(response);
        }
        return { success: false, error: response.error };
      }
    } catch (err) {
      if (onError) {
        onError(err);
      }
      return { success: false, error: err.message };
    }
  }, [apiFunction, onSuccess, onError]);

  // Execute API call immediately if specified
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return {
    data,
    loading,
    error,
    execute,
    executeSilent,
    reset,
  };
};

/**
 * Custom hook for handling paginated API calls
 * @param {Function} apiFunction - The API function to call (should accept page parameter)
 * @param {Object} options - Configuration options
 * @returns {Object} Pagination state and functions
 */
export const usePaginatedApi = (apiFunction, options = {}) => {
  const { immediate = false, initialPage = 1, pageSize = 10 } = options;
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  /**
   * Load data for a specific page
   * @param {number} pageNumber - Page number to load
   * @param {boolean} append - Whether to append to existing data or replace
   * @returns {Promise<Object>} API response
   */
  const loadPage = useCallback(async (pageNumber = page, append = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiFunction({
        page: pageNumber,
        limit: pageSize,
      });

      if (response.success) {
        const newData = response.data?.workouts || response.data || [];
        
        if (append) {
          setData(prev => [...prev, ...newData]);
        } else {
          setData(newData);
        }

        // Update pagination info
        const pagination = response.pagination || {};
        setHasMore(pagination.hasNext !== false);
        setTotalCount(pagination.totalCount || newData.length);
        
        if (pageNumber !== page) {
          setPage(pageNumber);
        }

        console.log(`✅ Loaded page ${pageNumber} (${newData.length} items)`);
        return { success: true, data: newData };
      } else {
        const errorMessage = response.error || 'Failed to load data';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [apiFunction, page, pageSize]);

  /**
   * Load next page
   * @returns {Promise<Object>} API response
   */
  const loadNext = useCallback(async () => {
    if (!hasMore || loading) return { success: false, error: 'No more data' };
    
    return loadPage(page + 1, true);
  }, [hasMore, loading, page, loadPage]);

  /**
   * Refresh data (reload current page)
   * @returns {Promise<Object>} API response
   */
  const refresh = useCallback(async () => {
    setPage(initialPage);
    setHasMore(true);
    return loadPage(initialPage, false);
  }, [initialPage, loadPage]);

  /**
   * Reset pagination state
   */
  const reset = useCallback(() => {
    setData([]);
    setPage(initialPage);
    setHasMore(true);
    setTotalCount(0);
    setError(null);
    setLoading(false);
  }, [initialPage]);

  // Load initial page if immediate
  useEffect(() => {
    if (immediate) {
      loadPage(initialPage);
    }
  }, [immediate, initialPage, loadPage]);

  return {
    data,
    loading,
    error,
    page,
    hasMore,
    totalCount,
    loadPage,
    loadNext,
    refresh,
    reset,
  };
};

/**
 * Custom hook for handling form submissions with API calls
 * @param {Function} apiFunction - The API function to call
 * @param {Object} options - Configuration options
 * @returns {Object} Form state and functions
 */
export const useFormApi = (apiFunction, options = {}) => {
  const { onSuccess, onError, resetOnSuccess = true } = options;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  /**
   * Submit form data
   * @param {Object} formData - Form data to submit
   * @returns {Promise<Object>} API response
   */
  const submit = useCallback(async (formData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await apiFunction(formData);

      if (response.success) {
        setSuccess(true);
        
        if (onSuccess) {
          onSuccess(response);
        }

        // Reset success state after delay
        if (resetOnSuccess) {
          setTimeout(() => setSuccess(false), 3000);
        }

        console.log('✅ Form submitted successfully');
        return { success: true, data: response.data || response };
      } else {
        const errorMessage = response.error || 'Submission failed';
        setError(errorMessage);

        if (onError) {
          onError(response);
        }

        console.error('❌ Form submission failed:', errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);

      if (onError) {
        onError(err);
      }

      console.error('❌ Form submission exception:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError, resetOnSuccess]);

  /**
   * Reset form state
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  }, []);

  return {
    loading,
    error,
    success,
    submit,
    reset,
  };
};

/**
 * Custom hook for debounced API calls
 * @param {Function} apiFunction - The API function to call
 * @param {number} delay - Debounce delay in milliseconds
 * @returns {Object} Debounced API state and functions
 */
export const useDebouncedApi = (apiFunction, delay = 500) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  let timeoutId = null;

  /**
   * Execute debounced API call
   * @param {...any} args - Arguments to pass to the API function
   */
  const execute = useCallback((...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    setLoading(true);
    setError(null);

    timeoutId = setTimeout(async () => {
      try {
        const response = await apiFunction(...args);

        if (response.success) {
          setData(response.data || response);
        } else {
          setError(response.error || 'An error occurred');
        }
      } catch (err) {
        setError(err.message || 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }, delay);
  }, [apiFunction, delay]);

  /**
   * Cancel pending debounced call
   */
  const cancel = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
      setLoading(false);
    }
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    cancel();
    setData(null);
    setError(null);
    setLoading(false);
  }, [cancel]);

  return {
    data,
    loading,
    error,
    execute,
    cancel,
    reset,
  };
};

export default useApi;
