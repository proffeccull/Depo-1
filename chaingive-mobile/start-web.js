#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting ChainGive Web App...');

// Start Expo web development server
const expo = spawn('npx', ['expo', 'start', '--web', '--port', '8083', '--non-interactive'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

expo.on('error', (error) => {
  console.error('❌ Failed to start web app:', error);
  process.exit(1);
});

expo.on('close', (code) => {
  console.log(`📱 Web app process exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping web app...');
  expo.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Stopping web app...');
  expo.kill('SIGTERM');
});