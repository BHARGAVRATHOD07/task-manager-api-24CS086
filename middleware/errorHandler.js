// 404 handler for undefined routes
exports.notFound = (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
};

// Global error handler - must be the LAST middleware in server.js
exports.errorHandler = (err, req, res, next) => {
  // Mongoose validation error -> clean structured JSON (no raw error object)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: 'Validation failed', details: messages });
  }

  // Invalid MongoDB ObjectId in the URL
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid task id format' });
  }

  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
};
