import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EthicCheckLanding from '../components/EthicCheckLanding';
import { api } from '../services/api';

// Mock the API module
jest.mock('../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('Complete User Workflow', () => {
    test('full screening workflow from start to finish', async () => {
      const user = userEvent.setup();
      
      // Mock successful API responses
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
              bds: { overall: 'excluded', categories: [{
                category: 'economic_exploitation',
                status: 'excluded',
                evidence: ['Evidence of economic exploitation']
              }] },
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
      
      // 1. Wait for backend connection
      await waitFor(() => {
        expect(screen.getByText('Connected')).toBeInTheDocument();
      });
      
      // 2. Enter tickers
      const tickerInput = screen.getByPlaceholderText(/e.g., AAPL, MSFT, VOO/);
      await user.type(tickerInput, 'AAPL, MSFT');
      
      // 3. Configure filters
      const defenseToggle = screen.getByLabelText('Toggle Defense Contractors');
      await user.click(defenseToggle);
      
      // 4. Run screening
      const runButton = screen.getByRole('button', { name: /Run Ethical Check/i });
      await user.click(runButton);
      
      // 5. Verify results
      await waitFor(() => {
        expect(screen.getByText('AAPL')).toBeInTheDocument();
        expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
        expect(screen.getByText('MSFT')).toBeInTheDocument();
        expect(screen.getByText('Microsoft Corporation')).toBeInTheDocument();
      });
      
      // 6. Verify status indicators
      expect(screen.getAllByText('Clean')).toHaveLength(3); // AAPL: BDS, Defense, Shariah
      expect(screen.getByText('Blacklisted')).toBeInTheDocument(); // MSFT: BDS
      
      // 7. Expand evidence for MSFT
      const evidenceButton = screen.getByText('[2 items]');
      await user.click(evidenceButton);
      
      await waitFor(() => {
        expect(screen.getByText('🚨 BDS Violations (1):')).toBeInTheDocument();
        expect(screen.getByText('• Evidence of economic exploitation')).toBeInTheDocument();
      });
      
      // 8. Verify save search button appears
      expect(screen.getByText('Save Search')).toBeInTheDocument();
    });

    test('waitlist signup workflow', async () => {
      const user = userEvent.setup();
      
      // Mock successful waitlist API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Successfully joined waitlist!' }),
      } as Response);

      render(<EthicCheckLanding />);
      
      // 1. Enter email
      const emailInput = screen.getByPlaceholderText('Enter your email');
      await user.type(emailInput, 'test@example.com');
      
      // 2. Submit waitlist form
      const submitButton = screen.getByText('Join Waitlist');
      await user.click(submitButton);
      
      // 3. Verify success message
      await waitFor(() => {
        expect(screen.getByText('Successfully joined waitlist!')).toBeInTheDocument();
      });
      
      // 4. Verify email is cleared
      expect(emailInput).toHaveValue('');
    });

    test('login modal workflow', async () => {
      const user = userEvent.setup();
      
      // First get some results to show save button
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
      
      // 1. Get results first
      const tickerInput = screen.getByPlaceholderText(/e.g., AAPL, MSFT, VOO/);
      await user.type(tickerInput, 'AAPL');
      
      const runButton = screen.getByRole('button', { name: /Run Ethical Check/i });
      await user.click(runButton);
      
      await waitFor(() => {
        expect(screen.getByText('Save Search')).toBeInTheDocument();
      });
      
      // 2. Open login modal
      const saveButton = screen.getByText('Save Search');
      await user.click(saveButton);
      
      // 3. Verify modal opens
      expect(screen.getByText('Save Search')).toBeInTheDocument();
      expect(screen.getByText('To save your searches and access them later, you\'ll need an account.')).toBeInTheDocument();
      
      // 4. Fill out login form
      const modalEmailInput = screen.getByPlaceholderText('Enter your email');
      await user.type(modalEmailInput, 'test@example.com');
      
      // 5. Submit login form
      const loginSubmitButton = screen.getByText('Join Waitlist for Early Access');
      await user.click(loginSubmitButton);
      
      // 6. Verify success message and modal closes
      await waitFor(() => {
        expect(screen.getByText('Login will be available when we launch! Join our waitlist to be notified.')).toBeInTheDocument();
      });
      
      // Modal should close after 3 seconds
      await waitFor(() => {
        expect(screen.queryByText('Save Search')).not.toBeInTheDocument();
      }, { timeout: 4000 });
    });
  });

  describe('Error Recovery Workflows', () => {
    test('backend disconnection and recovery', async () => {
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
      
      // 1. Verify initial disconnection
      await waitFor(() => {
        expect(screen.getByText('Disconnected')).toBeInTheDocument();
      });
      
      // 2. Click retry
      const retryButton = screen.getByText('Retry');
      await user.click(retryButton);
      
      // 3. Verify reconnection
      await waitFor(() => {
        expect(screen.getByText('Connected')).toBeInTheDocument();
      });
    });

    test('screening error and retry', async () => {
      const user = userEvent.setup();
      
      // Mock API responses
      mockedApi.checkHealth.mockResolvedValue({
        status: 'ok',
        timestamp: '2024-01-01T00:00:00Z',
        version: '1.0.0'
      });
      
      // First call fails, second succeeds
      mockedApi.runScreening
        .mockRejectedValueOnce(new Error('Screening failed'))
        .mockResolvedValueOnce({
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
      
      // 1. Enter tickers and run screening
      const tickerInput = screen.getByPlaceholderText(/e.g., AAPL, MSFT, VOO/);
      await user.type(tickerInput, 'AAPL');
      
      const runButton = screen.getByRole('button', { name: /Run Ethical Check/i });
      await user.click(runButton);
      
      // 2. Verify error message
      await waitFor(() => {
        expect(screen.getByText(/Screening failed/)).toBeInTheDocument();
      });
      
      // 3. Clear error and try again
      await user.clear(tickerInput);
      await user.type(tickerInput, 'AAPL');
      await user.click(runButton);
      
      // 4. Verify success
      await waitFor(() => {
        expect(screen.getByText('AAPL')).toBeInTheDocument();
        expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
      });
    });

    test('waitlist error and retry', async () => {
      const user = userEvent.setup();
      
      // Mock API responses - first fails, second succeeds
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, message: 'Successfully joined waitlist!' }),
        } as Response);

      render(<EthicCheckLanding />);
      
      // 1. First attempt fails
      const emailInput = screen.getByPlaceholderText('Enter your email');
      await user.type(emailInput, 'test@example.com');
      
      const submitButton = screen.getByText('Join Waitlist');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
      });
      
      // 2. Retry with same email
      await user.click(submitButton);
      
      // 3. Verify success
      await waitFor(() => {
        expect(screen.getByText('Successfully joined waitlist!')).toBeInTheDocument();
      });
    });
  });

  describe('Complex Filter Combinations', () => {
    test('all filters enabled with mixed results', async () => {
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
            symbol: 'CLEAN',
            company: 'Clean Company',
            statuses: {
              bds: { overall: 'pass', categories: [] },
              defense: 'pass',
              shariah: 'pass'
            },
            finalVerdict: 'PASS',
            reasons: ['Company passed all checks'],
            confidence: 'High',
            asOfRow: '2024-01-01T00:00:00Z',
            sources: [],
            auditId: 'audit-1'
          },
          {
            symbol: 'BDS_VIOLATION',
            company: 'BDS Violation Company',
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
            reasons: ['BDS violations detected'],
            confidence: 'High',
            asOfRow: '2024-01-01T00:00:00Z',
            sources: [{ label: 'BDS Source', url: 'https://bds.com' }],
            auditId: 'audit-2'
          },
          {
            symbol: 'DEFENSE',
            company: 'Defense Contractor',
            statuses: {
              bds: { overall: 'pass', categories: [] },
              defense: 'excluded',
              shariah: 'pass'
            },
            finalVerdict: 'EXCLUDED',
            reasons: ['Defense contractor detected'],
            confidence: 'High',
            asOfRow: '2024-01-01T00:00:00Z',
            sources: [{ label: 'Defense Source', url: 'https://defense.com' }],
            auditId: 'audit-3'
          },
          {
            symbol: 'SHARIAH',
            company: 'Non-Shariah Company',
            statuses: {
              bds: { overall: 'pass', categories: [] },
              defense: 'pass',
              shariah: 'excluded'
            },
            finalVerdict: 'EXCLUDED',
            reasons: ['Shariah non-compliant'],
            confidence: 'High',
            asOfRow: '2024-01-01T00:00:00Z',
            sources: [{ label: 'Shariah Source', url: 'https://shariah.com' }],
            auditId: 'audit-4'
          }
        ],
        warnings: []
      });

      render(<EthicCheckLanding />);
      
      // 1. Enable all filters
      const bdsToggle = screen.getByLabelText('Toggle BDS Violations');
      const defenseToggle = screen.getByLabelText('Toggle Defense Contractors');
      const shariahToggle = screen.getByLabelText('Toggle Shariah Compliance');
      
      // BDS should already be enabled
      expect(bdsToggle).toHaveAttribute('aria-pressed', 'true');
      
      await user.click(defenseToggle);
      await user.click(shariahToggle);
      
      // 2. Enter tickers
      const tickerInput = screen.getByPlaceholderText(/e.g., AAPL, MSFT, VOO/);
      await user.type(tickerInput, 'CLEAN, BDS_VIOLATION, DEFENSE, SHARIAH');
      
      // 3. Run screening
      const runButton = screen.getByRole('button', { name: /Run Ethical Check/i });
      await user.click(runButton);
      
      // 4. Verify all results
      await waitFor(() => {
        expect(screen.getByText('CLEAN')).toBeInTheDocument();
        expect(screen.getByText('BDS_VIOLATION')).toBeInTheDocument();
        expect(screen.getByText('DEFENSE')).toBeInTheDocument();
        expect(screen.getByText('SHARIAH')).toBeInTheDocument();
      });
      
      // 5. Verify status distribution
      expect(screen.getAllByText('Clean')).toHaveLength(4); // CLEAN: all 4 statuses
      expect(screen.getAllByText('Blacklisted')).toHaveLength(6); // 3 companies × 2 statuses each
      
      // 6. Expand evidence for BDS violation
      const evidenceButtons = screen.getAllByText(/\[\d+ items?\]/);
      await user.click(evidenceButtons[0]); // First company with evidence
      
      await waitFor(() => {
        expect(screen.getByText('🚨 BDS Violations (2):')).toBeInTheDocument();
        expect(screen.getByText('• Evidence 1')).toBeInTheDocument();
        expect(screen.getByText('• Evidence 2')).toBeInTheDocument();
      });
    });
  });

  describe('Performance and Edge Cases', () => {
    test('handles large ticker list efficiently', async () => {
      const user = userEvent.setup();
      
      // Mock API responses
      mockedApi.checkHealth.mockResolvedValue({
        status: 'ok',
        timestamp: '2024-01-01T00:00:00Z',
        version: '1.0.0'
      });
      
      // Generate large ticker list
      const largeTickerList = Array.from({ length: 50 }, (_, i) => `TICKER${i}`).join(', ');
      
      mockedApi.runScreening.mockResolvedValue({
        requestId: 'test-123',
        asOf: '2024-01-01T00:00:00Z',
        rows: [],
        warnings: ['Large request processed']
      });

      render(<EthicCheckLanding />);
      
      const tickerInput = screen.getByPlaceholderText(/e.g., AAPL, MSFT, VOO/);
      await user.type(tickerInput, largeTickerList);
      
      const runButton = screen.getByRole('button', { name: /Run Ethical Check/i });
      await user.click(runButton);
      
      await waitFor(() => {
        expect(mockedApi.runScreening).toHaveBeenCalledWith({
          symbols: expect.arrayContaining(['TICKER0', 'TICKER1', 'TICKER49']),
          filters: expect.any(Object)
        });
      });
    });

    test('handles rapid filter toggling', async () => {
      const user = userEvent.setup();
      
      render(<EthicCheckLanding />);
      
      const bdsToggle = screen.getByLabelText('Toggle BDS Violations');
      const defenseToggle = screen.getByLabelText('Toggle Defense Contractors');
      const shariahToggle = screen.getByLabelText('Toggle Shariah Compliance');
      
      // Rapidly toggle filters
      await user.click(defenseToggle);
      await user.click(shariahToggle);
      await user.click(bdsToggle);
      await user.click(defenseToggle);
      await user.click(shariahToggle);
      await user.click(bdsToggle);
      
      // Verify final state
      expect(bdsToggle).toHaveAttribute('aria-pressed', 'false');
      expect(defenseToggle).toHaveAttribute('aria-pressed', 'false');
      expect(shariahToggle).toHaveAttribute('aria-pressed', 'false');
    });

    test('handles concurrent operations gracefully', async () => {
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

      // Mock waitlist API
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, message: 'Success!' }),
      } as Response);

      render(<EthicCheckLanding />);
      
      // Start screening
      const tickerInput = screen.getByPlaceholderText(/e.g., AAPL, MSFT, VOO/);
      await user.type(tickerInput, 'AAPL');
      
      const runButton = screen.getByRole('button', { name: /Run Ethical Check/i });
      await user.click(runButton);
      
      // Simultaneously try to submit waitlist
      const emailInput = screen.getByPlaceholderText('Enter your email');
      await user.type(emailInput, 'test@example.com');
      
      const waitlistButton = screen.getByText('Join Waitlist');
      await user.click(waitlistButton);
      
      // Both operations should complete successfully
      await waitFor(() => {
        expect(screen.getByText('Success!')).toBeInTheDocument();
      });
    });
  });
});
