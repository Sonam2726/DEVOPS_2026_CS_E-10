pipeline {
    agent any

    options {
        disableConcurrentBuilds()
    }

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
                    script {
                        def testExitCode = bat(
                            script: 'npm test -- --reporter=verbose --reporter=junit --outputFile=test-results.xml',
                            returnStatus: true
                        )

                        if (testExitCode != 0) {
                            echo "Some tests failed. Continuing so feedback can be generated."
                            currentBuild.result = 'UNSTABLE'
                        }
                    }
                }
            }
        }

        stage('Build') {
            steps {
                dir('client') {
                    script {
                        def buildExitCode = bat(
                            script: 'npm run build',
                            returnStatus: true
                        )

                        if (buildExitCode != 0) {
                            echo "Build failed."
                            currentBuild.result = 'FAILURE'
                        }
                    }
                }
            }
        }

        stage('Generate Feedback') {
            steps {
                powershell '''
                    New-Item -ItemType Directory -Force -Path "feedback" | Out-Null

                    if (-not (Test-Path "client/test-results.xml")) {
                        throw "JUnit test report was not generated."
                    }

                    [xml]$report = Get-Content "client/test-results.xml"

                    $total = [int]$report.testsuites.tests
                    $failed = [int]$report.testsuites.failures
                    $errors = [int]$report.testsuites.errors
                    $skipped = [int]$report.testsuites.skipped

                    $passed = $total - $failed - $errors - $skipped

                    if (($failed + $errors) -eq 0) {
                        $status = "PASS"
                    }
                    else {
                        $status = "FAIL"
                    }

                    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

                    $testRows = ""

                    foreach ($suite in $report.testsuites.testsuite) {

                        foreach ($test in $suite.testcase) {

                            $testName = [string]$test.name

                            if ([string]::IsNullOrWhiteSpace($testName)) {
                                $testName = "Unnamed Test"
                            }

                            if ($null -ne $test.failure -or $null -ne $test.error) {
                                $testStatus = "FAIL"
                            }
                            elseif ($null -ne $test.skipped) {
                                $testStatus = "SKIPPED"
                            }
                            else {
                                $testStatus = "PASS"
                            }

                            $testRows += "| $testName | $testStatus |`n"
                        }
                    }

                    $newFeedback = @"
---

## Build #$env:BUILD_NUMBER

**Date:** $timestamp  
**Jenkins Job:** $env:JOB_NAME  
**Branch:** $env:BRANCH_NAME  
**Commit:** $env:GIT_COMMIT  
**Overall Status:** **$status**

### Test Summary

| Metric | Count |
|---|---:|
| Total Tests | $total |
| Passed | $passed |
| Failed | $failed |
| Skipped | $skipped |
| Errors | $errors |

### Individual Test Cases

| Test Case | Status |
|---|---|
$testRows

### Test Execution

Automated tests were executed using Vitest through Jenkins CI.

---

"@

                    Set-Content `
                        -Path "feedback/current-build-feedback.md" `
                        -Value $newFeedback `
                        -Encoding utf8

                    Write-Host ""
                    Write-Host "======================================"
                    Write-Host "       TEST FEEDBACK SUMMARY"
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

        stage('Push Feedback to GitHub') {
            steps {
                withCredentials([
                    string(
                        credentialsId: 'SkillBridges-GitHub-PAT',
                        variable: 'GITHUB_TOKEN'
                    )
                ]) {
                    powershell '''
                        $repo = "https://$env:GITHUB_TOKEN@github.com/Sonam2726/DEVOPS_2026_CS_E-10.git"
                        $publishDir = "feedback-publish"

                        if (Test-Path $publishDir) {
                            Remove-Item -Recurse -Force $publishDir
                        }

                        Write-Host "Cloning ci-feedback branch..."

                        git clone --branch ci-feedback $repo $publishDir

                        if ($LASTEXITCODE -ne 0) {
                            throw "Unable to clone ci-feedback branch."
                        }

                        $feedbackFile = Join-Path $publishDir "feedback/test-feedback.md"
                        $newFeedbackFile = "feedback/current-build-feedback.md"

                        if (-not (Test-Path $newFeedbackFile)) {
                            throw "Generated feedback file was not found."
                        }

                        $feedbackDirectory = Split-Path $feedbackFile

                        if (-not (Test-Path $feedbackDirectory)) {
                            New-Item `
                                -ItemType Directory `
                                -Force `
                                -Path $feedbackDirectory | Out-Null
                        }

                        if (-not (Test-Path $feedbackFile)) {

                            Write-Host "Creating feedback history file..."

                            $header = @"
# SkillBridge AI - Automated Test Feedback History

This file contains the automated test results of Jenkins builds.

"@

                            Set-Content `
                                -Path $feedbackFile `
                                -Value $header `
                                -Encoding utf8
                        }

                        Write-Host "Appending new build feedback..."

                        $newFeedback = Get-Content `
                            -Path $newFeedbackFile `
                            -Raw

                        Add-Content `
                            -Path $feedbackFile `
                            -Value $newFeedback `
                            -Encoding utf8

                        Set-Location $publishDir

                        git config user.name "Jenkins"
                        git config user.email "jenkins@skillbridge.local"

                        git add feedback/test-feedback.md

                        git diff --cached --quiet

                        if ($LASTEXITCODE -ne 0) {

                            git commit -m "Update automated test feedback"

                            if ($LASTEXITCODE -ne 0) {
                                throw "Git commit failed."
                            }

                            git push origin ci-feedback

                            if ($LASTEXITCODE -ne 0) {
                                throw "Git push failed."
                            }

                            Write-Host "Feedback successfully pushed to ci-feedback."
                        }
                        else {
                            Write-Host "No feedback changes to commit."
                        }

                        Set-Location ..

                        Remove-Item `
                            -Recurse `
                            -Force `
                            $publishDir
                    '''
                }
            }
        }
    }

    post {

        always {
            junit 'client/test-results.xml'

            archiveArtifacts artifacts: 'feedback/current-build-feedback.md',
                             fingerprint: true,
                             allowEmptyArchive: true

            echo "Build completed with status: ${currentBuild.currentResult}"
        }

        success {
            echo 'SkillBridge AI build successful!'
        }

        unstable {
            echo 'SkillBridge AI build completed with test failures. Feedback was generated.'
        }

        failure {
            echo 'SkillBridge AI build failed!'
        }
    }
}