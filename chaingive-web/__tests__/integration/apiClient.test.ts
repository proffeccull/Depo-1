import { apiClient, ApiError } from '../../src/services/apiClient';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('ApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('get', () => {
    it('should make a successful GET request', async () => {
      const mockResponse = {
        success: true,
        data: { message: 'Hello World' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiClient.get('/test-endpoint');

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/test-endpoint', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Note: Authorization header would be added by getAuthHeaders
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      const errorResponse = {
        message: 'Not found',
        code: 'RESOURCE_NOT_FOUND',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(errorResponse),
      });

      await expect(apiClient.get('/not-found')).rejects.toThrow(ApiError);
      await expect(apiClient.get('/not-found')).rejects.toMatchObject({
        message: 'Not found',
        status: 404,
        code: 'RESOURCE_NOT_FOUND',
      });
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(apiClient.get('/test')).rejects.toThrow('Network error');
    });
  });

  describe('post', () => {
    it('should make a successful POST request with data', async () => {
      const mockResponse = {
        success: true,
        data: { id: 123, created: true },
      };

      const requestData = { name: 'Test Item', value: 42 };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiClient.post('/items', requestData);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Authorization header would be added
        },
        body: JSON.stringify(requestData),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle POST requests without data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ success: true }),
      });

      const result = await apiClient.post('/trigger-action');

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/trigger-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Authorization header would be added
        },
        body: undefined,
      });
      expect(result).toEqual({ success: true });
    });
  });

  describe('put', () => {
    it('should make a successful PUT request', async () => {
      const updateData = { name: 'Updated Name' };
      const mockResponse = {
        success: true,
        data: { id: 123, ...updateData },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiClient.put('/items/123', updateData);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/items/123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // Authorization header would be added
        },
        body: JSON.stringify(updateData),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('patch', () => {
    it('should make a successful PATCH request', async () => {
      const patchData = { status: 'active' };
      const mockResponse = {
        success: true,
        data: { id: 123, status: 'active' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiClient.patch('/items/123', patchData);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/items/123', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // Authorization header would be added
        },
        body: JSON.stringify(patchData),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('delete', () => {
    it('should make a successful DELETE request', async () => {
      const mockResponse = {
        success: true,
        message: 'Item deleted successfully',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiClient.delete('/items/123');

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/items/123', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // Authorization header would be added
        },
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('error handling', () => {
    it('should handle non-JSON error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Headers({ 'content-type': 'text/plain' }),
        text: () => Promise.resolve('Internal Server Error'),
      });

      await expect(apiClient.get('/error')).rejects.toThrow(ApiError);
      await expect(apiClient.get('/error')).rejects.toMatchObject({
        message: 'Internal Server Error',
        status: 500,
      });
    });

    it('should handle JSON parsing errors in error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      await expect(apiClient.get('/bad-json')).rejects.toThrow(ApiError);
      await expect(apiClient.get('/bad-json')).rejects.toMatchObject({
        message: 'An error occurred',
        status: 400,
      });
    });

    it('should handle responses without content-type header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        text: () => Promise.resolve('Success'),
      });

      const result = await apiClient.get('/no-content-type');
      expect(result).toEqual({ success: true });
    });
  });

  describe('response handling', () => {
    it('should handle JSON responses', async () => {
      const mockData = { user: { id: 1, name: 'John' } };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockData),
      });

      const result = await apiClient.get('/user');
      expect(result).toEqual(mockData);
    });

    it('should handle non-JSON responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'text/plain' }),
        text: () => Promise.resolve('Operation completed'),
      });

      const result = await apiClient.get('/text-response');
      expect(result).toEqual({ success: true });
    });
  });
});