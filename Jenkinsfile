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
                sh 'npm ci'
            }
        }
        
        stage('Lint') {
            steps {
                echo 'Running ESLint...'
                sh 'npm run lint'
            }
        }
        
        stage('Test') {
            steps {
                echo 'Running tests with coverage...'
                sh 'npm test'
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
        
        // OPTIONAL: Uncomment this stage to push images to Docker Hub
        // To use this stage:
        // 1. Create a Docker Hub account at https://hub.docker.com
        // 2. In Jenkins, go to: Manage Jenkins → Manage Credentials
        // 3. Add credentials: Username with password
        //    - ID: dockerhub-credentials
        //    - Username: your Docker Hub username
        //    - Password: your Docker Hub password or access token
        // 4. Update APP_NAME to include your Docker Hub username (e.g., 'yourusername/jenkins-demo-app')
        // 5. Uncomment the stage below
        //
        // stage('Push to Docker Hub') {
        //     steps {
        //         echo 'Pushing Docker image to Docker Hub...'
        //         script {
        //             // Login to Docker Hub using credentials stored in Jenkins
        //             docker.withRegistry('https://registry.hub.docker.com', 'dockerhub-credentials') {
        //                 // Push both the build-specific and latest tags
        //                 docker.image("${APP_NAME}:${BUILD_NUMBER}").push()
        //                 docker.image("${APP_NAME}:latest").push()
        //             }
        //         }
        //     }
        // }
        
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
        
        stage('Deploy to Production') {
            when {
                branch 'master'
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
