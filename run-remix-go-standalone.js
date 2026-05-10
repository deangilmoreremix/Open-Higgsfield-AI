#!/usr/bin/env node

/**
 * Standalone remix-go runner
 * This script allows remix-go to run independently without workspace dependencies
 */

const { spawn } = require('child_process');
const path = require('path');

const remixGoDir = path.join(__dirname, 'apps', 'remix-go');

// Check if node_modules exists in remix-go
const fs = require('fs');
const remixGoNodeModules = path.join(remixGoDir, 'node_modules');

if (!fs.existsSync(remixGoNodeModules)) {
  console.log('Installing remix-go dependencies...');
  const installProcess = spawn('npm', ['install'], {
    cwd: remixGoDir,
    stdio: 'inherit'
  });

  installProcess.on('close', (code) => {
    if (code === 0) {
      console.log('Dependencies installed. Starting remix-go...');
      startRemixGo();
    } else {
      console.error('Failed to install dependencies');
      process.exit(1);
    }
  });
} else {
  startRemixGo();
}

function startRemixGo() {
  console.log('Starting remix-go development server...');
  const devProcess = spawn('npx', ['vite', '--port', '5173'], {
    cwd: remixGoDir,
    stdio: 'inherit'
  });

  devProcess.on('close', (code) => {
    console.log(`remix-go exited with code ${code}`);
  });
}