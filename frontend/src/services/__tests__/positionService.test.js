import { 
  getInterviewFlow, 
  getCandidatesByPosition, 
  updateCandidateStage, 
  debounce,
  retryRequest,
  createDebouncedCandidateUpdate,
  updateCandidateStageOptimistic
} from '../positionService';

// Mock fetch globally
global.fetch = jest.fn();

describe('Position Service', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getInterviewFlow', () => {
    it('should fetch interview flow data successfully', async () => {
      const mockResponse = {
        positionName: 'Senior Backend Engineer',
        interviewFlow: {
          id: 1,
          description: 'Standard development interview process',
          interviewSteps: [
            { id: 1, name: 'Initial Screening', orderIndex: 1 },
            { id: 2, name: 'Technical Interview', orderIndex: 2 }
          ]
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getInterviewFlow(1);
      
      expect(fetch).toHaveBeenCalledWith('http://localhost:3010/positions/1/interviewFlow', {});
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when API request fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(getInterviewFlow(1)).rejects.toThrow('Failed to fetch interview flow: 404 Not Found');
    });

    it('should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(getInterviewFlow(1)).rejects.toThrow('Network error');
    });
  });

  describe('getCandidatesByPosition', () => {
    it('should fetch candidates data successfully', async () => {
      const mockResponse = [
        {
          id: 123,
          applicationId: 456,
          fullName: 'Jane Smith',
          currentInterviewStep: 'Technical Interview',
          currentInterviewStepId: 2,
          averageScore: 4.2
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getCandidatesByPosition(1);
      
      expect(fetch).toHaveBeenCalledWith('http://localhost:3010/positions/1/candidates', {});
      expect(result).toEqual(mockResponse);
    });

    it('should return empty array when no candidates found', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const result = await getCandidatesByPosition(1);
      expect(result).toEqual([]);
    });
  });

  describe('updateCandidateStage', () => {
    it('should update candidate stage successfully', async () => {
      const mockResponse = {
        message: 'Candidate stage updated successfully',
        data: {
          id: 456,
          positionId: 1,
          candidateId: 123,
          currentInterviewStep: 3
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await updateCandidateStage(123, { applicationId: 456, currentInterviewStep: 3 });
      
      expect(fetch).toHaveBeenCalledWith('http://localhost:3010/candidates/123/stage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ applicationId: 456, currentInterviewStep: 3 }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle validation errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });

      await expect(updateCandidateStage(123, { applicationId: 456, currentInterviewStep: 999 }))
        .rejects.toThrow('Failed to update candidate stage: 400 Bad Request');
    });

    it('should handle server errors with retry', async () => {
      // First call fails with 500
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(updateCandidateStage(123, { applicationId: 456, currentInterviewStep: 2 }))
        .rejects.toThrow('Network error');
    });
  });

  describe('Debounce Function', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should debounce function calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 300);

      // Call multiple times quickly
      debouncedFn('call1');
      debouncedFn('call2');
      debouncedFn('call3');

      // Function should not have been called yet
      expect(mockFn).not.toHaveBeenCalled();

      // Fast forward time
      jest.advanceTimersByTime(300);

      // Function should have been called once with last argument
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('call3');
    });

    it('should reset delay on subsequent calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 300);

      debouncedFn('call1');
      jest.advanceTimersByTime(200);
      
      debouncedFn('call2'); // This should reset the timer
      jest.advanceTimersByTime(200);

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('call2');
    });
  });

  describe('Retry Logic', () => {
    it('should retry failed requests', async () => {
      const mockFetch = jest.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

      global.fetch = mockFetch;

      const result = await retryRequest(() => fetch('http://test.com'), 3);
      
      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(await result.json()).toEqual({ success: true });
    });

    it('should fail after max retries', async () => {
      const mockFetch = jest.fn()
        .mockRejectedValue(new Error('Persistent network error'));

      global.fetch = mockFetch;

      await expect(retryRequest(() => fetch('http://test.com'), 2))
        .rejects.toThrow('Persistent network error');
      
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('should handle non-JSON responses gracefully', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('Invalid JSON');
        }
      });

      await expect(getInterviewFlow(1))
        .rejects.toThrow('Network error');
    });

    it('should handle timeout errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Request timeout'));

      await expect(getCandidatesByPosition(1))
        .rejects.toThrow('Request timeout');
    });

    it('should handle malformed candidate data', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => null, // Malformed response
      });

      const result = await getCandidatesByPosition(1);
      expect(result).toEqual([]); // Should default to empty array
    });
  });

  describe('Optimistic Updates', () => {
    it('should call optimistic update callback immediately', async () => {
      const optimisticCallback = jest.fn();
      const successCallback = jest.fn();
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await updateCandidateStageOptimistic(
        123, 
        { applicationId: 456, currentInterviewStep: 2 },
        optimisticCallback,
        successCallback
      );

      expect(optimisticCallback).toHaveBeenCalledWith(123, { applicationId: 456, currentInterviewStep: 2 });
      expect(successCallback).toHaveBeenCalledWith({ success: true });
    });

    it('should call error callback on API failure', async () => {
      const optimisticCallback = jest.fn();
      const errorCallback = jest.fn();
      
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(updateCandidateStageOptimistic(
        123, 
        { applicationId: 456, currentInterviewStep: 2 },
        optimisticCallback,
        null,
        errorCallback
      )).rejects.toThrow();

      expect(optimisticCallback).toHaveBeenCalled();
      expect(errorCallback).toHaveBeenCalled();
    });
  });

  describe('Debounced Update Creation', () => {
    it('should create a debounced function', () => {
      const debouncedUpdate = createDebouncedCandidateUpdate(500);
      expect(typeof debouncedUpdate).toBe('function');
    });
  });
});
