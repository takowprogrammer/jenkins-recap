# Jenkins Demo Application

A simple Node.js REST API application designed to demonstrate CI/CD concepts with Jenkins. This project is perfect for teaching students about continuous integration, continuous deployment, automated testing, and containerization.

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [API Endpoints](#api-endpoints)
- [Running Tests](#running-tests)
- [Docker](#docker)
- [Jenkins Pipeline](#jenkins-pipeline)
- [CI/CD Concepts Demonstrated](#cicd-concepts-demonstrated)

## ✨ Features

- **RESTful API** with CRUD operations for user management
- **Automated Testing** with Jest (unit and integration tests)
- **Code Quality** checks with ESLint
- **Containerization** with Docker
- **CI/CD Pipeline** with Jenkins
- **Health Check** endpoint for monitoring
- **Test Coverage** reporting

## 🔧 Prerequisites

- Node.js 18+ and npm 9+
- Docker (optional, for containerization)
- Jenkins (for CI/CD pipeline)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run the Application

```bash
npm start
```

The server will start on `http://localhost:3000`

### 3. Verify It's Running

```bash
curl http://localhost:3000/health
```

## 📡 API Endpoints

### Root
- **GET** `/` - API information and available endpoints

### Health Check
- **GET** `/health` - Application health status

### Users
- **GET** `/api/users` - Get all users
- **GET** `/api/users/:id` - Get user by ID
- **POST** `/api/users` - Create new user
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com"
  }
  ```
- **PUT** `/api/users/:id` - Update user
- **DELETE** `/api/users/:id` - Delete user

### Example Usage

```bash
# Get all users
curl http://localhost:3000/api/users

# Create a new user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice Smith","email":"alice@example.com"}'

# Get specific user
curl http://localhost:3000/api/users/1

# Update user
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice Johnson"}'

# Delete user
curl -X DELETE http://localhost:3000/api/users/1
```

## 🧪 Running Tests

### Run All Tests
```bash
npm test
```

### Run Unit Tests Only
```bash
npm run test:unit
```

### Run Integration Tests Only
```bash
npm run test:integration
```

### Run Linting
```bash
npm run lint
```

### Fix Linting Issues
```bash
npm run lint:fix
```

## 🐳 Docker

### Build Docker Image
```bash
docker build -t jenkins-demo-app .
```

### Run Container
```bash
docker run -d -p 3000:3000 --name jenkins-demo jenkins-demo-app
```

### Stop Container
```bash
docker stop jenkins-demo
docker rm jenkins-demo
```

### Health Check
The Docker container includes a built-in health check that runs every 30 seconds.

## 🔄 Jenkins Pipeline

The project includes a comprehensive `Jenkinsfile` that demonstrates a complete CI/CD pipeline with the following stages:

### Pipeline Stages

1. **Checkout** - Retrieves source code from version control
2. **Install Dependencies** - Installs npm packages
3. **Lint** - Runs ESLint to check code quality
4. **Test** - Runs all tests with coverage reporting
5. **Build Docker Image** - Creates containerized application
6. **Deploy to Staging** - Deploys to staging environment (develop branch)
7. **Deploy to Production** - Deploys to production with manual approval (main branch)

### Setting Up Jenkins

See [JENKINS_SETUP.md](JENKINS_SETUP.md) for detailed instructions on:
- Installing required Jenkins plugins
- Configuring the pipeline
- Setting up webhooks
- Managing credentials
- Troubleshooting common issues

## 🎓 CI/CD Concepts Demonstrated

This project demonstrates the following CI/CD concepts:

### 1. **Continuous Integration (CI)**
- Automated builds triggered by code commits
- Automated testing on every build
- Code quality checks with linting
- Fast feedback on code changes

### 2. **Continuous Deployment (CD)**
- Automated deployment to staging environment
- Manual approval gate for production
- Environment-specific configurations
- Container-based deployments

### 3. **Testing Pyramid**
- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test complete user workflows
- **Coverage Reports**: Ensure adequate test coverage

### 4. **Code Quality**
- Automated linting with ESLint
- Consistent code style enforcement
- Quality gates in the pipeline

### 5. **Containerization**
- Docker multi-stage builds
- Security best practices (non-root user)
- Health checks for monitoring
- Reproducible environments

### 6. **Pipeline as Code**
- Version-controlled pipeline definition
- Declarative pipeline syntax
- Reusable pipeline stages
- Environment-specific deployments

## 📁 Project Structure

```
jenkins-recap/
├── src/
│   ├── app.js              # Express application
│   ├── server.js           # Server entry point
│   └── routes/
│       └── users.js        # User routes
├── tests/
│   ├── unit/
│   │   └── app.test.js     # Unit tests
│   └── integration/
│       └── api.test.js     # Integration tests
├── .eslintrc.json          # ESLint configuration
├── .dockerignore           # Docker ignore rules
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
├── Dockerfile              # Docker configuration
├── Jenkinsfile             # Jenkins pipeline definition
├── jest.config.js          # Jest configuration
├── package.json            # Project dependencies
└── README.md               # This file
```

## 🎯 Learning Objectives

After working with this project, students should understand:

1. How to structure a Node.js REST API
2. How to write unit and integration tests
3. How to implement code quality checks
4. How to containerize an application with Docker
5. How to create a Jenkins pipeline
6. How CI/CD improves software delivery
7. How to implement environment-specific deployments
8. How to use health checks for monitoring

## 🤝 Contributing

This is a demo project for educational purposes. Feel free to fork and modify for your own teaching needs.

## 📝 License

MIT License - feel free to use this project for educational purposes.

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000
# Kill the process
kill -9 <PID>
```

### Tests Failing
```bash
# Clear Jest cache
npx jest --clearCache
# Run tests again
npm test
```

### Docker Build Issues
```bash
# Clean Docker cache
docker system prune -a
# Rebuild image
docker build --no-cache -t jenkins-demo-app .
```

## 📚 Additional Resources

- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Docker Documentation](https://docs.docker.com/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [ESLint Documentation](https://eslint.org/docs/latest/)
