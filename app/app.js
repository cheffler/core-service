const express = require('express');
const app = express();

// Middleware
const helmet = require('helmet');
const morgan = require('morgan');

// Add middleware and configuration here
app.use(helmet());
app.use(morgan('combined'));

module.exports = app;
