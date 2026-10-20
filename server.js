require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const logger = require('./middleware/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const taskRoutes = require('./routes/taskRoutes');
const { stats, cache, isEnabled, TTL } = require('./cache');

const app = express();

app.use(express.json());
app.use(logger);

// Routes
app.use('/tasks', taskRoutes);

// Debug endpoint: cache hit/miss counters (supplementary task)
app.get('/debug/cache-stats', (req, res) => {
  const total = stats.hits + stats.misses;
  res.json({
    cacheEnabled: isEnabled(),
    ttlSeconds: TTL,
    hits: stats.hits,
    misses: stats.misses,
    hitRatio: total ? Number((stats.hits / total).toFixed(2)) : 0,
    keysInCache: cache.keys()
  });
});

// 404 + global error handler must come after all routes
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (cache ${isEnabled() ? 'ON' : 'OFF'}, TTL ${TTL}s)`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
