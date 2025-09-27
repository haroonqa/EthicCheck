import { api, convertApiResponse, type ScreeningRequest, type ScreeningResponse } from '../services/api';

// Mock fetch globally
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('checkHealth', () => {
    test('returns health status on success', async () => {
      const mockResponse = {
        status: 'ok',
        timestamp: '2024-01-01T00:00:00Z',
        version: '1.0.0'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await api.checkHealth();

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/health');
    });

    test('throws error on failed health check', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      } as Response);

      await expect(api.checkHealth()).rejects.toThrow('Health check failed: Internal Server Error');
    });

    test('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(api.checkHealth()).rejects.toThrow('Network error');
    });
  });

  describe('runScreening', () => {
    test('returns screening results on success', async () => {
      const mockRequest: ScreeningRequest = {
        symbols: ['AAPL', 'MSFT'],
        filters: {
          bds: { enabled: true },
          defense: false,
          shariah: false
        }
      };

      const mockResponse: ScreeningResponse = {
        requestId: 'test-123',
        asOf: '2024-01-01T00:00:00Z',
        rows: [{
          symbol: 'AAPL',
          company: 'Apple Inc.',
          statuses: {
            bds: { overall: 'pass', categories: [] },
            defense: 'pass',
            shariah: 'pass'
          },
          finalVerdict: 'PASS',
          reasons: ['Company passed all checks'],
          confidence: 'High',
          asOfRow: '2024-01-01T00:00:00Z',
          sources: [{ label: 'Test Source', url: 'https://example.com' }],
          auditId: 'audit-123'
        }],
        warnings: []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await api.runScreening(mockRequest);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/v1/screen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockRequest),
      });
    });

    test('throws error on failed screening with error message', async () => {
      const mockRequest: ScreeningRequest = {
        symbols: ['INVALID'],
        filters: {
          bds: { enabled: true },
          defense: false,
          shariah: false
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Invalid ticker symbols' }),
      } as Response);

      await expect(api.runScreening(mockRequest)).rejects.toThrow('Screening failed: Invalid ticker symbols');
    });

    test('throws error on failed screening without error message', async () => {
      const mockRequest: ScreeningRequest = {
        symbols: ['INVALID'],
        filters: {
          bds: { enabled: true },
          defense: false,
          shariah: false
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
        json: async () => ({}),
      } as Response);

      await expect(api.runScreening(mockRequest)).rejects.toThrow('Screening failed: Bad Request');
    });

    test('handles malformed JSON response', async () => {
      const mockRequest: ScreeningRequest = {
        symbols: ['AAPL'],
        filters: {
          bds: { enabled: true },
          defense: false,
          shariah: false
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
        json: async () => { throw new Error('Invalid JSON'); },
      } as Response);

      await expect(api.runScreening(mockRequest)).rejects.toThrow('Screening failed: Bad Request');
    });

    test('handles network errors', async () => {
      const mockRequest: ScreeningRequest = {
        symbols: ['AAPL'],
        filters: {
          bds: { enabled: true },
          defense: false,
          shariah: false
        }
      };

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(api.runScreening(mockRequest)).rejects.toThrow('Network error');
    });
  });

  describe('getMethodology', () => {
    test('returns methodology for valid filter', async () => {
      const mockMethodology = {
        filter: 'bds',
        description: 'BDS methodology description',
        sources: ['Source 1', 'Source 2']
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMethodology,
      } as Response);

      const result = await api.getMethodology('bds');

      expect(result).toEqual(mockMethodology);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/v1/methodology/bds');
    });

    test('throws error on failed methodology request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      } as Response);

      await expect(api.getMethodology('invalid')).rejects.toThrow('Failed to get invalid methodology: Not Found');
    });
  });

  describe('convertApiResponse', () => {
    test('converts API response to frontend format correctly', () => {
      const apiResponse: ScreeningResponse = {
        requestId: 'test-123',
        asOf: '2024-01-01T00:00:00Z',
        rows: [{
          symbol: 'AAPL',
          company: 'Apple Inc.',
          statuses: {
            bds: { 
              overall: 'pass', 
              categories: [{
                category: 'economic_exploitation',
                status: 'pass',
                evidence: ['Evidence 1']
              }]
            },
            defense: 'pass',
            shariah: 'excluded'
          },
          finalVerdict: 'PASS',
          reasons: ['Company passed all checks'],
          confidence: 'High',
          asOfRow: '2024-01-01T00:00:00Z',
          sources: [{ label: 'Test Source', url: 'https://example.com' }],
          auditId: 'audit-123'
        }],
        warnings: []
      };

      const result = convertApiResponse(apiResponse);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        ticker: 'AAPL',
        name: 'Apple Inc.',
        bds: {
          overall: 'clean',
          categories: [{
            category: 'Economic Exploitation',
            status: 'clean',
            evidence: ['Evidence 1']
          }]
        },
        defense: 'clean',
        shariah: 'block',
        verdict: 'clean',
        reasons: ['Company passed all checks'],
        sources: [{ label: 'Test Source', url: 'https://example.com' }],
        rawStatuses: apiResponse.rows[0].statuses
      });
    });

    test('handles empty API response', () => {
      const apiResponse: ScreeningResponse = {
        requestId: 'test-123',
        asOf: '2024-01-01T00:00:00Z',
        rows: [],
        warnings: []
      };

      const result = convertApiResponse(apiResponse);

      expect(result).toEqual([]);
    });

    test('handles missing optional fields', () => {
      const apiResponse: ScreeningResponse = {
        requestId: 'test-123',
        asOf: '2024-01-01T00:00:00Z',
        rows: [{
          symbol: 'AAPL',
          company: 'Apple Inc.',
          statuses: {
            bds: { overall: 'pass' },
            defense: 'pass',
            shariah: 'pass'
          },
          finalVerdict: 'PASS',
          reasons: [],
          confidence: 'High',
          asOfRow: '2024-01-01T00:00:00Z',
          sources: [],
          auditId: 'audit-123'
        }],
        warnings: []
      };

      const result = convertApiResponse(apiResponse);

      expect(result[0].bds.categories).toBeUndefined();
      expect(result[0].reasons).toEqual([]);
      expect(result[0].sources).toEqual([]);
    });

    test('handles all status conversion types', () => {
      const apiResponse: ScreeningResponse = {
        requestId: 'test-123',
        asOf: '2024-01-01T00:00:00Z',
        rows: [
          {
            symbol: 'CLEAN',
            company: 'Clean Company',
            statuses: {
              bds: { overall: 'pass' },
              defense: 'pass',
              shariah: 'pass'
            },
            finalVerdict: 'PASS',
            reasons: [],
            confidence: 'High',
            asOfRow: '2024-01-01T00:00:00Z',
            sources: [],
            auditId: 'audit-1'
          },
          {
            symbol: 'REVIEW',
            company: 'Review Company',
            statuses: {
              bds: { overall: 'review' },
              defense: 'review',
              shariah: 'review'
            },
            finalVerdict: 'REVIEW',
            reasons: [],
            confidence: 'High',
            asOfRow: '2024-01-01T00:00:00Z',
            sources: [],
            auditId: 'audit-2'
          },
          {
            symbol: 'EXCLUDED',
            company: 'Excluded Company',
            statuses: {
              bds: { overall: 'excluded' },
              defense: 'excluded',
              shariah: 'excluded'
            },
            finalVerdict: 'EXCLUDED',
            reasons: [],
            confidence: 'High',
            asOfRow: '2024-01-01T00:00:00Z',
            sources: [],
            auditId: 'audit-3'
          }
        ],
        warnings: []
      };

      const result = convertApiResponse(apiResponse);

      expect(result[0].bds.overall).toBe('clean');
      expect(result[0].defense).toBe('clean');
      expect(result[0].shariah).toBe('clean');
      expect(result[0].verdict).toBe('clean');

      expect(result[1].bds.overall).toBe('review');
      expect(result[1].defense).toBe('review');
      expect(result[1].shariah).toBe('review');
      expect(result[1].verdict).toBe('review');

      expect(result[2].bds.overall).toBe('block');
      expect(result[2].defense).toBe('block');
      expect(result[2].shariah).toBe('block');
      expect(result[2].verdict).toBe('block');
    });

    test('handles unknown BDS categories', () => {
      const apiResponse: ScreeningResponse = {
        requestId: 'test-123',
        asOf: '2024-01-01T00:00:00Z',
        rows: [{
          symbol: 'AAPL',
          company: 'Apple Inc.',
          statuses: {
            bds: { 
              overall: 'pass', 
              categories: [{
                category: 'unknown_category' as any,
                status: 'pass',
                evidence: []
              }]
            },
            defense: 'pass',
            shariah: 'pass'
          },
          finalVerdict: 'PASS',
          reasons: [],
          confidence: 'High',
          asOfRow: '2024-01-01T00:00:00Z',
          sources: [],
          auditId: 'audit-123'
        }],
        warnings: []
      };

      const result = convertApiResponse(apiResponse);

      expect(result[0].bds.categories?.[0].category).toBe('Unknown Category');
    });
  });

  describe('Environment Configuration', () => {
    test('uses default API URL when REACT_APP_API_URL is not set', () => {
      const originalEnv = process.env.REACT_APP_API_URL;
      delete process.env.REACT_APP_API_URL;

      // Re-import the module to get fresh environment
      jest.resetModules();
      const { api: freshApi } = require('../services/api');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ok' }),
      } as Response);

      freshApi.checkHealth();

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/health');

      // Restore environment
      process.env.REACT_APP_API_URL = originalEnv;
    });

    test('uses custom API URL when REACT_APP_API_URL is set', () => {
      const originalEnv = process.env.REACT_APP_API_URL;
      process.env.REACT_APP_API_URL = 'https://api.example.com';

      // Re-import the module to get fresh environment
      jest.resetModules();
      const { api: freshApi } = require('../services/api');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ok' }),
      } as Response);

      freshApi.checkHealth();

      expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/health');

      // Restore environment
      process.env.REACT_APP_API_URL = originalEnv;
    });
  });

  describe('Request Validation', () => {
    test('validates screening request structure', async () => {
      const invalidRequest = {
        symbols: 'AAPL', // Should be array
        filters: {
          bds: { enabled: true },
          defense: false,
          shariah: false
        }
      } as any;

      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Invalid request format' }),
      } as Response);

      await expect(api.runScreening(invalidRequest)).rejects.toThrow();
    });

    test('handles empty symbols array', async () => {
      const request: ScreeningRequest = {
        symbols: [],
        filters: {
          bds: { enabled: true },
          defense: false,
          shariah: false
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
        json: async () => ({ error: 'No symbols provided' }),
      } as Response);

      await expect(api.runScreening(request)).rejects.toThrow();
    });
  });

  describe('Timeout Handling', () => {
    test('handles request timeout', async () => {
      const request: ScreeningRequest = {
        symbols: ['AAPL'],
        filters: {
          bds: { enabled: true },
          defense: false,
          shariah: false
        }
      };

      // Mock a timeout
      mockFetch.mockImplementationOnce(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      );

      await expect(api.runScreening(request)).rejects.toThrow('Request timeout');
    });
  });

  describe('Response Caching', () => {
    test('does not cache responses by default', async () => {
      const request: ScreeningRequest = {
        symbols: ['AAPL'],
        filters: {
          bds: { enabled: true },
          defense: false,
          shariah: false
        }
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ requestId: 'test-123' }),
      } as Response);

      await api.runScreening(request);
      await api.runScreening(request);

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});







