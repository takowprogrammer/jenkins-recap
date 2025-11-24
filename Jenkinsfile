pipeline {
    agent any
    
    environment {
        NODE_VERSION = '18'
        APP_NAME = 'jenkins-demo-app'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo 'Installing Node.js dependencies...'
                bat 'npm ci'
            }
        }
        
        stage('Lint') {
            steps {
                echo 'Running ESLint...'
                bat 'npm run lint'
            }
        }
        
        stage('Test') {
            steps {
                echo 'Running tests with coverage...'
                bat 'npm test'
            }
            post {
                always {
                    // Publish test results (optional - requires jest-junit)
                    // junit 'coverage/junit.xml'
                    // Publish coverage report (optional - requires HTML Publisher plugin)
                    // publishHTML([
                    //     allowMissing: false,
                    //     alwaysLinkToLastBuild: true,
                    //     keepAll: true,
                    //     reportDir: 'coverage/lcov-report',
                    //     reportFiles: 'index.html',
                    //     reportName: 'Coverage Report'
                    // ])
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                script {
                    docker.build("${APP_NAME}:${BUILD_NUMBER}")
                    docker.build("${APP_NAME}:latest")
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                echo 'Deploying to staging environment...'
                script {
                    // Stop existing container if running
                    bat '''
                        docker stop %APP_NAME%-staging || exit 0
                        docker rm %APP_NAME%-staging || exit 0
                    '''
                    // Run new container
                    bat '''
                        docker run -d ^
                            --name %APP_NAME%-staging ^
                            -p 3001:3000 ^
                            -e NODE_ENV=staging ^
                            %APP_NAME%:%BUILD_NUMBER%
                    '''
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                echo 'Deploying to production environment...'
                input message: 'Deploy to production?', ok: 'Deploy'
                script {
                    // Stop existing container if running
                    bat '''
                        docker stop %APP_NAME%-prod || exit 0
                        docker rm %APP_NAME%-prod || exit 0
                    '''
                    // Run new container
                    bat '''
                        docker run -d ^
                            --name %APP_NAME%-prod ^
                            -p 3000:3000 ^
                            -e NODE_ENV=production ^
                            %APP_NAME%:%BUILD_NUMBER%
                    '''
                }
            }
        }
    }
    
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
}
