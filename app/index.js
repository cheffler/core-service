// Built in modules
const https = require('https');

// NPM installed modules
const express = require('express');

// Local modules
const boot = require('./boot');

const app = express();
const port = 2000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Trigger boot sequence, then launch service
const { httpsOptions } = boot();
const server = https.createServer(httpsOptions, app);

server.listen(port, () => {
  console.log(`Example app listening at https://*.coreservice.dev:${port}`);
});
