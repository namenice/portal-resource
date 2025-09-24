// src/index.js
const app = require('./app');
const config = require('./config');
const { connectDB } = require('./config/database');

// Start server AFTER DB connection
(async () => {
  try {
    await connectDB();
    app.listen(config.port, '0.0.0.0', () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
