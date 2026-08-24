pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('client') {
                    bat 'npm ci'
                }
            }
        }

        stage('Build') {
            steps {
                dir('client') {
                    bat 'npm run build'
                }
            }
        }
    }

    post {
        success {
            echo 'SkillBridge AI build successful!'
        }

        failure {
            echo 'SkillBridge AI build failed!'
        }

        always {
            echo "Build completed with status: ${currentBuild.currentResult}"
        }
    }
}