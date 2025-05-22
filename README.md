# Web Terminal Emulator

This is a simple web-based terminal emulator using Node.js, Express, WebSockets, and xterm.js. It allows you to run a shell (like bash or PowerShell) in your browser.

## Features

- Real-time terminal interaction via WebSockets.
- Uses `node-pty` to spawn pseudo-terminals on the server.
- Frontend terminal rendering with `xterm.js`.
- Terminal automatically resizes to fit the browser window.

## Prerequisites

- [Node.js](https://nodejs.org/) (version 14.x or later recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

## Setup and Installation

1.  **Clone the repository (if applicable) or download the files.**
    ```bash
    # Example if it were a git repo
    # git clone <repository-url>
    # cd web-terminal-emulator
    ```

2.  **Install dependencies:**
    Navigate to the project's root directory in your terminal and run:
    ```bash
    npm install
    ```
    This will install `express`, `express-ws`, and `node-pty` as listed in `package.json`.

## Running the Application

1.  **Start the server:**
    From the project's root directory, run:
    ```bash
    node index.js
    ```
    Alternatively, you can add a start script to your `package.json`:
    ```json
    // In package.json, under "scripts":
    // "start": "node index.js"
    ```
    And then run:
    ```bash
    npm start
    ```

2.  **Open in browser:**
    Once the server is running, it will typically output:
    `Server listening on http://localhost:3000`
    Open your web browser and navigate to [http://localhost:3000](http://localhost:3000).

You should see a full-page terminal emulator.

## How it Works

-   The **Express server** (`index.js`) serves the static `index.html` page and handles WebSocket connections.
-   When a client connects via WebSocket to the `/terminals/` endpoint, the server spawns a **pseudo-terminal (pty)** process using `node-pty` (e.g., `bash` on Linux/macOS, `powershell.exe` on Windows).
-   **xterm.js** on the client-side (`public/index.html`) renders the terminal UI.
-   User input from xterm.js is sent to the server over WebSocket.
-   The server forwards this input to the pty process.
-   Output from the pty process is sent back to the client over WebSocket and displayed by xterm.js.
-   The `FitAddon` for xterm.js helps resize the terminal display to match the browser window, and these dimensions are communicated to the backend pty.

## Notes

-   **Security:** This is a basic example. Running arbitrary commands through a web interface has security implications. Be cautious, especially if exposing this application to a network. For production use, you would need to implement proper authentication, authorization, and input sanitization.
-   **Shell:** The server attempts to pick an appropriate shell based on the OS (`bash` or `powershell.exe`). This can be configured in `index.js`.
-   **Error Handling:** Basic error handling is in place, but could be made more robust.
