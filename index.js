const express = require('express');
const http = require('http');
const path = require('path');
const os = require('os');
const pty = require('node-pty');

const app = express();
const server = http.createServer(app);

// Initialize express-ws
const expressWs = require('express-ws')(app, server);

const port = 3000;

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route for the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// WebSocket endpoint for terminal
expressWs.app.ws('/terminals/', (ws, req) => {
  console.log('WebSocket connection established');

  // Determine shell based on OS
  const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

  // Spawn a pty process
  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    // Initial size, will be updated by client
    cols: 80, 
    rows: 24,
    cwd: process.env.HOME, // Or any other starting directory
    env: process.env
  });

  console.log(`PTY process created (PID: ${ptyProcess.pid}) for shell: ${shell}`);

  // Pipe data from PTY to WebSocket
  ptyProcess.onData(data => {
    try {
      if (ws.readyState === 1 /* WebSocket.OPEN */) {
        ws.send(data);
      }
    } catch (e) {
      console.error('Error sending data to WebSocket:', e);
    }
  });

  // Handle incoming messages from WebSocket
  ws.on('message', (messageString) => { // messageString is the raw string from client
    try {
      const message = JSON.parse(messageString); // Parse the string
      if (message.type === 'data') {
        ptyProcess.write(message.data);
      } else if (message.type === 'resize') {
        if (message.cols && message.rows) {
          ptyProcess.resize(message.cols, message.rows);
          console.log(`PTY resized to ${message.cols}x${message.rows}`);
        }
      }
    } catch (e) {
        console.log("Received non-JSON message or error parsing JSON from string: ", messageString, e);
        // If client somehow sends non-JSON string, can write directly:
        // ptyProcess.write(messageString);
    }
  });

  // Handle PTY exit
  ptyProcess.onExit(({ exitCode, signal }) => {
    console.log(`PTY process (PID: ${ptyProcess.pid}) exited with code ${exitCode}, signal ${signal}`);
    // Ensure WebSocket is closed if PTY exits
    if (ws.readyState === 1 /* WebSocket.OPEN */ || ws.readyState === 0 /* WebSocket.CONNECTING */) {
      ws.close();
    }
  });

  // Handle WebSocket close
  ws.on('close', () => {
    console.log('WebSocket connection closed. Killing PTY process.');
    // Kill the PTY process when the WebSocket connection closes
    ptyProcess.kill();
    console.log(`PTY process (PID: ${ptyProcess.pid}) killed.`);
  });

  // Handle WebSocket error
  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
    // Kill the PTY process in case of WebSocket error
    if (ptyProcess && !ptyProcess.killed) { // Check if ptyProcess exists and is not already killed
        ptyProcess.kill();
        console.log(`PTY process (PID: ${ptyProcess.pid}) killed due to WebSocket error.`);
    }
  });
});

server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
