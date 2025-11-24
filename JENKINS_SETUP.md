# Jenkins Setup Guide

This guide will walk you through setting up Jenkins to run the CI/CD pipeline for the Jenkins Demo Application.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installing Jenkins](#installing-jenkins)
- [Required Plugins](#required-plugins)
- [Creating the Pipeline](#creating-the-pipeline)
- [Configuring Webhooks](#configuring-webhooks)
- [Environment Variables](#environment-variables)
- [Running Your First Build](#running-your-first-build)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

- Jenkins 2.400+ installed and running
- Docker installed on Jenkins server
- Git installed on Jenkins server
- Node.js 18+ installed on Jenkins server (or use Docker agent)

## 📥 Installing Jenkins

### Option 1: Docker (Recommended for Demo)

```bash
docker run -d \
  --name jenkins \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts
```

### Option 2: Local Installation

**Ubuntu/Debian:**
```bash
wget -q -O - https://pkg.jenkins.io/debian-stable/jenkins.io.key | sudo apt-key add -
sudo sh -c 'echo deb https://pkg.jenkins.io/debian-stable binary/ > /etc/apt/sources.list.d/jenkins.list'
sudo apt-get update
sudo apt-get install jenkins
```

**macOS:**
```bash
brew install jenkins-lts
brew services start jenkins-lts
```

**Windows:**
Download the installer from [jenkins.io](https://www.jenkins.io/download/)

### Initial Setup

1. Access Jenkins at `http://localhost:8080`
2. Retrieve the initial admin password:
   ```bash
   # Docker
   docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
   
   # Local installation
   cat /var/lib/jenkins/secrets/initialAdminPassword
   ```
3. Install suggested plugins
4. Create your first admin user

## 🔌 Required Plugins

Install the following plugins through **Manage Jenkins → Manage Plugins → Available**:

### Essential Plugins

1. **Pipeline** - For pipeline support (usually pre-installed)
2. **Git** - For Git repository integration (usually pre-installed)
3. **Docker Pipeline** - For Docker operations in pipeline
4. **HTML Publisher** - For publishing coverage reports
5. **JUnit** - For test result publishing

### Optional but Recommended

6. **Blue Ocean** - Modern UI for pipelines
7. **GitHub Integration** - If using GitHub
8. **Email Extension** - For email notifications
9. **Slack Notification** - For Slack notifications
10. **NodeJS** - For managing Node.js installations

### Installing Plugins

```
Manage Jenkins → Manage Plugins → Available tab
Search for each plugin → Check the box → Click "Install without restart"
```
ok
## 🚀 Creating the Pipeline

### Method 1: Pipeline from SCM (Recommended)

1. Click **New Item**
2. Enter name: `jenkins-demo-app`
3. Select **Pipeline** and click **OK**
4. Under **Pipeline** section:
   - Definition: **Pipeline script from SCM**
   - SCM: **Git**
   - Repository URL: `<your-repository-url>`
   - Branch: `*/main` (or your default branch)
   - Script Path: `Jenkinsfile`
5. Click **Save**

### Method 2: Direct Pipeline Script

1. Click **New Item**
2. Enter name: `jenkins-demo-app`
3. Select **Pipeline** and click **OK**
4. Under **Pipeline** section:
   - Definition: **Pipeline script**
   - Copy and paste the contents of `Jenkinsfile`
5. Click **Save**

## 🔗 Configuring Webhooks

### GitHub Webhook

1. Go to your GitHub repository
2. Navigate to **Settings → Webhooks → Add webhook**
3. Configure:
   - Payload URL: `http://<jenkins-url>:8080/github-webhook/`
   - Content type: `application/json`
   - Events: **Just the push event**
4. Click **Add webhook**

### GitLab Webhook

1. Go to your GitLab project
2. Navigate to **Settings → Webhooks**
3. Configure:
   - URL: `http://<jenkins-url>:8080/project/<job-name>`
   - Trigger: **Push events**
4. Click **Add webhook**

### Jenkins Configuration

1. In your pipeline job, click **Configure**
2. Under **Build Triggers**, check:
   - **GitHub hook trigger for GITScm polling** (for GitHub)
   - **Build when a change is pushed to GitLab** (for GitLab)
3. Click **Save**

## 🔐 Environment Variables

### Setting Global Environment Variables

1. Go to **Manage Jenkins → Configure System**
2. Scroll to **Global properties**
3. Check **Environment variables**
4. Add variables:
   - `NODE_VERSION`: `18`
   - `APP_NAME`: `jenkins-demo-app`

### Setting Job-Specific Variables

1. In your pipeline job, click **Configure**
2. Under **Pipeline**, you can add environment variables in the `environment` block of the Jenkinsfile

### Using Credentials

For sensitive data (API keys, passwords):

1. Go to **Manage Jenkins → Manage Credentials**
2. Click **(global)** domain
3. Click **Add Credentials**
4. Select type (e.g., **Secret text**, **Username with password**)
5. Add ID and value
6. Use in Jenkinsfile:
   ```groovy
   environment {
       API_KEY = credentials('api-key-id')
   }
   ```

## ▶️ Running Your First Build

### Manual Build

1. Open your pipeline job
2. Click **Build Now**
3. Watch the build progress in **Build History**
4. Click on the build number to see details
5. View **Console Output** for logs

### Automatic Build (via Webhook)

1. Make a change to your code
2. Commit and push to your repository
3. Jenkins will automatically trigger a build
4. Monitor the build in Jenkins UI

## 🎨 Using Blue Ocean (Optional)

Blue Ocean provides a modern, visual interface for pipelines:

1. Install **Blue Ocean** plugin
2. Click **Open Blue Ocean** in Jenkins sidebar
3. View your pipeline with visual stages
4. Click on stages to see logs and details

## 📊 Viewing Reports

### Test Results

After a build completes:
1. Click on the build number
2. Click **Test Result**
3. View passed/failed tests

### Coverage Report

After a build completes:
1. Click on the build number
2. Click **Coverage Report** in the sidebar
3. View detailed coverage metrics

## 🐛 Troubleshooting

### Issue: "docker: command not found"

**Solution:**
```bash
# Add Jenkins user to docker group
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Issue: "npm: command not found"

**Solution 1:** Install NodeJS plugin
1. **Manage Jenkins → Global Tool Configuration**
2. Add **NodeJS** installation
3. Update Jenkinsfile to use NodeJS tool:
   ```groovy
   tools {
       nodejs "NodeJS 18"
   }
   ```

**Solution 2:** Install Node.js on Jenkins server
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Issue: "Permission denied" when running Docker

**Solution:**
```bash
# Give Jenkins user permission to access Docker socket
sudo chmod 666 /var/run/docker.sock
```

### Issue: Pipeline fails at "Publish HTML" step

**Solution:**
1. Go to **Manage Jenkins → Script Console**
2. Run:
   ```groovy
   System.setProperty("hudson.model.DirectoryBrowserSupport.CSP", "")
   ```
3. Restart Jenkins

### Issue: Webhook not triggering builds

**Solution:**
1. Check webhook delivery in GitHub/GitLab settings
2. Verify Jenkins URL is accessible from internet
3. Check Jenkins logs: **Manage Jenkins → System Log**
4. Ensure firewall allows incoming connections on port 8080

### Issue: Tests fail in Jenkins but pass locally

**Solution:**
1. Check Node.js version matches
2. Verify environment variables are set
3. Clear npm cache in pipeline:
   ```groovy
   sh 'npm cache clean --force'
   sh 'rm -rf node_modules package-lock.json'
   sh 'npm install'
   ```

## 📚 Pipeline Stages Explained

### For Students: Understanding Each Stage

#### 1. Checkout
```groovy
stage('Checkout') {
    steps {
        checkout scm
    }
}
```
- **Purpose**: Gets the latest code from Git
- **Why**: Ensures we're building the latest version
- **Teaching Point**: Version control integration

#### 2. Install Dependencies
```groovy
stage('Install Dependencies') {
    steps {
        sh 'npm ci'
    }
}
```
- **Purpose**: Installs all required packages
- **Why**: `npm ci` is faster and more reliable than `npm install` for CI
- **Teaching Point**: Dependency management

#### 3. Lint
```groovy
stage('Lint') {
    steps {
        sh 'npm run lint'
    }
}
```
- **Purpose**: Checks code quality and style
- **Why**: Catches errors early, enforces standards
- **Teaching Point**: Code quality automation

#### 4. Test
```groovy
stage('Test') {
    steps {
        sh 'npm test'
    }
}
```
- **Purpose**: Runs automated tests
- **Why**: Ensures code works as expected
- **Teaching Point**: Automated testing importance

#### 5. Build Docker Image
```groovy
stage('Build Docker Image') {
    steps {
        script {
            docker.build("${APP_NAME}:${BUILD_NUMBER}")
        }
    }
}
```
- **Purpose**: Creates a containerized version
- **Why**: Ensures consistency across environments
- **Teaching Point**: Containerization benefits

#### 6. Deploy
```groovy
stage('Deploy to Staging') {
    when {
        branch 'develop'
    }
    steps {
        // Deployment steps
    }
}
```
- **Purpose**: Deploys to staging environment
- **Why**: Test in production-like environment
- **Teaching Point**: Environment separation

## 🎓 Teaching Tips

### Demonstrating CI/CD Concepts

1. **Show a failing test**
   - Modify a test to fail
   - Push code
   - Show how pipeline catches it

2. **Show linting in action**
   - Add code with style issues
   - Show how pipeline rejects it
   - Fix and show success

3. **Demonstrate rollback**
   - Deploy a "bad" version
   - Show how to revert to previous build

4. **Show environment differences**
   - Deploy to staging
   - Show manual approval for production
   - Explain why this is important

### Discussion Points

- Why automate testing?
- What happens if we skip the lint stage?
- Why use Docker for deployment?
- What's the difference between staging and production?
- How does CI/CD improve software quality?

## 📖 Additional Resources

- [Jenkins Pipeline Documentation](https://www.jenkins.io/doc/book/pipeline/)
- [Jenkins Docker Documentation](https://www.jenkins.io/doc/book/installing/docker/)
- [Pipeline Syntax Reference](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [Jenkins Best Practices](https://www.jenkins.io/doc/book/pipeline/pipeline-best-practices/)

## 🆘 Getting Help

- [Jenkins Community Forums](https://community.jenkins.io/)
- [Stack Overflow - Jenkins Tag](https://stackoverflow.com/questions/tagged/jenkins)
- [Jenkins IRC Channel](https://www.jenkins.io/chat/)
