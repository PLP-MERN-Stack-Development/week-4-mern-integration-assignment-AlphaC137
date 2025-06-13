// start-app.js - Script to start both client and server

const { spawn } = require('child_process');
const path = require('path');

console.log('Starting MERN Blog Application...');

// Start the server
const serverProcess = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'server'),
  shell: true,
  stdio: 'inherit',
});

// Start the client
const clientProcess = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'client'),
  shell: true,
  stdio: 'inherit',
});

// Handle server process events
serverProcess.on('error', (error) => {
  console.error('Server error:', error);
});

serverProcess.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  clientProcess.kill();
  process.exit(code);
});

// Handle client process events
clientProcess.on('error', (error) => {
  console.error('Client error:', error);
});

clientProcess.on('close', (code) => {
  console.log(`Client process exited with code ${code}`);
  if (serverProcess) serverProcess.kill();
  process.exit(code);
});

// Handle script termination
process.on('SIGINT', () => {
  console.log('Stopping all processes...');
  if (serverProcess) serverProcess.kill();
  if (clientProcess) clientProcess.kill();
  process.exit(0);
});

console.log('Both client and server are starting...');
console.log('Server will run on: http://localhost:5000');
console.log('Client will run on: http://localhost:5173');
