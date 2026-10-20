// Inserts sample tasks so the cache benefit is easy to see.
// Usage: npm run seed            (inserts 2000 tasks)
//        npm run seed -- 5000    (inserts 5000 tasks)
require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('../models/Task');

const count = Number(process.argv[2]) || 2000;
const priorities = ['low', 'medium', 'high'];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Task.deleteMany({});

  const docs = Array.from({ length: count }, (_, i) => ({
    title: `Sample task ${i + 1}`,
    description: `This is the description for sample task number ${i + 1}.`,
    completed: i % 3 === 0,
    priority: priorities[i % 3]
  }));

  await Task.insertMany(docs);
  console.log(`Seeded ${count} tasks`);
  await mongoose.disconnect();
})();
