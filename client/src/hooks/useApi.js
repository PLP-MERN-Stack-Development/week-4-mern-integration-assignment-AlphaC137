import { useState, useEffect } from 'react';
import { postService, categoryService, authService } from '../services/api';
import { toast } from 'react-toastify';

// Custom hook for API calls with loading and error states
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callApi = async (apiFunction, ...args) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFunction(...args);
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Something went wrong';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, callApi, setError };
};

// Custom hook for posts
export const usePosts = () => {
  const { loading, error, callApi } = useApi();

  const getAllPosts = (page = 1, limit = 10, category = null, search = null) => {
    return callApi(postService.getAllPosts, page, limit, category, search);
  };

  const getPost = (id) => {
    return callApi(postService.getPost, id);
  };

  const createPost = (postData) => {
    return callApi(postService.createPost, postData);
  };

  const updatePost = (id, postData) => {
    return callApi(postService.updatePost, id, postData);
  };

  const deletePost = (id) => {
    return callApi(postService.deletePost, id);
  };

  const addComment = (postId, commentData) => {
    return callApi(postService.addComment, postId, commentData);
  };

  const searchPosts = (query) => {
    return callApi(postService.searchPosts, query);
  };

  return {
    loading,
    error,
    getAllPosts,
    getPost,
    createPost,
    updatePost,
    deletePost,
    addComment,
    searchPosts,
  };
};

// Custom hook for categories
export const useCategories = () => {
  const { loading, error, callApi } = useApi();

  const getAllCategories = () => {
    return callApi(categoryService.getAllCategories);
  };

  const createCategory = (categoryData) => {
    return callApi(categoryService.createCategory, categoryData);
  };

  return {
    loading,
    error,
    getAllCategories,
    createCategory,
  };
};

// Custom hook for optimistic updates
export const useOptimisticUpdate = (queryClient, queryKey) => {
  const performOptimisticUpdate = async (updateFn, optimisticData) => {
    // Cancel any outgoing refetches
    await queryClient.cancelQueries(queryKey);

    // Snapshot the previous value
    const previousData = queryClient.getQueryData(queryKey);

    // Optimistically update to the new value
    if (optimisticData) {
      queryClient.setQueryData(queryKey, optimisticData);
    }

    try {
      // Perform the actual update
      const result = await updateFn();
      return result;
    } catch (error) {
      // Rollback on error
      queryClient.setQueryData(queryKey, previousData);
      throw error;
    }
  };

  return { performOptimisticUpdate };
};

// Custom hook for form handling with validation
export const useFormWithValidation = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const setValue = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const setTouched = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const validate = () => {
    const newErrors = {};

    Object.keys(validationRules).forEach(field => {
      const value = values[field];
      const rules = validationRules[field];

      if (rules.required && (!value || value.toString().trim() === '')) {
        newErrors[field] = `${field} is required`;
        return;
      }

      if (rules.minLength && value && value.length < rules.minLength) {
        newErrors[field] = `${field} must be at least ${rules.minLength} characters`;
        return;
      }

      if (rules.maxLength && value && value.length > rules.maxLength) {
        newErrors[field] = `${field} cannot exceed ${rules.maxLength} characters`;
        return;
      }

      if (rules.pattern && value && !rules.pattern.test(value)) {
        newErrors[field] = rules.message || `${field} format is invalid`;
        return;
      }

      if (rules.custom && value) {
        const customError = rules.custom(value, values);
        if (customError) {
          newErrors[field] = customError;
          return;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    setValue,
    setTouched,
    validate,
    reset,
    isValid: Object.keys(errors).length === 0,
  };
};

// Custom hook for debounced search
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Custom hook for local storage
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  };

  return [storedValue, setValue];
};
