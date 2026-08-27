// // pipeline {
// //     agent any

// //     stages {

// //         stage('Checkout') {
// //             steps {
// //                 checkout scm
// //             }
// //         }

// //         stage('Install Dependencies') {
// //             steps {
// //                 dir('client') {
// //                     bat 'npm ci'
// //                 }
// //             }
// //         }

// //         stage('Run Tests') {
// //             steps {
// //                 dir('client') {
// //                     bat 'npm test -- --reporter=verbose --reporter=junit --outputFile=test-results.xml'
// //                 }
// //             }
// //         }

// //         stage('Build') {
// //             steps {
// //                 dir('client') {
// //                     bat 'npm run build'
// //                 }
// //             }
// //         }
// //         stage('Generate Feedback') {
// //     steps {
// //         powershell '''
// //         [xml]$report = Get-Content "client/test-results.xml"

// //         $total = [int]$report.testsuites.tests
// //         $failed = [int]$report.testsuites.failures
// //         $errors = [int]$report.testsuites.errors
// //         $skipped = [int]$report.testsuites.skipped

// //         $passed = $total - $failed - $errors - $skipped

// //         if (($failed + $errors) -eq 0) {
// //             $status = "PASS"
// //         } else {
// //             $status = "FAIL"
// //         }

// //         New-Item -ItemType Directory -Force -Path "feedback" | Out-Null

// //         $feedback = @"
// // # SkillBridge AI - Test Feedback

// // ## Build Information

// // | Field | Value |
// // |---|---|
// // | Branch | $env:BRANCH_NAME |
// // | Build | #$env:BUILD_NUMBER |
// // | Commit | $env:GIT_COMMIT |
// // | Status | $status |

// // ## Test Summary

// // | Result | Count |
// // |---|---:|
// // | Total | $total |
// // | Passed | $passed |
// // | Failed | $failed |
// // | Skipped | $skipped |
// // | Errors | $errors |

// // ## Test Execution

// // Automated tests executed using Vitest through Jenkins CI.

// // ## Result

// // **$status**

// // Generated automatically by Jenkins.
// // "@

// //         $feedback | Out-File "feedback/test-feedback.md" -Encoding utf8

// //         Write-Host ""
// //         Write-Host "======================================"
// //         Write-Host "        TEST FEEDBACK SUMMARY"
// //         Write-Host "======================================"
// //         Write-Host "Total   : $total"
// //         Write-Host "Passed  : $passed"
// //         Write-Host "Failed  : $failed"
// //         Write-Host "Skipped : $skipped"
// //         Write-Host "Errors  : $errors"
// //         Write-Host "Status  : $status"
// //         Write-Host "======================================"
// //         '''
// //     }
// //     }
// //      stage('Push Feedback to GitHub') {
// //     steps {
// //         withCredentials([
// //             string(
// //                 credentialsId: 'projectSkillBridge-GitHub-PAT',
// //                 variable: 'GITHUB_TOKEN'
// //             )
// //         ]) {
// //             powershell '''
// //                 git config user.name "Jenkins"
// //                 git config user.email "jenkins@skillbridge.local"

// //                 git add feedback/test-feedback.md

// //                 git commit -m "Update automated test feedback" 2>$null

// //                 git fetch https://$env:GITHUB_TOKEN@github.com/Sonam2726/DEVOPS_2026_CS_E-10.git ci-feedback

// //                 git rebase FETCH_HEAD

// //                 git push https://$env:GITHUB_TOKEN@github.com/Sonam2726/DEVOPS_2026_CS_E-10.git HEAD:refs/heads/ci-feedback
// //             '''
// //         }
// //     }
// // }
// //     }

// //    post {
// //     always {
// //         junit 'client/test-results.xml'

// //         archiveArtifacts artifacts: 'feedback/test-feedback.md',
// //                          fingerprint: true

// //         echo "Build completed with status: ${currentBuild.currentResult}"
// //     }

// //     success {
// //         echo 'SkillBridge AI build successful!'
// //     }

// //     failure {
// //         echo 'SkillBridge AI build failed!'
// //     }
// // }
// // }
// pipeline {
//     agent any

//     stages {

//         stage('Checkout') {
//             steps {
//                 checkout scm
//             }
//         }

//         stage('Install Dependencies') {
//             steps {
//                 dir('client') {
//                     bat 'npm ci'
//                 }
//             }
//         }

//         stage('Run Tests') {
//             steps {
//                 dir('client') {
//                     bat 'npm test -- --reporter=verbose --reporter=junit --outputFile=test-results.xml'
//                 }
//             }
//         }

//         stage('Build') {
//             steps {
//                 dir('client') {
//                     bat 'npm run build'
//                 }
//             }
//         }

//         stage('Generate Feedback') {
//             steps {
//                 powershell '''
//                     New-Item -ItemType Directory -Force -Path feedback | Out-Null

//                     $xml = [xml](Get-Content "client/test-results.xml")

//                     $total = [int]$xml.testsuites.tests
//                     $failed = [int]$xml.testsuites.failures
//                     $errors = [int]$xml.testsuites.errors
//                     $skipped = [int]$xml.testsuites.skipped
//                     $passed = $total - $failed - $errors - $skipped

//                     if ($failed -eq 0 -and $errors -eq 0) {
//                         $status = "PASS"
//                     } else {
//                         $status = "FAIL"
//                     }

//                     $feedback = @"
// # SkillBridge AI - Automated Test Feedback

// ## Test Summary

// | Metric | Result |
// |---|---:|
// | Total Tests | $total |
// | Passed | $passed |
// | Failed | $failed |
// | Skipped | $skipped |
// | Errors | $errors |
// | Status | **$status** |

// ## Build Information

// - Jenkins Job: $env:JOB_NAME
// - Build Number: $env:BUILD_NUMBER
// - Branch: $env:BRANCH_NAME
// - Commit: $env:GIT_COMMIT

// ## Test Report

// JUnit test results were generated by Vitest.

// The detailed test report is available in Jenkins under the **Tests** section.

// ## Result

// **$status**

// Generated automatically by Jenkins CI.
// "@

//                     Set-Content -Path "feedback/test-feedback.md" -Value $feedback
//                 '''
//             }
//         }

//         stage('Push Feedback to GitHub') {
//             steps {
//                 withCredentials([
//                     string(
//                         credentialsId: 'projectSkillBridge-GitHub-PAT',
//                         variable: 'GITHUB_TOKEN'
//                     )
//                 ]) {
//                     powershell '''
//                         git config user.name "Jenkins"
//                         git config user.email "jenkins@skillbridge.local"

//                         $repo = "https://$env:GITHUB_TOKEN@github.com/Sonam2726/DEVOPS_2026_CS_E-10.git"

//                         git fetch $repo ci-feedback

//                         git checkout -B ci-feedback FETCH_HEAD

//                         git add feedback/test-feedback.md

//                         git diff --cached --quiet
//                         if ($LASTEXITCODE -ne 0) {
//                             git commit -m "Update automated test feedback"
//                         }

//                         git push $repo HEAD:refs/heads/ci-feedback
//                     '''
//                 }
//             }
//         }
//     }

//     post {

//         always {
//             junit 'client/test-results.xml'

//             archiveArtifacts artifacts: 'feedback/test-feedback.md',
//                              fingerprint: true,
//                              allowEmptyArchive: true

//             echo "Build completed with status: ${currentBuild.currentResult}"
//         }

//         success {
//             echo 'SkillBridge AI build successful!'
//         }

//         failure {
//             echo 'SkillBridge AI build failed!'
//         }
//     }
// }



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
                    New-Item -ItemType Directory -Force -Path "feedback" | Out-Null

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
                            $testStatus = "PASS"

                            if ($null -ne $test.failure -or $null -ne $test.error) {
                                $testStatus = "FAIL"
                            }
                            elseif ($null -ne $test.skipped) {
                                $testStatus = "SKIPPED"
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

        stage('Push Feedback to GitHub') {
            steps {
                withCredentials([
                    string(
                        credentialsId: 'projectSkillBridge-GitHub-PAT',
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

                        if (-not (Test-Path (Split-Path $feedbackFile))) {
                            New-Item -ItemType Directory -Force -Path (Split-Path $feedbackFile) | Out-Null
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

                        // $newFeedback = Get-Content `
                        //     $newFeedbackFile `
                        //     -Raw

                        // Add-Content `
                        //     -Path $feedbackFile `
                        //     -Value $newFeedback `
                        //     -Encoding utf8
                        //changes
                        $oldContent = ""

                        if (Test-Path $feedbackFile) {
                            $oldContent = Get-Content $feedbackFile -Raw
                        }

                        $newFeedback = Get-Content $newFeedbackFile -Raw

                        $combined = @"
                        $oldContent

                        $newFeedback
                        "@

                        Set-Content `
                            -Path $feedbackFile `
                            -Value $combined `
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

        failure {
            echo 'SkillBridge AI build failed!'
        }
    }
}