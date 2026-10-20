// Shared cache module - every file that needs the cache requires this one instance.
const NodeCache = require('node-cache');

const TTL = Number(process.env.CACHE_TTL_SECONDS) || 60;

// stdTTL = how long (in seconds) a key lives before node-cache deletes it
// useClones: false -> returns the same object we stored (faster, we never mutate it)
const cache = new NodeCache({ stdTTL: TTL, checkperiod: 120, useClones: false });

// Simple counters for the debug endpoint (supplementary task)
const stats = { hits: 0, misses: 0 };

const ALL_TASKS_KEY = 'all_tasks';
const taskKey = (id) => `task_${id}`;

// CACHE_ENABLED=false lets us measure the "without cache" timing without editing code
const isEnabled = () => process.env.CACHE_ENABLED !== 'false';

module.exports = { cache, stats, ALL_TASKS_KEY, taskKey, isEnabled, TTL };
