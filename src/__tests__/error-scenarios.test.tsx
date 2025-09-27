import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EthicCheckLanding from '../components/EthicCheckLanding';
import { api } from '../services/api';

// Mock the API module
jest.mock('../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('Error Scenarios and Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('Network and API Errors', () => {
    test('handles complete backend failure', async () => {
      const user = userEvent.setup();
      
      // Mock complete backend failure
      mockedApi.checkHealth.mockRejectedValue(new Error('ECONNREFUSED'));
      mockedApi.runScreening.mockRejectedValue(new Error('ECONNREFUSED'));

      render(<EthicCheckLanding />);
      
      await waitFor(() => {
        expect(screen.getByText('Disconnected')).toBeInTheDocument();
      });
      
      const tickerInput = screen.getByPlaceholderText(/e.g., AAPL, MSFT, VOO/);
      await user.type(tickerInput, 'AAPL');
      
      const runButton = screen.getByRole('button', { name: /Run Ethical Check/i });
      await user.click(runButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Screening failed/)).toBeInTheDocument();
      });
    });

    test('handles malformed API responses', async () => {
      const user = userEvent.setup();
      
      mockedApi.checkHealth.mockResolvedValue({
        status: 'ok',
        timestamp: '2024-01-01T00:00:00Z',
        version: '1.0.0'
      });
      
      // Mock malformed response
      mockedApi.runScreening.mockResolvedValue({
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
          reasons: null, // Malformed
          confidence: 'High',
          asOfRow: '2024-01-01T00:00:00Z',
          sources: null, // Malformed
          auditId: 'audit-123'
        }],
        warnings: []
      } as any);

      render(<EthicCheckLanding />);
      
      const tickerInput = screen.getByPlaceholderText(/e.g., AAPL, MSFT, VOO/);
      await user.type(tickerInput, 'AAPL');
      
      const runButton = screen.getByRole('button', { name: /Run Ethical Check/i });
      await user.click(runButton);
      
      await waitFor(() => {
        expect(screen.getByText('AAPL')).toBeInTheDocument();
      });
    });

    test('handles timeout errors', async () => {
      const user = userEvent.setup();
      
      mockedApi.checkHealth.mockResolvedValue({
        status: 'ok',
        timestamp: '2024-01-01T00:00:00Z',
        version: '1.0.0'
      });
      
      // Mock timeout
      mockedApi.runScreening.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      );

      render(<EthicCheckLanding />);
      
      const tickerInput = screen.getByPlaceholderText(/e.g., AAPL, MSFT, VOO/);
      await user.type(tickerInput, 'AAPL');
      
      const runButton = screen.getByRole('button', { name: /Run Ethical Check/i });
      await user.click(runButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Screening failed/)).toBeInTheDocument();
      });
    });

    test('handles 500 server errors', async () => {
      const user = userEvent.setup();
      
      mockedApi.checkHealth.mockResolvedValue({
        status: 'ok',
        timestamp: '2024-01-01T00:00:00Z',
        version: '1.0.0'
      });
      
      mockedApi.runScreening.mockRejectedValue(new Error('Screening failed: Internal Server Error'));

      render(<EthicCheckLanding />);
      
      const tickerInput = screen.getByPlaceholderText(/e.g., AAPL, MSFT, VOO/);
      await user.type(tickerInput, 'AAPL');
      
      const runButton = screen.getByRole('button', { name: /Run Ethical Check/i });
      await user.click(runButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Screening failed/)).toBeInTheDocument();
      });
    });
  });

  describe('Input Validation Errors', () => {
    test('handles empty ticker input', async () => {
      const user = userEvent.setup();
      
      render(<EthicCheckLanding />);
      
      const runButton = screen.getByRole('button', { name: /Run Ethical Check/i });
      await user.click(runButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter some ticker symbols first!')).toBeInTheDocument();
      });
    });

    test('handles whitespace-only input', async () => {
      const user = userEvent.setup();
      
      render(<EthicCheckLanding />);
      
      const tickerInput = screen.getByPlaceholderText(/e.g., AAPL, MSFT, VOO/);
      await user.type(tickerInput, '   \n  \t  ');
      
      const runButton = screen.getByRole('button', { name: /Run Ethical Check/i });
      await user.click(runButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter valid ticker symbols!')).toBeInTheDocument();
      });
    });

    test('handles invalid email formats', async () => {
      const user = userEvent.setup();
      
      render(<EthicCheckLanding />);
      
      const emailInput = screen.getByPlaceholderText('Enter your email');
      await user.type(emailInput, 'invalid-email');
      
      const submitButton = screen.getByText('Join Waitlist');
      expect(submitButton).toBeDisabled();
    });

    test('handles extremely long ticker input', async () => {
      const user = userEvent.setup();
      
      mockedApi.checkHealth.mockResolvedValue({
        status: 'ok',
        timestamp: '2024-01-01T00:00:00Z',
        version: '1.0.0'
      });
      
      mockedApi.runScreening.mockResolvedValue({
        requestId: 'test-123',
        asOf: '2024-01-01T00:00:00Z',
        rows: [],
        warnings: []
      });

      render(<EthicCheckLanding />);
      
      const tickerInput = screen.getByPlaceholderText(/e.g., AAPL, MSFT, VOO/);
      const veryLongInput = 'A'.repeat(10000);
      await user.type(tickerInput, veryLongInput);
      
      const runButton = screen.getByRole('button', { name: /Run Ethical Check/i });
      await user.click(runButton);
      
      // Should still work, just with many tickers
      await waitFor(() => {
        expect(mockedApi.runScreening).toHaveBeenCalled();
      });
    });
  });

  describe('State Management Errors', () => {
    test('handles rapid state changes', async () => {
      const user = userEvent.setup();
      
      mockedApi.checkHealth.mockResolvedValue({
        status: 'ok',
        timestamp: '2024-01-01T00:00:00Z',
        version: '1.0.0'
      });
      
      mockedApi.runScreening.mockResolvedValue({
        requestId: 'test-123',
        asOf: '2024-01-01T00:00:00Z',
        rows: [],
        warnings: []
      });

      render(<EthicCheckLanding />);
      
      const tickerInput = screen.getByPlaceholderText(/e.g., AAPL, MSFT, VOO/);
      const runButton = screen.getByRole('button', { name: /Run Ethical Check/i });
      
      // Rapidly change input and click
      await user.type(tickerInput, 'AAPL');
      await user.click(runButton);
      await user.clear(tickerInput);
      await user.type(tickerInput, 'MSFT');
      await user.click(runButton);
      await user.clear(tickerInput);
      await user.type(tickerInput, 'GOOGL');
      await user.click(runButton);
      
      // Should handle gracefully
      await waitFor(() => {
        expect(mockedApi.runScreening).toHaveBeenCalledTimes(3);
      });
    });

    test('handles filter toggle during loading', async () => {
      const user = userEvent.setup();
      
      mockedApi.checkHealth.mockResolvedValue({
        status: 'ok',
        timestamp: '2024-01-01T00:00:00Z',
        version: '1.0.0'
      });
      
      // Mock delayed response
      mockedApi.runScreening.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            requestId: 'test-123',
            asOf: '2024-01-01T00:00:00Z',
            rows: [],
            warnings: []
          }), 1000)
        )
      );

      render(<EthicCheckLanding />);
      
      const tickerInput = screen.getByPlaceholderText(/e.g., AAPL, MSFT, VOO/);
      await user.type(tickerInput, 'AAPL');
      
      const runButton = screen.getByRole('button', { name: /Run Ethical Check/i });
      await user.click(runButton);
      
      // Toggle filters while loading
      const defenseToggle = screen.getByLabelText('Toggle Defense Contractors');
      await user.click(defenseToggle);
      
      // Should not cause errors
      await waitFor(() => {
        expect(screen.getByText('Running Check...')).toBeInTheDocument();
      });
    });
  });

  describe('Memory and Performance Edge Cases', () => {
    test('handles very large result sets', async () => {
      const user = userEvent.setup();
      
      mockedApi.checkHealth.mockResolvedValue({
        status: 'ok',
        timestamp: '2024-01-01T00:00:00Z',
        version: '1.0.0'
      });
      
      // Generate large result set
      const largeResults = Array.from({ length: 1000 }, (_, i) => ({
        symbol: `TICKER${i}`,
        company: `Company ${i}`,
        statuses: {
          bds: { overall: 'pass', categories: [] },
          defense: 'pass',
          shariah: 'pass'
        },
        finalVerdict: 'PASS',
        reasons: [`Reason ${i}`],
        confidence: 'High',
        asOfRow: '2024-01-01T00:00:00Z',
        sources: [{ label: `Source ${i}`, url: `https://example.com/${i}` }],
        auditId: `audit-${i}`
      }));
      
      mockedApi.runScreening.mockResolvedValue({
        requestId: 'test-123',
        asOf: '2024-01-01T00:00:00Z',
        rows: largeResults,
        warnings: []
      });

      render(<EthicCheckLanding />);
      
      const tickerInput = screen.getByPlaceholderText(/e.g., AAPL, MSFT, VOO/);
      await user.type(tickerInput, 'TICKER0');
      
      const runButton = screen.getByRole('button', { name: /Run Ethical Check/i });
      await user.click(runButton);
      
      await waitFor(() => {
        expect(screen.getByText('TICKER0')).toBeInTheDocument();
        expect(screen.getByText('TICKER999')).toBeInTheDocument();
      });
    });

    test('handles rapid evidence expansion/collapse', async () => {
      const user = userEvent.setup();
      
      mockedApi.checkHealth.mockResolvedValue({
        status: 'ok',
        timestamp: '2024-01-01T00:00:00Z',
        version: '1.0.0'
      });
      
      mockedApi.runScreening.mockResolvedValue({
        requestId: 'test-123',
        asOf: '2024-01-01T00:00:00Z',
        rows: [{
          symbol: 'AAPL',
          company: 'Apple Inc.',
          statuses: {
            bds: { 
              overall: 'excluded', 
              categories: [{
                category: 'economic_exploitation',
                status: 'excluded',
                evidence: Array.from({ length: 100 }, (_, i) => `Evidence ${i}`)
              }]
            },
            defense: 'pass',
            shariah: 'pass'
          },
          finalVerdict: 'EXCLUDED',
          reasons: Array.from({ length: 50 }, (_, i) => `Reason ${i}`),
          confidence: 'High',
          asOfRow: '2024-01-01T00:00:00Z',
          sources: [{ label: 'Test Source', url: 'https://example.com' }],
          auditId: 'audit-123'
        }],
        warnings: []
      });

      render(<EthicCheckLanding />);
      
      const tickerInput = screen.getByPlaceholderText(/e.g., AAPL, MSFT, VOO/);
      await user.type(tickerInput, 'AAPL');
      
      const runButton = screen.getByRole('button', { name: /Run Ethical Check/i });
      await user.click(runButton);
      
      await waitFor(() => {
        expect(screen.getByText('[150 items]')).toBeInTheDocument();
      });
      
      const evidenceButton = screen.getByText('[150 items]');
      
      // Rapidly expand/collapse
      for (let i = 0; i < 10; i++) {
        await user.click(evidenceButton);
        await user.click(evidenceButton);
      }
      
      // Should not cause memory leaks or errors
      expect(screen.getByText('[150 items]')).toBeInTheDocument();
    });
  });

  describe('Browser Compatibility Issues', () => {
    test('handles missing fetch API gracefully', () => {
      const originalFetch = global.fetch;
      // @ts-ignore
      delete global.fetch;

      // Should not crash the app
      expect(() => render(<EthicCheckLanding />)).not.toThrow();
      
      // Restore fetch
      global.fetch = originalFetch;
    });

    test('handles localStorage errors', () => {
      const originalLocalStorage = window.localStorage;
      // @ts-ignore
      delete window.localStorage;

      // Should not crash the app
      expect(() => render(<EthicCheckLanding />)).not.toThrow();
      
      // Restore localStorage
      window.localStorage = originalLocalStorage;
    });

    test('handles window resize during operations', async () => {
      const user = userEvent.setup();
      
      mockedApi.checkHealth.mockResolvedValue({
        status: 'ok',
        timestamp: '2024-01-01T00:00:00Z',
        version: '1.0.0'
      });
      
      mockedApi.runScreening.mockResolvedValue({
        requestId: 'test-123',
        asOf: '2024-01-01T00:00:00Z',
        rows: [],
        warnings: []
      });

      render(<EthicCheckLanding />);
      
      const tickerInput = screen.getByPlaceholderText(/e.g., AAPL, MSFT, VOO/);
      await user.type(tickerInput, 'AAPL');
      
      const runButton = screen.getByRole('button', { name: /Run Ethical Check/i });
      await user.click(runButton);
      
      // Simulate window resize
      window.dispatchEvent(new Event('resize'));
      
      // Should not cause errors
      await waitFor(() => {
        expect(mockedApi.runScreening).toHaveBeenCalled();
      });
    });
  });

  describe('Data Corruption Scenarios', () => {
    test('handles corrupted API response data', async () => {
      const user = userEvent.setup();
      
      mockedApi.checkHealth.mockResolvedValue({
        status: 'ok',
        timestamp: '2024-01-01T00:00:00Z',
        version: '1.0.0'
      });
      
      // Mock corrupted response
      mockedApi.runScreening.mockResolvedValue({
        requestId: 'test-123',
        asOf: '2024-01-01T00:00:00Z',
        rows: [{
          symbol: null, // Corrupted
          company: undefined, // Corrupted
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
      } as any);

      render(<EthicCheckLanding />);
      
      const tickerInput = screen.getByPlaceholderText(/e.g., AAPL, MSFT, VOO/);
      await user.type(tickerInput, 'AAPL');
      
      const runButton = screen.getByRole('button', { name: /Run Ethical Check/i });
      await user.click(runButton);
      
      // Should handle gracefully without crashing
      await waitFor(() => {
        expect(screen.getByText('Results preview')).toBeInTheDocument();
      });
    });

    test('handles circular reference in API response', async () => {
      const user = userEvent.setup();
      
      mockedApi.checkHealth.mockResolvedValue({
        status: 'ok',
        timestamp: '2024-01-01T00:00:00Z',
        version: '1.0.0'
      });
      
      // Create circular reference
      const circularData: any = {
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
      };
      circularData.self = circularData; // Create circular reference
      
      mockedApi.runScreening.mockResolvedValue({
        requestId: 'test-123',
        asOf: '2024-01-01T00:00:00Z',
        rows: [circularData],
        warnings: []
      });

      render(<EthicCheckLanding />);
      
      const tickerInput = screen.getByPlaceholderText(/e.g., AAPL, MSFT, VOO/);
      await user.type(tickerInput, 'AAPL');
      
      const runButton = screen.getByRole('button', { name: /Run Ethical Check/i });
      await user.click(runButton);
      
      // Should handle gracefully
      await waitFor(() => {
        expect(screen.getByText('AAPL')).toBeInTheDocument();
      });
    });
  });
});
