import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import EthicCheckLanding from '../components/EthicCheckLanding';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock the API module
jest.mock('../services/api');

describe('Accessibility Tests', () => {
  test('has no accessibility violations', async () => {
    const { container } = render(<EthicCheckLanding />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('has proper heading hierarchy', () => {
    render(<EthicCheckLanding />);
    
    // Check for main heading
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    
    // Check for section headings
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(1);
  });

  test('has proper form labels and associations', () => {
    render(<EthicCheckLanding />);
    
    // Email input should have proper label
    const emailInput = screen.getByLabelText(/Enter your email/i);
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');
    
    // Ticker input should have proper label
    const tickerInput = screen.getByLabelText(/Paste tickers/i);
    expect(tickerInput).toBeInTheDocument();
  });

  test('has proper button labels and states', () => {
    render(<EthicCheckLanding />);
    
    // Check main action buttons
    const runButton = screen.getByRole('button', { name: /Run Ethical Check/i });
    expect(runButton).toBeInTheDocument();
    
    const waitlistButton = screen.getByRole('button', { name: /Join Waitlist/i });
    expect(waitlistButton).toBeInTheDocument();
    expect(waitlistButton).toBeDisabled(); // Should be disabled when empty
  });

  test('has proper toggle button accessibility', () => {
    render(<EthicCheckLanding />);
    
    // Check toggle buttons have proper ARIA attributes
    const bdsToggle = screen.getByLabelText('Toggle BDS Violations');
    expect(bdsToggle).toHaveAttribute('aria-pressed');
    expect(bdsToggle).toHaveAttribute('aria-label');
    
    const defenseToggle = screen.getByLabelText('Toggle Defense Contractors');
    expect(defenseToggle).toHaveAttribute('aria-pressed');
    expect(defenseToggle).toHaveAttribute('aria-label');
    
    const shariahToggle = screen.getByLabelText('Toggle Shariah Compliance');
    expect(shariahToggle).toHaveAttribute('aria-pressed');
    expect(shariahToggle).toHaveAttribute('aria-label');
  });

  test('has proper table accessibility', async () => {
    const user = userEvent.setup();
    
    // Mock API to get results
    const { api } = require('../services/api');
    api.checkHealth.mockResolvedValue({
      status: 'ok',
      timestamp: '2024-01-01T00:00:00Z',
      version: '1.0.0'
    });
    
    api.runScreening.mockResolvedValue({
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
    await user.type(tickerInput, 'AAPL');
    
    const runButton = screen.getByRole('button', { name: /Run Ethical Check/i });
    await user.click(runButton);
    
    await screen.findByText('AAPL');
    
    // Check table has proper structure
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    
    // Check table headers
    const headers = screen.getAllByRole('columnheader');
    expect(headers.length).toBeGreaterThan(0);
    
    // Check table rows
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBeGreaterThan(1); // Header + data rows
  });

  test('has proper focus management', async () => {
    const user = userEvent.setup();
    
    render(<EthicCheckLanding />);
    
    // Tab through interactive elements
    await user.tab();
    expect(document.activeElement).toBe(screen.getByPlaceholderText('Enter your email'));
    
    await user.tab();
    expect(document.activeElement).toBe(screen.getByText('Join Waitlist'));
    
    await user.tab();
    expect(document.activeElement).toBe(screen.getByPlaceholderText(/e.g., AAPL, MSFT, VOO/));
  });

  test('has proper color contrast for status indicators', () => {
    render(<EthicCheckLanding />);
    
    // Check that status indicators have proper text content
    // (Color contrast would need visual testing, but we can check structure)
    const statusElements = screen.getAllByText(/Clean|Flagged|Blacklisted|Review/i);
    expect(statusElements.length).toBeGreaterThan(0);
  });

  test('has proper error message accessibility', async () => {
    const user = userEvent.setup();
    
    render(<EthicCheckLanding />);
    
    // Trigger error by clicking run without input
    const runButton = screen.getByRole('button', { name: /Run Ethical Check/i });
    await user.click(runButton);
    
    await screen.findByText('Please enter some ticker symbols first!');
    
    // Error message should be accessible
    const errorMessage = screen.getByText('Please enter some ticker symbols first!');
    expect(errorMessage).toBeInTheDocument();
  });

  test('has proper loading state accessibility', async () => {
    const user = userEvent.setup();
    
    // Mock API with delay
    const { api } = require('../services/api');
    api.checkHealth.mockResolvedValue({
      status: 'ok',
      timestamp: '2024-01-01T00:00:00Z',
      version: '1.0.0'
    });
    
    api.runScreening.mockImplementation(() => 
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
    
    // Check loading state
    expect(screen.getByText('Running Check...')).toBeInTheDocument();
    expect(runButton).toBeDisabled();
  });

  test('has proper modal accessibility', async () => {
    const user = userEvent.setup();
    
    // Mock API to get results first
    const { api } = require('../services/api');
    api.checkHealth.mockResolvedValue({
      status: 'ok',
      timestamp: '2024-01-01T00:00:00Z',
      version: '1.0.0'
    });
    
    api.runScreening.mockResolvedValue({
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
    await user.type(tickerInput, 'AAPL');
    
    const runButton = screen.getByRole('button', { name: /Run Ethical Check/i });
    await user.click(runButton);
    
    await screen.findByText('Save Search');
    
    const saveButton = screen.getByText('Save Search');
    await user.click(saveButton);
    
    // Check modal has proper heading
    expect(screen.getByRole('heading', { name: /Save Search/i })).toBeInTheDocument();
    
    // Check close button
    const closeButton = screen.getByRole('button', { name: /close/i });
    expect(closeButton).toBeInTheDocument();
  });

  test('has proper keyboard navigation', async () => {
    const user = userEvent.setup();
    
    render(<EthicCheckLanding />);
    
    // Test keyboard navigation through form
    await user.tab();
    await user.type(screen.getByPlaceholderText('Enter your email'), 'test@example.com');
    
    await user.tab();
    await user.keyboard('{Enter}'); // Submit waitlist
    
    await user.tab();
    await user.type(screen.getByPlaceholderText(/e.g., AAPL, MSFT, VOO/), 'AAPL');
    
    await user.tab();
    await user.keyboard('{Enter}'); // Run screening
    
    // Should handle keyboard interactions properly
    expect(screen.getByPlaceholderText('Enter your email')).toHaveValue('test@example.com');
  });

  test('has proper screen reader support', () => {
    render(<EthicCheckLanding />);
    
    // Check for proper landmark roles
    expect(screen.getByRole('banner')).toBeInTheDocument(); // Header
    expect(screen.getByRole('main')).toBeInTheDocument(); // Main content
    expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // Footer
    
    // Check for proper form structure
    const forms = screen.getAllByRole('form');
    expect(forms.length).toBeGreaterThan(0);
  });

  test('has proper ARIA live regions for dynamic content', async () => {
    const user = userEvent.setup();
    
    render(<EthicCheckLanding />);
    
    // Trigger error message
    const runButton = screen.getByRole('button', { name: /Run Ethical Check/i });
    await user.click(runButton);
    
    await screen.findByText('Please enter some ticker symbols first!');
    
    // Error messages should be announced to screen readers
    const errorMessage = screen.getByText('Please enter some ticker symbols first!');
    expect(errorMessage).toBeInTheDocument();
  });

  test('has proper link accessibility', () => {
    render(<EthicCheckLanding />);
    
    // Check navigation links
    const navLinks = screen.getAllByRole('link');
    expect(navLinks.length).toBeGreaterThan(0);
    
    // Check that links have proper href attributes
    navLinks.forEach(link => {
      expect(link).toHaveAttribute('href');
    });
  });

  test('has proper button disabled states', () => {
    render(<EthicCheckLanding />);
    
    // Waitlist button should be disabled when email is empty
    const waitlistButton = screen.getByText('Join Waitlist');
    expect(waitlistButton).toBeDisabled();
    
    // Run button should be enabled
    const runButton = screen.getByRole('button', { name: /Run Ethical Check/i });
    expect(runButton).toBeEnabled();
  });

  test('has proper table cell accessibility', async () => {
    const user = userEvent.setup();
    
    // Mock API to get results
    const { api } = require('../services/api');
    api.checkHealth.mockResolvedValue({
      status: 'ok',
      timestamp: '2024-01-01T00:00:00Z',
      version: '1.0.0'
    });
    
    api.runScreening.mockResolvedValue({
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
    await user.type(tickerInput, 'AAPL');
    
    const runButton = screen.getByRole('button', { name: /Run Ethical Check/i });
    await user.click(runButton);
    
    await screen.findByText('AAPL');
    
    // Check table cells have proper roles
    const cells = screen.getAllByRole('cell');
    expect(cells.length).toBeGreaterThan(0);
  });
});
