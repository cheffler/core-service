const express = require('express');
const app = express();

// Middleware
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

// Add middleware and configuration here
app.use(helmet());
app.use(morgan('combined'));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

module.exports = app;
