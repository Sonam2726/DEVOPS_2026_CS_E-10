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

        stage('Run Tests') {
            steps {
                dir('client') {
                    bat 'npm test -- --reporter=verbose --reporter=junit --outputFile=test-results.xml'
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
        stage('Generate Feedback') {
    steps {
        powershell '''
        [xml]$report = Get-Content "client/test-results.xml"

        $total = [int]$report.testsuites.tests
        $failed = [int]$report.testsuites.failures
        $errors = [int]$report.testsuites.errors
        $skipped = [int]$report.testsuites.skipped

        $passed = $total - $failed - $errors - $skipped

        if (($failed + $errors) -eq 0) {
            $status = "PASS"
        } else {
            $status = "FAIL"
        }

        New-Item -ItemType Directory -Force -Path "feedback" | Out-Null

        $feedback = @"
# SkillBridge AI - Test Feedback

## Build Information

| Field | Value |
|---|---|
| Branch | $env:BRANCH_NAME |
| Build | #$env:BUILD_NUMBER |
| Commit | $env:GIT_COMMIT |
| Status | $status |

## Test Summary

| Result | Count |
|---|---:|
| Total | $total |
| Passed | $passed |
| Failed | $failed |
| Skipped | $skipped |
| Errors | $errors |

## Test Execution

Automated tests executed using Vitest through Jenkins CI.

## Result

**$status**

Generated automatically by Jenkins.
"@

        $feedback | Out-File "feedback/test-feedback.md" -Encoding utf8

        Write-Host ""
        Write-Host "======================================"
        Write-Host "        TEST FEEDBACK SUMMARY"
        Write-Host "======================================"
        Write-Host "Total   : $total"
        Write-Host "Passed  : $passed"
        Write-Host "Failed  : $failed"
        Write-Host "Skipped : $skipped"
        Write-Host "Errors  : $errors"
        Write-Host "Status  : $status"
        Write-Host "======================================"
        '''
    }
    }
    }

   post {
    always {
        junit 'client/test-results.xml'

        archiveArtifacts artifacts: 'feedback/test-feedback.md',
                         fingerprint: true

        echo "Build completed with status: ${currentBuild.currentResult}"
    }

    success {
        echo 'SkillBridge AI build successful!'
    }

    failure {
        echo 'SkillBridge AI build failed!'
    }
}
}