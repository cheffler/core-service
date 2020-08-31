// Built in modules
const https = require('https');

// NPM installed modules
const express = require('express');

// Local modules
const boot = require('./boot');
const shutdown = require('./shutdown');

const app = express();
const port = 2000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Trigger boot sequence, then launch service
const { httpsOptions } = boot();
const server = https.createServer(httpsOptions, app);

// Setup the shutdown listener
shutdown.init(server);

server.listen(port, () => {
  console.log(`Example app listening at https://*.coreservice.dev:${port}`);
});
