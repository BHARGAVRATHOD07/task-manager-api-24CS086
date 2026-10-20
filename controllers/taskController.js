const Task = require('../models/Task');
const { cache, stats, ALL_TASKS_KEY, taskKey, isEnabled } = require('../cache');

// GET /tasks  -> cache check first, DB only on a miss
exports.getAllTasks = async (req, res, next) => {
  try {
    if (isEnabled()) {
      const cached = cache.get(ALL_TASKS_KEY);
      if (cached) {
        stats.hits++;
        res.set('X-Cache', 'HIT');
        return res.status(200).json(cached);
      }
      stats.misses++;
    }

    const tasks = await Task.find().lean();

    if (isEnabled()) cache.set(ALL_TASKS_KEY, tasks);
    res.set('X-Cache', isEnabled() ? 'MISS' : 'DISABLED');
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
};

// GET /tasks/:id -> cached separately from the all-tasks list
exports.getTaskById = async (req, res, next) => {
  try {
    const key = taskKey(req.params.id);

    if (isEnabled()) {
      const cached = cache.get(key);
      if (cached) {
        stats.hits++;
        res.set('X-Cache', 'HIT');
        return res.status(200).json(cached);
      }
      stats.misses++;
    }

    const task = await Task.findById(req.params.id).lean();
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (isEnabled()) cache.set(key, task);
    res.set('X-Cache', isEnabled() ? 'MISS' : 'DISABLED');
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
};

// POST /tasks -> write to DB, then invalidate the list cache
exports.createTask = async (req, res, next) => {
  try {
    const task = await Task.create(req.body);
    cache.del(ALL_TASKS_KEY);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

// PUT /tasks/:id -> update DB, then invalidate list + single-task cache
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    cache.del([ALL_TASKS_KEY, taskKey(req.params.id)]);
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
};

// DELETE /tasks/:id -> delete from DB, then invalidate list + single-task cache
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    cache.del([ALL_TASKS_KEY, taskKey(req.params.id)]);
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
};
