import http from 'http';

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/test') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>App Test</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  margin: 20px;
                  background: #f5f5f5;
              }
              .container {
                  max-width: 1200px;
                  margin: 0 auto;
                  background: white;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              .status {
                  padding: 10px;
                  margin: 10px 0;
                  border-radius: 4px;
              }
              .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
              .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>App Test Server</h1>
              <p>Test server is running.</p>
          </div>
      </body>
      </html>
    `);
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`App Test Server running on http://localhost:${PORT}`);
});