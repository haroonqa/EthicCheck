# Contributing to EthicCheck

Thank you for your interest in contributing to EthicCheck! We welcome contributions from the community and are grateful for your help in making ethical investing more transparent and accessible.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- A code editor (VS Code recommended)

### Development Setup
1. Fork the repository
2. Clone your fork locally
3. Install dependencies for both frontend and backend
4. Set up environment variables
5. Start the development servers

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/EthicCheck.git
cd EthicCheck

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Set up environment variables
cp backend/env.example backend/.env
# Edit backend/.env with your database URL

# Start development servers
npm start                    # Frontend (port 3000)
cd backend && npm run dev   # Backend (port 3001)
```

## 🎯 How to Contribute

### Reporting Issues
- Use the GitHub issue tracker
- Include steps to reproduce the bug
- Provide system information (OS, Node.js version, etc.)
- Include screenshots if applicable

### Suggesting Features
- Open a GitHub issue with the "enhancement" label
- Describe the feature and its benefits
- Consider the impact on existing users

### Code Contributions

#### 1. Choose an Issue
- Look for issues labeled "good first issue" or "help wanted"
- Comment on the issue to claim it
- Ask questions if anything is unclear

#### 2. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

#### 3. Make Changes
- Write clean, readable code
- Follow existing code style
- Add tests for new functionality
- Update documentation as needed

#### 4. Test Your Changes
```bash
# Frontend tests
npm test

# Backend tests
cd backend && npm test

# Run linting
npm run lint
cd backend && npm run lint
```

#### 5. Commit Changes
```bash
git add .
git commit -m "feat: add new feature description"
# or
git commit -m "fix: resolve issue description"
```

Use conventional commit messages:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `test:` for test additions/changes
- `refactor:` for code refactoring
- `style:` for formatting changes

#### 6. Push and Create PR
```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## 📝 Code Style Guidelines

### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow existing naming conventions
- Use meaningful variable and function names
- Add JSDoc comments for public functions
- Use async/await instead of Promises

### React Components
- Use functional components with hooks
- Keep components small and focused
- Use TypeScript interfaces for props
- Follow the existing component structure

### Backend
- Use Express.js patterns
- Follow RESTful API conventions
- Use Prisma for database operations
- Add proper error handling
- Use TypeScript types

### Testing
- Write unit tests for new features
- Test both success and error cases
- Use descriptive test names
- Aim for good test coverage

## 🧪 Testing Guidelines

### Frontend Tests
- Test component rendering
- Test user interactions
- Test API integration
- Test error states

### Backend Tests
- Test API endpoints
- Test database operations
- Test business logic
- Test error handling

### Running Tests
```bash
# Frontend
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # With coverage

# Backend
cd backend
npm test                   # Run all tests
npm test -- --watch        # Watch mode
```

## 📚 Documentation

### Code Documentation
- Add JSDoc comments for functions
- Document complex algorithms
- Explain business logic
- Update README for new features

### API Documentation
- Document new endpoints
- Include request/response examples
- Document error codes
- Update API documentation

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Description**: Clear description of the bug
2. **Steps to Reproduce**: Detailed steps to reproduce
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: OS, Node.js version, browser
6. **Screenshots**: If applicable
7. **Logs**: Any relevant error messages

## ✨ Feature Requests

When suggesting features:

1. **Use Case**: Describe the problem it solves
2. **Proposed Solution**: How you think it should work
3. **Alternatives**: Other solutions you've considered
4. **Additional Context**: Any other relevant information

## 🔍 Code Review Process

1. **Automated Checks**: CI/CD runs tests and linting
2. **Manual Review**: Maintainers review the code
3. **Feedback**: Address any requested changes
4. **Approval**: Once approved, it gets merged

### Review Checklist
- [ ] Code follows style guidelines
- [ ] Tests pass
- [ ] Documentation is updated
- [ ] No breaking changes (or properly documented)
- [ ] Security considerations addressed

## 🏷️ Labels

We use labels to categorize issues and PRs:

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Improvements to documentation
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention is needed
- `priority: high`: High priority
- `priority: low`: Low priority
- `status: in progress`: Currently being worked on
- `status: blocked`: Blocked on something else

## 💬 Communication

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Pull Requests**: For code changes
- **Discord**: For real-time chat (coming soon)

## 📋 Pull Request Template

When creating a PR, please include:

- [ ] Description of changes
- [ ] Related issue number
- [ ] Screenshots (if UI changes)
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Breaking changes noted

## 🎉 Recognition

Contributors will be:
- Listed in the README
- Mentioned in release notes
- Given credit in the project

## 📞 Questions?

If you have questions about contributing:
- Open a GitHub issue
- Join our Discord (coming soon)
- Email us at contributors@ethiccheck.com

Thank you for contributing to EthicCheck! 🌱
