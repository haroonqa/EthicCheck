# EthicCheck Frontend Test Suite

This comprehensive test suite covers all major functionality and error scenarios for the EthicCheck frontend application.

## Test Structure

### 1. Component Tests (`EthicCheckLanding.test.tsx`)
- **Rendering Tests**: Verify all components render correctly
- **Waitlist Functionality**: Email submission, validation, error handling
- **Screening Panel**: Ticker input, filter toggles, API integration
- **Results Display**: Table rendering, evidence expansion, status indicators
- **Login Modal**: Modal opening/closing, form submission
- **Accessibility**: ARIA labels, form associations, keyboard navigation

### 2. API Service Tests (`api.test.ts`)
- **Health Check**: Success/failure scenarios, network errors
- **Screening API**: Request/response handling, error cases
- **Methodology API**: Filter-specific data retrieval
- **Response Conversion**: API to frontend format transformation
- **Environment Configuration**: API URL handling
- **Request Validation**: Input validation and error handling

### 3. Integration Tests (`integration.test.tsx`)
- **Complete User Workflows**: End-to-end user journeys
- **Error Recovery**: Backend disconnection, API failures, retry mechanisms
- **Complex Filter Combinations**: Multiple filters with mixed results
- **Performance**: Large datasets, rapid interactions, concurrent operations

### 4. Error Scenarios (`error-scenarios.test.tsx`)
- **Network Errors**: Complete backend failure, timeouts, malformed responses
- **Input Validation**: Empty inputs, invalid formats, edge cases
- **State Management**: Rapid changes, concurrent operations
- **Memory/Performance**: Large datasets, memory leaks, browser compatibility
- **Data Corruption**: Malformed responses, circular references

### 5. Accessibility Tests (`accessibility.test.tsx`)
- **WCAG Compliance**: Automated accessibility testing with axe
- **Keyboard Navigation**: Tab order, keyboard interactions
- **Screen Reader Support**: ARIA labels, semantic HTML
- **Focus Management**: Proper focus handling
- **Color Contrast**: Status indicator accessibility

### 6. Utility Tests (`utils.test.ts`)
- **Response Conversion**: API response transformation
- **Status Mapping**: Backend to frontend status conversion
- **Category Handling**: BDS category processing
- **Edge Cases**: Empty responses, malformed data
- **Performance**: Large dataset processing

## Running Tests

### All Tests
```bash
npm test
```

### Coverage Report
```bash
npm run test:coverage
```

### CI Mode (No Watch)
```bash
npm run test:ci
```

### Specific Test Files
```bash
npm test -- --testPathPattern=EthicCheckLanding
npm test -- --testPathPattern=api
npm test -- --testPathPattern=integration
```

## Test Coverage

The test suite aims for 80%+ coverage across:
- **Branches**: All conditional logic paths
- **Functions**: All function calls
- **Lines**: All executable lines
- **Statements**: All statements

## Key Test Scenarios

### Error Handling
- Network failures and timeouts
- Malformed API responses
- Invalid user inputs
- Backend disconnection/reconnection
- Memory leaks and performance issues

### User Workflows
- Complete screening workflow
- Waitlist signup process
- Login modal interactions
- Filter configuration
- Results exploration

### Edge Cases
- Empty and invalid inputs
- Large datasets (1000+ items)
- Rapid user interactions
- Concurrent operations
- Browser compatibility issues

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Focus management
- Color contrast

## Mocking Strategy

- **API Calls**: Mocked using Jest mocks
- **Fetch API**: Global fetch mock for network requests
- **Environment Variables**: Controlled test environment
- **Browser APIs**: Mocked for compatibility testing

## Test Data

Tests use realistic mock data that mirrors the actual API responses:
- Company information and tickers
- BDS violation categories and evidence
- Defense contractor statuses
- Shariah compliance results
- Source links and audit trails

## Continuous Integration

Tests are designed to run in CI environments with:
- No watch mode
- Coverage reporting
- Exit codes for pass/fail
- Parallel execution support







