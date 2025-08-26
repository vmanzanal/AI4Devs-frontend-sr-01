const API_BASE_URL = 'http://localhost:3010';
const DEFAULT_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;

/**
 * Retry a request function with exponential backoff
 * @param {Function} requestFn - Function that returns a Promise
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in ms
 * @returns {Promise} The result of the successful request
 */
export const retryRequest = async (requestFn, maxRetries = MAX_RETRIES, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Don't retry client errors (4xx)
      if (error.status && error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      // Don't retry on the last attempt
      if (attempt === maxRetries - 1) {
        break;
      }
      
      // Wait with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Create a fetch request with timeout
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise} Fetch promise with timeout
 */
const fetchWithTimeout = async (url, options = {}, timeout = DEFAULT_TIMEOUT) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
};

/**
 * Fetch interview flow data for a specific position
 * @param {number} positionId - The ID of the position
 * @returns {Promise<Object>} Position data with interview flow
 */
export const getInterviewFlow = async (positionId) => {
  try {
    const response = await retryRequest(async () => {
      const res = await fetchWithTimeout(`${API_BASE_URL}/positions/${positionId}/interviewFlow`);
      
      // Handle case where fetch was rejected
      if (!res || res === undefined) {
        throw new Error('Network error');
      }
      
      if (!res.ok) {
        const error = new Error(`Failed to fetch interview flow: ${res.status} ${res.statusText}`);
        error.status = res.status;
        throw error;
      }
      
      return res;
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching interview flow:', error);
    throw error;
  }
};

/**
 * Fetch all candidates for a specific position
 * @param {number} positionId - The ID of the position
 * @returns {Promise<Array>} Array of candidates with their current stages
 */
export const getCandidatesByPosition = async (positionId) => {
  try {
    const response = await retryRequest(async () => {
      const res = await fetchWithTimeout(`${API_BASE_URL}/positions/${positionId}/candidates`);
      
      // Handle case where fetch was rejected
      if (!res || res === undefined) {
        throw new Error('Request timeout');
      }
      
      if (!res.ok) {
        const error = new Error(`Failed to fetch candidates: ${res.status} ${res.statusText}`);
        error.status = res.status;
        throw error;
      }
      
      return res;
    });
    
    const candidates = await response.json();
    return Array.isArray(candidates) ? candidates : [];
  } catch (error) {
    console.error('Error fetching candidates:', error);
    throw error;
  }
};

/**
 * Update a candidate's interview stage
 * @param {number} candidateId - The ID of the candidate
 * @param {Object} updateData - Object containing applicationId and currentInterviewStep
 * @returns {Promise<Object>} Updated application data
 */
export const updateCandidateStage = async (candidateId, updateData) => {
  try {
    const response = await retryRequest(async () => {
      const res = await fetchWithTimeout(`${API_BASE_URL}/candidates/${candidateId}/stage`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      // Handle case where fetch was rejected
      if (!res || res === undefined) {
        throw new Error('Network error');
      }
      
      if (!res.ok) {
        const error = new Error(`Failed to update candidate stage: ${res.status} ${res.statusText}`);
        error.status = res.status;
        throw error;
      }
      
      return res;
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error updating candidate stage:', error);
    throw error;
  }
};

/**
 * Debounce function to limit API calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Create a debounced version of updateCandidateStage for drag operations
 * @param {number} delay - Debounce delay in milliseconds
 * @returns {Function} Debounced update function
 */
export const createDebouncedCandidateUpdate = (delay = 300) => {
  return debounce(updateCandidateStage, delay);
};

/**
 * Optimistic update wrapper for candidate stage changes
 * @param {number} candidateId - The ID of the candidate
 * @param {Object} updateData - Object containing applicationId and currentInterviewStep
 * @param {Function} onOptimisticUpdate - Callback for immediate UI update
 * @param {Function} onSuccess - Callback for successful API update
 * @param {Function} onError - Callback for failed API update with rollback
 * @returns {Promise<Object>} Updated application data
 */
export const updateCandidateStageOptimistic = async (
  candidateId, 
  updateData, 
  onOptimisticUpdate,
  onSuccess,
  onError
) => {
  // Apply optimistic update immediately
  if (onOptimisticUpdate) {
    onOptimisticUpdate(candidateId, updateData);
  }

  try {
    const result = await updateCandidateStage(candidateId, updateData);
    
    if (onSuccess) {
      onSuccess(result);
    }
    
    return result;
  } catch (error) {
    // Rollback optimistic update
    if (onError) {
      onError(error, candidateId, updateData);
    }
    
    throw error;
  }
};
