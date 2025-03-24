#!/usr/bin/env node

/**
 * Generate Commit Info Script
 * 
 * This script generates a JSON file with information about the latest commit.
 * It's designed to be run as part of the build process to provide version information
 * to the frontend application.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const packageJson = require('./package.json');

// Function to execute git commands safely
function execGitCommand(command) {
    try {
        return execSync(command, { encoding: 'utf8' }).trim();
    } catch (error) {
        console.error(`Error executing git command: ${command}`);
        console.error(error);
        return null;
    }
}

// Function to get environment variables for Vercel deployment
function getVercelEnv() {
    const isVercel = process.env.VERCEL === '1';
    if (!isVercel) return null;

    return {
        commitHash: process.env.VERCEL_GIT_COMMIT_SHA ? process.env.VERCEL_GIT_COMMIT_SHA.substring(0, 7) : null,
        commitDate: process.env.VERCEL_GIT_COMMIT_MESSAGE ? new Date().toISOString() : null,
        branch: process.env.VERCEL_GIT_COMMIT_REF || null
    };
}

// Check if we're in Vercel environment
const vercelEnv = getVercelEnv();

// Get git information - use Vercel env vars if available
let commitHash, commitDate, branch;

if (vercelEnv) {
    console.log('Running in Vercel environment, using Vercel environment variables');
    commitHash = vercelEnv.commitHash;
    commitDate = vercelEnv.commitDate;
    branch = vercelEnv.branch;
} else {
    commitHash = execGitCommand('git rev-parse --short HEAD');
    // Get the commit date in a format that includes the original time zone
    // Use --date=iso-local to get the date in the local time zone of the commit
    commitDate = execGitCommand('git log -1 --format=%cd --date=iso-local');
    branch = execGitCommand('git rev-parse --abbrev-ref HEAD');
}

// Create commit info object
const commitInfo = {
    version: packageJson.version,
    hash: commitHash || 'unknown',
    date: commitDate || new Date().toISOString(),
    branch: branch || 'unknown'
};

// Write to JSON file
const outputPath = path.join(__dirname, 'commit-info.json');
fs.writeFileSync(outputPath, JSON.stringify(commitInfo, null, 2));

// Create a version.js file that sets the version in the window object
const versionJsContent = `// Auto-generated file - DO NOT EDIT
window.APP_VERSION = '${packageJson.version}';
`;
const versionJsPath = path.join(__dirname, 'version.js');
fs.writeFileSync(versionJsPath, versionJsContent);

console.log(`Commit info generated at ${outputPath}`);
console.log(`Version JS generated at ${versionJsPath}`);
console.log(`Version: ${commitInfo.version}`);
console.log(`Commit: ${commitInfo.hash}`);
console.log(`Date: ${commitInfo.date}`);
console.log(`Branch: ${commitInfo.branch}`);
