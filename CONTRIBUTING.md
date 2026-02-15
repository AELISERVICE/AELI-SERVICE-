# Contributing Guide

Welcome to the AELI Services Backend project! This detailed guide will help you contribute effectively to our platform connecting clients with female entrepreneurs in Cameroon.

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+) - [Download](https://nodejs.org/)
- **PostgreSQL** (v13+) - [Installation guide](https://www.postgresql.org/download/)
- **Redis** (optional for local development, required for caching)
- **Git** - [Download](https://git-scm.com/)

### Complete Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/aeli_service_backend.git
   cd aeli_service_backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your local configurations
   ```

4. **Set up database**
   ```bash
   # Create PostgreSQL database
   createdb aeli_services
   
   # Run migrations
   npm run db:migrate
   
   # (Optional) Seed with test data
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🏗️ Project Architecture

### Folder Structure

```
src/
├── app.js              # Main application entry point
├── config/             # Configuration files (DB, third-party services)
├── controllers/        # API endpoints business logic
├── middlewares/        # Custom Express middlewares
├── models/            # Sequelize models (database)
├── routes/            # API routes definitions
├── services/          # Reusable business services
├── utils/             # Utility functions
├── validators/        # Input data validation
├── workers/           # Background tasks (Bull Queue)
└── jobs/              # Scheduled tasks (node-cron)
```

### Key Technologies

- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Cache**: Redis with ioredis
- **Authentication**: JWT with bcryptjs
- **File Storage**: Cloudinary
- **Email**: Nodemailer
- **Testing**: Jest with Supertest
- **Documentation**: Swagger/OpenAPI
- **Queue**: Bull for async tasks

## 🌿 Branching Strategy (Git Flow)

### Main Branches
- `main`: Stable production branch (protected)
- `develop`: Integration branch for new features

### Feature Branches
```bash
# Create a new feature branch
git checkout develop
git pull origin develop
git checkout -b feature/feature-name

# Create a bugfix branch
git checkout -b bugfix/bug-description

# Create a hotfix (urgent)
git checkout main
git pull origin main
git checkout -b hotfix/critical-urgency
```

### Branch Naming Conventions
- `feature/`: New features
- `bugfix/`: Bug fixes
- `hotfix/`: Urgent production fixes
- `refactor/`: Code refactoring
- `docs/`: Documentation updates

## ✍️ Code Standards

### Style and Naming
- **Variables/Functions**: `camelCase`
- **Classes/Models**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Files**: `kebab-case` or `camelCase` (consistent with existing)

### Documentation
```javascript
/**
 * Function description
 * @param {string} param1 - Parameter description
 * @param {Object} param2 - Parameter description
 * @returns {Promise<Object>} Return value description
 * @throws {Error} Possible error description
 */
async function exampleFunction(param1, param2) {
  // Implementation
}
```

### Best Practices
- Use `async/await` for asynchronous operations
- Always handle errors with `try/catch`
- Validate input data with `express-validator`
- Use middlewares for reusable logic
- Avoid overly long functions (< 50 lines)

## 🧪 Testing

### Test Structure
```
tests/
├── unit/           # Unit tests (models, services, utilities)
├── integration/    # Integration tests (controllers, routes)
├── fixtures/       # Test data
└── setup.js       # Global test configuration
```

### Test Commands
```bash
# Run all tests
npm test

# Run with code coverage
npm run test:coverage

# Watch mode for development
npm run test:watch

# Specific tests
npm test -- --testNamePattern="Controller"
```

### Writing Tests
```javascript
// Unit test example
describe('UserService', () => {
  test('should create user successfully', async () => {
    const userData = { name: 'Test', email: 'test@example.com' };
    const user = await UserService.createUser(userData);
    
    expect(user).toBeDefined();
    expect(user.email).toBe(userData.email);
  });
});
```

## 📝 Commit Conventions

Use the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Available Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, style (no code change)
- `refactor`: Refactoring
- `test`: Add/modify tests
- `chore`: Maintenance tasks

### Examples
```bash
git commit -m "feat(auth): add two-factor authentication"
git commit -m "fix(payment): resolve CinetPay webhook timeout"
git commit -m "docs(api): update payment endpoints documentation"
```

## 📬 Pull Request Process

### Pre-submission Checklist
- [ ] Code follows project conventions
- [ ] Tests pass locally (`npm test`)
- [ ] Coverage doesn't decrease (`npm run test:coverage`)
- [ ] Documentation updated if needed
- [ ] Commits follow conventional format
- [ ] Branch is up-to-date with develop

### Submission Steps
1. **Create branch** from `develop`
2. **Implement changes** with atomic commits
3. **Add/Update tests**
4. **Verify code quality**
   ```bash
   npm test
   npm run lint  # if configured
   ```
5. **Open Pull Request** to `develop`
6. **Fill PR template** with:
   - Clear description of changes
   - Screenshots if UI changes
   - Manual tests performed
   - Related issues

### PR Template
```markdown
## Description
Brief description of implemented changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Tests
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
```

## 🛠️ Development Environment

### Essential Environment Variables
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aeli_services
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret_32_chars_minimum

# Third-party services
CLOUDINARY_CLOUD_NAME=your_cloud_name
SMTP_HOST=your_smtp_host
```

### Docker (Optional)
```bash
# Start complete environment
npm run docker:up

# View logs
npm run docker:logs

# Stop everything
npm run docker:down
```

## 🐛 Debugging

### Recommended Tools
- **VS Code** with extensions:
  - SQLite Viewer
  - REST Client
  - Jest Runner
- **Postman** or **Insomnia** for API testing
- **pgAdmin** for PostgreSQL

### Logging and Monitoring
```javascript
// Use winston for logging
const logger = require('./utils/logger');

logger.info('User created successfully', { userId: user.id });
logger.error('Database connection failed', { error: err.message });
```

## 🔧 Performance and Optimization

### Best Practices
- Use appropriate database indexes
- Implement Redis cache for frequently accessed data
- Use pagination for large lists
- Optimize Sequelize queries (eager loading, etc.)

### Monitoring
- Monitor API response times
- Check memory and CPU usage
- Analyze PostgreSQL slow queries

## 🛡️ Security

### Security Principles
- **Never** expose secrets in code
- Validate all input data
- Use HTTPS in production
- Implement rate limiting
- Handle errors properly (no sensitive info)

### Vulnerability Reporting
If you discover a security vulnerability:
1. **Do not create a public issue**
2. Send an email to `security@aeli-services.cm`
3. Describe the vulnerability in detail
4. Wait for confirmation before disclosure

## 📚 Useful Resources

### Documentation
- [API Documentation](./docs/API.md)
- [Database Schema](./docs/DATABASE.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

### Tools
- [Postman Collection](./docs/AELI_Services_API.postman_collection.json)
- [Swagger UI](http://localhost:5000/api-docs) (during development)

## 🤝 Support

For any contribution questions:
- Create an issue on GitHub
- Contact the development team
- Check existing documentation

---

Thanks for contributing to AELI Services! 🎉
