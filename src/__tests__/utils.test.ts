import { convertApiResponse, type ScreeningResponse } from '../services/api';

describe('Utility Functions', () => {
  describe('convertApiResponse', () => {
    test('converts basic API response correctly', () => {
      const apiResponse: ScreeningResponse = {
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

      const result = convertApiResponse(apiResponse);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        ticker: 'AAPL',
        name: 'Apple Inc.',
        bds: {
          overall: 'clean',
          categories: []
        },
        defense: 'clean',
        shariah: 'clean',
        verdict: 'clean',
        reasons: ['Company passed all checks'],
        sources: [{ label: 'Test Source', url: 'https://example.com' }],
        rawStatuses: apiResponse.rows[0].statuses
      });
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

      // Test clean status
      expect(result[0].bds.overall).toBe('clean');
      expect(result[0].defense).toBe('clean');
      expect(result[0].shariah).toBe('clean');
      expect(result[0].verdict).toBe('clean');

      // Test review status
      expect(result[1].bds.overall).toBe('review');
      expect(result[1].defense).toBe('review');
      expect(result[1].shariah).toBe('review');
      expect(result[1].verdict).toBe('review');

      // Test excluded status
      expect(result[2].bds.overall).toBe('block');
      expect(result[2].defense).toBe('block');
      expect(result[2].shariah).toBe('block');
      expect(result[2].verdict).toBe('block');
    });

    test('handles BDS categories correctly', () => {
      const apiResponse: ScreeningResponse = {
        requestId: 'test-123',
        asOf: '2024-01-01T00:00:00Z',
        rows: [{
          symbol: 'AAPL',
          company: 'Apple Inc.',
          statuses: {
            bds: { 
              overall: 'excluded', 
              categories: [
                {
                  category: 'economic_exploitation',
                  status: 'excluded',
                  evidence: ['Evidence 1', 'Evidence 2']
                },
                {
                  category: 'settlement_enterprise',
                  status: 'pass',
                  evidence: []
                }
              ]
            },
            defense: 'pass',
            shariah: 'pass'
          },
          finalVerdict: 'EXCLUDED',
          reasons: ['BDS violations detected'],
          confidence: 'High',
          asOfRow: '2024-01-01T00:00:00Z',
          sources: [],
          auditId: 'audit-123'
        }],
        warnings: []
      };

      const result = convertApiResponse(apiResponse);

      expect(result[0].bds.overall).toBe('block');
      expect(result[0].bds.categories).toHaveLength(2);
      expect(result[0].bds.categories?.[0]).toEqual({
        category: 'Economic Exploitation',
        status: 'block',
        evidence: ['Evidence 1', 'Evidence 2']
      });
      expect(result[0].bds.categories?.[1]).toEqual({
        category: 'Settlement Enterprise',
        status: 'clean',
        evidence: []
      });
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

    test('handles empty response', () => {
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

    test('preserves raw statuses for detailed access', () => {
      const apiResponse: ScreeningResponse = {
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
          reasons: [],
          confidence: 'High',
          asOfRow: '2024-01-01T00:00:00Z',
          sources: [],
          auditId: 'audit-123'
        }],
        warnings: []
      };

      const result = convertApiResponse(apiResponse);

      expect(result[0].rawStatuses).toEqual(apiResponse.rows[0].statuses);
    });

    test('handles malformed data gracefully', () => {
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
          reasons: null as any,
          confidence: 'High',
          asOfRow: '2024-01-01T00:00:00Z',
          sources: null as any,
          auditId: 'audit-123'
        }],
        warnings: []
      };

      const result = convertApiResponse(apiResponse);

      expect(result[0].reasons).toBeNull();
      expect(result[0].sources).toBeNull();
    });

    test('handles large datasets efficiently', () => {
      const largeRows = Array.from({ length: 1000 }, (_, i) => ({
        symbol: `TICKER${i}`,
        company: `Company ${i}`,
        statuses: {
          bds: { overall: 'pass' as const, categories: [] },
          defense: 'pass' as const,
          shariah: 'pass' as const
        },
        finalVerdict: 'PASS' as const,
        reasons: [`Reason ${i}`],
        confidence: 'High' as const,
        asOfRow: '2024-01-01T00:00:00Z',
        sources: [{ label: `Source ${i}`, url: `https://example.com/${i}` }],
        auditId: `audit-${i}`
      }));

      const apiResponse: ScreeningResponse = {
        requestId: 'test-123',
        asOf: '2024-01-01T00:00:00Z',
        rows: largeRows,
        warnings: []
      };

      const startTime = performance.now();
      const result = convertApiResponse(apiResponse);
      const endTime = performance.now();

      expect(result).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
    });
  });
});







