// src/app.js
const express = require('express');
const config = require('./config');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const cors = require('cors'); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://frontend:7070' // Your React app's URL
}));


// Mount routes
app.use('/api', routes);

// Error handler middleware
app.use(errorHandler);

module.exports = app;
