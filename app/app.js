const express = require('express');
const app = express();

// Middleware
const helmet = require('helmet');

// Add middleware and configuration here
app.use(helmet());

module.exports = app;
