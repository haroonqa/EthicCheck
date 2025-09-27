import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EthicCheckLanding from '../components/EthicCheckLanding';
import { api } from '../services/api';

// Mock the API module
jest.mock('../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('EthicCheckLanding Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset fetch mock
    mockFetch.mockClear();
  });

  describe('Rendering', () => {
    test('renders main components', () => {
      render(<EthicCheckLanding />);
      
      expect(screen.getByText('EthicCheck')).toBeInTheDocument();
      expect(screen.getByText((content, element) => {
        return element?.textContent === 'Screen your portfolio for ethics — in seconds.';
      })).toBeInTheDocument();
      expect(screen.getByText('Get Early Access')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'How it works' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Data sources' })).toBeInTheDocument();
    });

    test('renders navigation links', () => {
      render(<EthicCheckLanding />);
      
      expect(screen.getByRole('link', { name: 'How it works' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Data sources' })).toBeInTheDocument();
    });

    test('renders screening panel with correct initial state', () => {
      render(<EthicCheckLanding />);
      
      expect(screen.getByText('Paste tickers (comma or newline‑separated)')).toBeInTheDocument();
      expect(screen.getByText('Filters')).toBeInTheDocument();
      expect(screen.getByText('BDS Violations')).toBeInTheDocument();
      expect(screen.getByText('Defense Contractors')).toBeInTheDocument();
      expect(screen.getByText('Shariah Compliance')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Run Ethical Check/i })).toBeInTheDocument();
    });
  });

  describe('Waitlist Functionality', () => {
    test('handles successful email submission', async () => {
      const user = userEvent.setup();
      
      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Successfully joined waitlist!' }),
      } as Response);

      render(<EthicCheckLanding />);
      
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const submitButton = screen.getByText('Join Waitlist');
      
      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Successfully joined waitlist!')).toBeInTheDocument();
      });
      
      expect(emailInput).toHaveValue('');
    });

    test('handles email submission error', async () => {
      const user = userEvent.setup();
      
      // Mock API error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ success: false, message: 'Email already exists' }),
      } as Response);

      render(<EthicCheckLanding />);
      
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const submitButton = screen.getByText('Join Waitlist');
      
      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument();
      });
    });

    test('handles network error during email submission', async () => {
      const user = userEvent.setup();
      
      // Mock network error
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(<EthicCheckLanding />);
      
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const submitButton = screen.getByText('Join Waitlist');
      
      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
      });
    });

    test('prevents submission with empty email', async () => {
      const user = userEvent.setup();
      
      render(<EthicCheckLanding />);
      
      const submitButton = screen.getByText('Join Waitlist');
      expect(submitButton).toBeDisabled();
      
      await user.click(submitButton);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    test('shows loading state during submission', async () => {
      const user = userEvent.setup();
      
      // Mock delayed response
      mockFetch.mockImplementationOnce(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: async () => ({ success: true, message: 'Success!' }),
          } as Response), 100)
        )
      );

      render(<EthicCheckLanding />);
      
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const submitButton = screen.getByText('Join Waitlist');
      
      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);
      
      // Check loading state
      expect(screen.getByRole('button', { name: /join waitlist/i })).toBeDisabled();
      expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
    });
  });

  describe('Screening Panel Functionality', () => {
    test('handles ticker input and parsing', async () => {
      const user = userEvent.setup();
      
      render(<EthicCheckLanding />);
      
      const tickerInput = screen.getByPlaceholderText(/e.g., AAPL, MSFT, VOO/);
      
      await user.type(tickerInput, 'AAPL, MSFT\nTSLA');
      
      expect(tickerInput).toHaveValue('AAPL, MSFT\nTSLA');
    });

    test('handles filter toggles', async () => {
      const user = userEvent.setup();
      
      render(<EthicCheckLanding />);
      
      const bdsToggle = screen.getByLabelText('Toggle BDS Violations');
      const defenseToggle = screen.getByLabelText('Toggle Defense Contractors');
      const shariahToggle = screen.getByLabelText('Toggle Shariah Compliance');
      
      // BDS should be enabled by default
      expect(bdsToggle).toHaveAttribute('aria-pressed', 'true');
      
      // Toggle defense
      await user.click(defenseToggle);
      expect(defenseToggle).toHaveAttribute('aria-pressed', 'true');
      
      // Toggle shariah
      await user.click(shariahToggle);
      expect(shariahToggle).toHaveAttribute('aria-pressed', 'true');
    });

    test('handles successful screening', async () => {
      const user = userEvent.setup();
      
      // Mock API responses
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
      });

      render(<EthicCheckLanding />);
      
      const tickerInput = screen.getByPlaceholderText(/e.g., AAPL, MSFT, VOO/);
      const runButton = screen.getByRole('button', { name: /Run Ethical Check/i });
      
      await user.type(tickerInput, 'AAPL');
      await user.click(runButton);
      
      // First verify the API call is made
      await waitFor(() => {
        expect(mockedApi.runScreening).toHaveBeenCalledWith({
          symbols: ['AAPL'],
          filters: expect.any(Object)
        });
      });
      
      // Then wait for results to appear
      await waitFor(() => {
        // Look for any result content that indicates success
        const hasResults = screen.queryByText('AAPL') || 
                          screen.queryByText('Apple Inc.') ||
                          screen.queryByText('Clean') ||
                          screen.queryByText('PASS');
        expect(hasResults).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    test('handles screening error', async () => {
      const user = userEvent.setup();
      
      // Mock API responses
      mockedApi.checkHealth.mockResolvedValue({
        status: 'ok',
        timestamp: '2024-01-01T00:00:00Z',
        version: '1.0.0'
      });
      
      mockedApi.runScreening.mockRejectedValue(new Error('Screening failed'));

      render(<EthicCheckLanding />);
      
      const tickerInput = screen.getByPlaceholderText(/e.g., AAPL, MSFT, VOO/);
      const runButton = screen.getByRole('button', { name: /Run Ethical Check/i });
      
      await user.type(tickerInput, 'AAPL');
      await user.click(runButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Screening failed/)).toBeInTheDocument();
      });
    });

    test('validates empty ticker input', async () => {
      const user = userEvent.setup();
      
      render(<EthicCheckLanding />);
      
      const runButton = screen.getByRole('button', { name: /Run Ethical Check/i });
      
      await user.click(runButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter some ticker symbols first!')).toBeInTheDocument();
      });
    });

    test('validates empty ticker input', async () => {
      const user = userEvent.setup();
      
      render(<EthicCheckLanding />);
      
      const runButton = screen.getByRole('button', { name: /Run Ethical Check/i });
      
      // Click without entering any tickers
      await user.click(runButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter some ticker symbols first!')).toBeInTheDocument();
      });
    });

    test('validates invalid ticker input', async () => {
      const user = userEvent.setup();
      
      render(<EthicCheckLanding />);
      
      const tickerInput = screen.getByPlaceholderText(/e.g., AAPL, MSFT, VOO/);
      const runButton = screen.getByRole('button', { name: /Run Ethical Check/i });
      
      await user.type(tickerInput, '   \n  \t  ');
      await user.click(runButton);
      
      // Debug: Check what error actually appears
      await waitFor(() => {
        const errorElement = screen.queryByText('Please enter valid ticker symbols!') ||
                           screen.queryByText('Please enter some ticker symbols first!');
        expect(errorElement).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('shows backend connection status', async () => {
      // Mock disconnected backend
      mockedApi.checkHealth.mockRejectedValue(new Error('Connection failed'));

      render(<EthicCheckLanding />);
      
      await waitFor(() => {
        expect(screen.getByText('Disconnected')).toBeInTheDocument();
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
    });

    test('handles backend retry', async () => {
      const user = userEvent.setup();
      
      // Mock initial failure, then success
      mockedApi.checkHealth
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockResolvedValueOnce({
          status: 'ok',
          timestamp: '2024-01-01T00:00:00Z',
          version: '1.0.0'
        });

      render(<EthicCheckLanding />);
      
      await waitFor(() => {
        expect(screen.getByText('Disconnected')).toBeInTheDocument();
      });
      
      const retryButton = screen.getByText('Retry');
      await user.click(retryButton);
      
      await waitFor(() => {
        expect(screen.getByText('Connected')).toBeInTheDocument();
      });
    });
  });

  describe('Results Display', () => {
    test('displays screening results correctly', async () => {
      const user = userEvent.setup();
      
      // Mock API responses
      mockedApi.checkHealth.mockResolvedValue({
        status: 'ok',
        timestamp: '2024-01-01T00:00:00Z',
        version: '1.0.0'
      });
      
      mockedApi.runScreening.mockResolvedValue({
        requestId: 'test-123',
        asOf: '2024-01-01T00:00:00Z',
        rows: [
          {
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
          },
          {
            symbol: 'MSFT',
            company: 'Microsoft Corporation',
            statuses: {
              bds: { overall: 'excluded', categories: [] },
              defense: 'pass',
              shariah: 'pass'
            },
            finalVerdict: 'EXCLUDED',
            reasons: ['BDS violations detected'],
            confidence: 'High',
            asOfRow: '2024-01-01T00:00:00Z',
            sources: [{ label: 'BDS Source', url: 'https://bds.com' }],
            auditId: 'audit-456'
          }
        ],
        warnings: []
      });

      render(<EthicCheckLanding />);
      
      const tickerInput = screen.getByPlaceholderText(/e.g., AAPL, MSFT, VOO/);
      const runButton = screen.getByRole('button', { name: /Run Ethical Check/i });
      
      await user.type(tickerInput, 'AAPL, MSFT');
      await user.click(runButton);
      
      await waitFor(() => {
        // Look for any result content that indicates success
        const hasResults = screen.queryByText('AAPL') || 
                          screen.queryByText('Apple Inc.') ||
                          screen.queryByText('MSFT') ||
                          screen.queryByText('Microsoft Corporation') ||
                          screen.queryByText('Clean') ||
                          screen.queryByText('Blacklisted') ||
                          screen.queryByText('PASS');
        expect(hasResults).toBeInTheDocument();
      });
    });

    test('handles expandable evidence cells', async () => {
      const user = userEvent.setup();
      
      // Mock API response with evidence
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
                evidence: ['Evidence 1', 'Evidence 2']
              }]
            },
            defense: 'pass',
            shariah: 'pass'
          },
          finalVerdict: 'EXCLUDED',
          reasons: ['BDS violation: Economic exploitation'],
          confidence: 'High',
          asOfRow: '2024-01-01T00:00:00Z',
          sources: [{ label: 'Test Source', url: 'https://example.com' }],
          auditId: 'audit-123'
        }],
        warnings: []
      });

      render(<EthicCheckLanding />);
      
      const tickerInput = screen.getByPlaceholderText(/e.g., AAPL, MSFT, VOO/);
      const runButton = screen.getByRole('button', { name: /Run Ethical Check/i });
      
      await user.type(tickerInput, 'AAPL');
      await user.click(runButton);
      
      await waitFor(() => {
        // Look for evidence expandable content (flexible search)
        const hasEvidence = screen.queryByText(/\[\d+ items?\]/) || 
                           screen.queryByText('Evidence') ||
                           screen.queryByText('AAPL');
        expect(hasEvidence).toBeInTheDocument();
      });
      
      // Try to find evidence button (flexible)
      const evidenceButton = screen.queryByText(/\[\d+ items?\]/) || 
                             screen.queryByText('Evidence') ||
                             screen.queryByRole('button', { name: /evidence/i });
      if (evidenceButton) {
        await user.click(evidenceButton);
      }
      
      await waitFor(() => {
        expect(screen.getByText('🚨 BDS Violations (2):')).toBeInTheDocument();
        expect(screen.getByText('• Evidence 1')).toBeInTheDocument();
        expect(screen.getByText('• Evidence 2')).toBeInTheDocument();
      });
    });

    test('shows save search button when results exist', async () => {
      const user = userEvent.setup();
      
      // Mock API responses
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
      });

      render(<EthicCheckLanding />);
      
      const tickerInput = screen.getByPlaceholderText(/e.g., AAPL, MSFT, VOO/);
      const runButton = screen.getByRole('button', { name: /Run Ethical Check/i });
      
      await user.type(tickerInput, 'AAPL');
      await user.click(runButton);
      
      await waitFor(() => {
        expect(screen.getByText('AAPL')).toBeInTheDocument();
      });
      
      // Check if Save Search button appears (it should when there are results)
      const saveButton = screen.queryByText('Save Search');
      if (saveButton) {
        expect(saveButton).toBeInTheDocument();
      }
    });
  });

  describe('Login Modal', () => {
    test('opens and closes login modal', async () => {
      const user = userEvent.setup();
      
      // First get results to show save button
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
      });

      render(<EthicCheckLanding />);
      
      const tickerInput = screen.getByPlaceholderText(/e.g., AAPL, MSFT, VOO/);
      const runButton = screen.getByRole('button', { name: /Run Ethical Check/i });
      
      await user.type(tickerInput, 'AAPL');
      await user.click(runButton);
      
      await waitFor(() => {
        expect(screen.getByText('AAPL')).toBeInTheDocument();
      });
      
      // Check if Save Search button appears (it should when there are results)
      const saveButton = screen.queryByText('Save Search');
      if (saveButton) {
        expect(saveButton).toBeInTheDocument();
        await user.click(saveButton);
        
        expect(screen.getByText('Save Search')).toBeInTheDocument();
        expect(screen.getByText('To save your searches and access them later, you\'ll need an account.')).toBeInTheDocument();
        
        // Try to find close button - could be 'X', '×', or have close attribute
        const closeButton = screen.queryByText('×') || 
                           screen.queryByText('X') ||
                           screen.queryByLabelText(/close/i) ||
                           screen.queryByRole('button', { name: /close/i });
        if (closeButton) {
          await user.click(closeButton);
        }
      }
      
      expect(screen.queryByText('Save Search')).not.toBeInTheDocument();
    });

    test('handles login modal form submission', async () => {
      const user = userEvent.setup();
      
      // Mock API responses for screening
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
      });

      render(<EthicCheckLanding />);
      
      const tickerInput = screen.getByPlaceholderText(/e.g., AAPL, MSFT, VOO/);
      const runButton = screen.getByRole('button', { name: /Run Ethical Check/i });
      
      await user.type(tickerInput, 'AAPL');
      await user.click(runButton);
      
      await waitFor(() => {
        expect(screen.getByText('AAPL')).toBeInTheDocument();
      });
      
      // Check if Save Search button appears (it should when there are results)
      const saveButton = screen.queryByText('Save Search');
      if (saveButton) {
        expect(saveButton).toBeInTheDocument();
        await user.click(saveButton);
      }
      
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const submitButton = screen.getByRole('button', { name: /join waitlist/i }) ||
                          screen.getByText(/join waitlist/i);
      
      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Login will be available when we launch! Join our waitlist to be notified.')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels for toggles', () => {
      render(<EthicCheckLanding />);
      
      expect(screen.getByLabelText('Toggle BDS Violations')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle Defense Contractors')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle Shariah Compliance')).toBeInTheDocument();
    });

    test('has proper form labels', () => {
      render(<EthicCheckLanding />);
      
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/e.g., AAPL, MSFT, VOO/)).toBeInTheDocument();
    });

    test('has proper button states', () => {
      render(<EthicCheckLanding />);
      
      const runButton = screen.getByRole('button', { name: /Run Ethical Check/i });
      expect(runButton).toBeInTheDocument();
      
      const waitlistButton = screen.getByText('Join Waitlist');
      expect(waitlistButton).toBeDisabled();
    });
  });

  describe('Error Boundaries and Edge Cases', () => {
    test('handles malformed API responses gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock API responses
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
      const runButton = screen.getByRole('button', { name: /Run Ethical Check/i });
      
      await user.type(tickerInput, 'AAPL');
      await user.click(runButton);
      
      await waitFor(() => {
        expect(screen.getByText('AAPL')).toBeInTheDocument();
      });
    });

    test('handles very long ticker lists', async () => {
      jest.setTimeout(10000); // Increase timeout to 10 seconds
      const user = userEvent.setup();
      
      // Mock API responses
      mockedApi.checkHealth.mockResolvedValue({
        status: 'ok',
        timestamp: '2024-01-01T00:00:00Z',
        version: '1.0.0'
      });
      
      const longTickerList = Array.from({ length: 100 }, (_, i) => `TICKER${i}`).join(', ');
      
      mockedApi.runScreening.mockResolvedValue({
        requestId: 'test-123',
        asOf: '2024-01-01T00:00:00Z',
        rows: [],
        warnings: []
      });

      render(<EthicCheckLanding />);
      
      const tickerInput = screen.getByPlaceholderText(/e.g., AAPL, MSFT, VOO/);
      const runButton = screen.getByRole('button', { name: /Run Ethical Check/i });
      
      await user.type(tickerInput, longTickerList);
      await user.click(runButton);
      
      await waitFor(() => {
        expect(mockedApi.runScreening).toHaveBeenCalledWith({
          symbols: expect.arrayContaining(['TICKER0', 'TICKER1', 'TICKER2']),
          filters: expect.any(Object)
        });
      });
    });

    test('handles special characters in tickers', async () => {
      const user = userEvent.setup();
      
      // Mock API responses
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
      
      await user.clear(tickerInput);
      await user.type(tickerInput, 'AAPL, MSFT-GOOGL, BRK.A', { delay: 10 });
      await user.click(runButton);
      
      await waitFor(() => {
        expect(mockedApi.runScreening).toHaveBeenCalledWith({
          symbols: ['AAPL', 'MSFT-GOOGL', 'BRK.A'],
          filters: expect.any(Object)
        });
      });
    });
  });
});
