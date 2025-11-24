# Jenkinsfile Explained

This document provides a detailed, line-by-line explanation of the Jenkinsfile used in the Jenkins Demo Application. This is designed to help students understand each component of the CI/CD pipeline.

## 📋 Table of Contents

- [Pipeline Overview](#pipeline-overview)
- [Pipeline Structure](#pipeline-structure)
- [Detailed Breakdown](#detailed-breakdown)
- [Stage Explanations](#stage-explanations)
- [Best Practices Demonstrated](#best-practices-demonstrated)

## 🎯 Pipeline Overview

The Jenkinsfile defines a **declarative pipeline** with the following stages:

1. **Checkout** - Get code from version control
2. **Install Dependencies** - Install Node.js packages
3. **Lint** - Check code quality
4. **Test** - Run automated tests with coverage
5. **Build Docker Image** - Create container image
6. **Deploy to Staging** - Deploy to staging environment (develop branch only)
7. **Deploy to Production** - Deploy to production with manual approval (main branch only)

## 📐 Pipeline Structure

```groovy
pipeline {
    agent any
    environment { }
    stages { }
    post { }
}
```

This is the basic structure of a declarative Jenkins pipeline.

## 🔍 Detailed Breakdown

### 1. Pipeline Declaration

```groovy
pipeline {
    agent any
```

**Explanation:**
- `pipeline` - Declares this is a declarative pipeline
- `agent any` - Run on any available Jenkins agent/node
  - In a multi-node setup, Jenkins will choose any available executor
  - For single-node setups, it runs on the master

**Teaching Point:** In production, you might use `agent { label 'docker' }` to run on specific nodes with Docker installed.

---

### 2. Environment Variables

```groovy
environment {
    NODE_VERSION = '18'
    APP_NAME = 'jenkins-demo-app'
}
```

**Explanation:**
- Defines variables available to all stages
- `NODE_VERSION` - Specifies Node.js version for consistency
- `APP_NAME` - Application name used in Docker commands

**Teaching Point:** Environment variables make pipelines reusable and maintainable. Change once, affects everywhere.

**How to use in stages:**
```groovy
echo "Building ${APP_NAME}"  // Outputs: Building jenkins-demo-app
```

---

### 3. Stage: Checkout

```groovy
stage('Checkout') {
    steps {
        echo 'Checking out source code...'
        checkout scm
    }
}
```

**Explanation:**
- `stage('Checkout')` - Names the stage (visible in Jenkins UI)
- `echo` - Prints message to console log
- `checkout scm` - Checks out code from Source Control Management (Git)
  - `scm` is automatically configured when you set up the pipeline from Git

**Teaching Point:** This is often the first stage. It ensures we have the latest code.

**What happens:**
1. Jenkins connects to your Git repository
2. Clones or pulls the latest code
3. Switches to the correct branch
4. Makes code available to subsequent stages

---

### 4. Stage: Install Dependencies

```groovy
stage('Install Dependencies') {
    steps {
        echo 'Installing Node.js dependencies...'
        sh 'npm ci'
    }
}
```

**Explanation:**
- `sh 'npm ci'` - Executes shell command
- `npm ci` - Clean install (faster and more reliable than `npm install`)
  - Deletes `node_modules` if it exists
  - Installs exact versions from `package-lock.json`
  - Fails if `package-lock.json` is out of sync

**Teaching Point:** `npm ci` is preferred in CI/CD because it's deterministic and faster.

**Why not `npm install`?**
- `npm install` can update `package-lock.json`
- `npm ci` is stricter and faster for CI environments

---

### 5. Stage: Lint

```groovy
stage('Lint') {
    steps {
        echo 'Running ESLint...'
        sh 'npm run lint'
    }
}
```

**Explanation:**
- Runs ESLint to check code quality
- Executes the `lint` script from `package.json`
- Pipeline **fails** if linting errors are found

**Teaching Point:** This is a **quality gate**. Bad code doesn't proceed to testing.

**What it checks:**
- Code style consistency
- Common programming errors
- Best practice violations

**Demonstration idea:** Add poorly formatted code and show the pipeline fail at this stage.

---

### 6. Stage: Test

```groovy
stage('Test') {
    steps {
        echo 'Running tests with coverage...'
        sh 'npm test'
    }
    post {
        always {
            // Publish test results
            junit 'coverage/junit.xml'
            // Publish coverage report
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'coverage/lcov-report',
                reportFiles: 'index.html',
                reportName: 'Coverage Report'
            ])
        }
    }
}
```

**Explanation:**

**Main steps:**
- `sh 'npm test'` - Runs Jest tests with coverage

**Post-build actions (`post { always { } }`):**
- Runs **regardless** of test success or failure
- `junit 'coverage/junit.xml'` - Publishes test results to Jenkins
  - Shows test trends over time
  - Displays pass/fail statistics
- `publishHTML` - Publishes HTML coverage report
  - `allowMissing: false` - Fail if report doesn't exist
  - `alwaysLinkToLastBuild: true` - Easy access to latest report
  - `keepAll: true` - Keep reports from all builds
  - `reportDir` - Where the HTML report is located
  - `reportFiles` - Main HTML file to display
  - `reportName` - Name shown in Jenkins UI

**Teaching Point:** This demonstrates **test automation** and **visibility**. Jenkins shows test trends and coverage over time.

**Note:** The current `package.json` doesn't generate `junit.xml`. To add this, update `package.json`:
```json
"test": "jest --coverage --reporters=default --reporters=jest-junit"
```
And install: `npm install --save-dev jest-junit`

---

### 7. Stage: Build Docker Image

```groovy
stage('Build Docker Image') {
    steps {
        echo 'Building Docker image...'
        script {
            docker.build("${APP_NAME}:${BUILD_NUMBER}")
            docker.build("${APP_NAME}:latest")
        }
    }
}
```

**Explanation:**
- `script { }` - Allows scripted (Groovy) code in declarative pipeline
- `docker.build()` - Jenkins Docker Pipeline plugin method
- `${BUILD_NUMBER}` - Jenkins built-in variable (e.g., 42, 43, 44...)
- Creates **two tags**:
  - `jenkins-demo-app:42` - Specific version
  - `jenkins-demo-app:latest` - Latest version

**Teaching Point:** Tagging with build number enables **rollback** to specific versions.

**What happens:**
1. Jenkins reads the `Dockerfile`
2. Builds the Docker image
3. Tags it with build number and "latest"
4. Image is stored locally on Jenkins server

**Requirements:**
- Docker must be installed on Jenkins server
- Jenkins user must have Docker permissions

---

### 8. Stage: Deploy to Staging

```groovy
stage('Deploy to Staging') {
    when {
        branch 'develop'
    }
    steps {
        echo 'Deploying to staging environment...'
        script {
            // Stop existing container if running
            sh '''
                docker stop ${APP_NAME}-staging || true
                docker rm ${APP_NAME}-staging || true
            '''
            // Run new container
            sh '''
                docker run -d \
                    --name ${APP_NAME}-staging \
                    -p 3001:3000 \
                    -e NODE_ENV=staging \
                    ${APP_NAME}:${BUILD_NUMBER}
            '''
        }
    }
}
```

**Explanation:**

**Conditional execution:**
- `when { branch 'develop' }` - Only runs for the `develop` branch
- Pushes to `main` or other branches skip this stage

**Deployment steps:**

1. **Stop existing container:**
   ```groovy
   docker stop ${APP_NAME}-staging || true
   docker rm ${APP_NAME}-staging || true
   ```
   - `|| true` - Don't fail if container doesn't exist
   - Ensures clean deployment

2. **Run new container:**
   ```groovy
   docker run -d \
       --name ${APP_NAME}-staging \
       -p 3001:3000 \
       -e NODE_ENV=staging \
       ${APP_NAME}:${BUILD_NUMBER}
   ```
   - `-d` - Run in detached mode (background)
   - `--name` - Container name for easy management
   - `-p 3001:3000` - Map port 3001 (host) to 3000 (container)
   - `-e NODE_ENV=staging` - Set environment variable
   - Uses the specific build number tag

**Teaching Point:** This demonstrates **environment separation** and **automated deployment**.

**Access staging:** `http://localhost:3001`

---

### 9. Stage: Deploy to Production

```groovy
stage('Deploy to Production') {
    when {
        branch 'main'
    }
    steps {
        echo 'Deploying to production environment...'
        input message: 'Deploy to production?', ok: 'Deploy'
        script {
            // Stop existing container if running
            sh '''
                docker stop ${APP_NAME}-prod || true
                docker rm ${APP_NAME}-prod || true
            '''
            // Run new container
            sh '''
                docker run -d \
                    --name ${APP_NAME}-prod \
                    -p 3000:3000 \
                    -e NODE_ENV=production \
                    ${APP_NAME}:${BUILD_NUMBER}
            '''
        }
    }
}
```

**Explanation:**

**Key differences from staging:**

1. **Branch condition:**
   - `when { branch 'main' }` - Only runs for `main` branch

2. **Manual approval gate:**
   ```groovy
   input message: 'Deploy to production?', ok: 'Deploy'
   ```
   - **Pauses** the pipeline
   - Shows a prompt in Jenkins UI
   - Requires human approval to proceed
   - Prevents accidental production deployments

3. **Production port:**
   - `-p 3000:3000` - Standard port
   - `-e NODE_ENV=production` - Production environment

**Teaching Point:** This demonstrates **deployment safety** and **manual gates** for critical environments.

**Access production:** `http://localhost:3000`

---

### 10. Post-Build Actions

```groovy
post {
    success {
        echo 'Pipeline completed successfully!'
        // Send notification (configure email/Slack as needed)
    }
    failure {
        echo 'Pipeline failed!'
        // Send notification (configure email/Slack as needed)
    }
    always {
        // Clean up workspace
        cleanWs()
    }
}
```

**Explanation:**

**Post sections:**
- `success { }` - Runs only if pipeline succeeds
- `failure { }` - Runs only if pipeline fails
- `always { }` - Runs regardless of outcome

**Actions:**
- `cleanWs()` - Cleans the workspace (deletes files)
  - Saves disk space
  - Ensures clean state for next build

**Teaching Point:** Post-build actions are perfect for **notifications** and **cleanup**.

**Extension ideas:**
```groovy
success {
    emailext (
        subject: "Build Successful: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
        body: "Good news! The build succeeded.",
        to: "team@example.com"
    )
}
```

---

## 🎓 Best Practices Demonstrated

### 1. **Declarative Pipeline**
- Easier to read and maintain
- Built-in error handling
- Better for beginners

### 2. **Environment Variables**
- Centralized configuration
- Easy to modify
- Reusable across stages

### 3. **Quality Gates**
- Lint before test
- Test before build
- Build before deploy
- Each stage validates before proceeding

### 4. **Conditional Deployment**
- Different branches → different environments
- `develop` → staging (automatic)
- `main` → production (manual approval)

### 5. **Versioning**
- Docker images tagged with build number
- Enables rollback to any previous version

### 6. **Separation of Concerns**
- Each stage has a single responsibility
- Easy to debug failures
- Clear pipeline visualization

### 7. **Fail Fast**
- Lint errors stop the pipeline early
- Test failures prevent deployment
- Saves time and resources

### 8. **Visibility**
- Echo statements for logging
- Test result publishing
- Coverage reports
- Clear stage names

## 🔧 Customization Ideas

### Add Email Notifications

```groovy
post {
    failure {
        emailext (
            subject: "Build Failed: ${env.JOB_NAME}",
            body: "Build ${env.BUILD_NUMBER} failed. Check console output.",
            to: "team@example.com"
        )
    }
}
```

### Add Slack Notifications

```groovy
post {
    success {
        slackSend (
            color: 'good',
            message: "Build Successful: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
        )
    }
}
```

### Add Security Scanning

```groovy
stage('Security Scan') {
    steps {
        sh 'npm audit'
    }
}
```

### Add Performance Testing

```groovy
stage('Performance Test') {
    steps {
        sh 'npm run test:performance'
    }
}
```

## 📊 Jenkins Built-in Variables

These variables are automatically available in the pipeline:

- `${BUILD_NUMBER}` - Current build number (1, 2, 3...)
- `${BUILD_ID}` - Build ID (usually same as BUILD_NUMBER)
- `${JOB_NAME}` - Name of the job
- `${BUILD_URL}` - URL to the build
- `${WORKSPACE}` - Path to the workspace
- `${GIT_COMMIT}` - Git commit hash
- `${GIT_BRANCH}` - Git branch name
- `${NODE_NAME}` - Name of the node running the build

**Usage:**
```groovy
echo "Building ${JOB_NAME} #${BUILD_NUMBER}"
echo "Commit: ${GIT_COMMIT}"
```

## 🎯 Summary

This Jenkinsfile demonstrates a complete CI/CD pipeline with:

- ✅ Automated testing
- ✅ Code quality checks
- ✅ Containerization
- ✅ Environment-specific deployments
- ✅ Manual approval gates
- ✅ Proper versioning
- ✅ Clean workspace management

It follows industry best practices and provides a solid foundation for teaching CI/CD concepts to students.
