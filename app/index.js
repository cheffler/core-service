// Built in modules
const fs = require('fs');
const path = require('path');
const https = require('https');

// NPM installed modules
const express = require('express');

const app = express();
const port = 2000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Define the path to secrets
const secretsDir = path.join(__dirname, '..', 'secrets');

// HTTPs options
const options = {
  cert: fs.readFileSync(secretsDir + '/coreservice.dev.pem'),
  key: fs.readFileSync(secretsDir + '/coreservice.dev-key.pem'),
};
const server = https.createServer(options, app);

server.listen(port, () => {
  console.log(`Example app listening at https://*.coreservice.dev:${port}`);
});
