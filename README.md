# Task Manager API - In-Memory Caching (ITUE301 Practical 9)

A RESTful Task Manager backend built with **Node.js, Express and MongoDB (Mongoose)**.
This practical adds **server-side in-memory caching using `node-cache`** and measures how much it
speeds up the API.

## Features
- Full CRUD for tasks (`GET`, `POST`, `PUT`, `DELETE`) backed by MongoDB
- Request logging middleware (method, URL, timestamp)
- Global error handler + 404 handler returning structured JSON
- Mongoose schema validation (`title` required, `priority` enum, defaults)
- **Caching with node-cache**
  - `GET /tasks` is cached under the key `all_tasks` (TTL 60 s)
  - `GET /tasks/:id` is cached separately under `task_<id>`
  - `POST`, `PUT`, `DELETE` invalidate the affected cache keys so stale data is never served
  - `X-Cache` response header shows `HIT` / `MISS` / `DISABLED`
  - Debug endpoint `GET /debug/cache-stats` shows hit/miss counters

## Cache flow
```
GET /tasks
   |
   v
Cache check (node-cache)
   |-- HIT  -> return cached data immediately
   |-- MISS -> query MongoDB -> store in cache -> return data

POST / PUT / DELETE  -> write to MongoDB -> invalidate cache key(s)
```

## Project structure
```
task-manager-api/
├── server.js                  # app entry point, middleware order, debug endpoint
├── cache.js                   # shared node-cache instance + hit/miss counters
├── config/db.js               # MongoDB connection
├── models/Task.js             # Mongoose schema
├── controllers/taskController.js   # CRUD logic with caching + invalidation
├── routes/taskRoutes.js
├── middleware/
│   ├── logger.js              # request logger
│   └── errorHandler.js        # 404 + global error handler
├── scripts/
│   ├── seed.js                # inserts sample tasks (default 2000)
│   └── benchmark.js           # optional: prints response times from the terminal
├── .env.example
└── package.json
```

## Setup
1. Install dependencies
   ```bash
   npm install
   ```
2. Create your `.env` from the example and set `MONGO_URI`
   ```bash
   cp .env.example .env
   ```
   (Windows PowerShell: `copy .env.example .env`)
3. Make sure MongoDB is running (local MongoDB or an Atlas connection string)
4. (Recommended) Add sample data so the cache benefit is visible
   ```bash
   npm run seed
   ```
5. Start the server
   ```bash
   npm start
   ```
   Server runs on `http://localhost:5000`

## API endpoints
| Method | Endpoint             | Description                          | Cache behaviour                 |
|--------|----------------------|--------------------------------------|---------------------------------|
| GET    | `/tasks`             | Get all tasks                        | Cached (`all_tasks`)            |
| GET    | `/tasks/:id`         | Get one task                         | Cached (`task_<id>`)            |
| POST   | `/tasks`             | Create a task                        | Invalidates `all_tasks`         |
| PUT    | `/tasks/:id`         | Update a task                        | Invalidates `all_tasks`, `task_<id>` |
| DELETE | `/tasks/:id`         | Delete a task                        | Invalidates `all_tasks`, `task_<id>` |
| GET    | `/debug/cache-stats` | Cache hit/miss counters              | -                               |

Sample POST body:
```json
{ "title": "Finish Practical 9", "description": "Add node-cache", "priority": "high" }
```

## How to measure response time (cached vs uncached)
1. **Without cache** - set `CACHE_ENABLED=false` in `.env`, restart the server, send `GET /tasks` three times in
   Postman and note the **Time** shown for each request.
2. **With cache** - set `CACHE_ENABLED=true`, restart the server, send `GET /tasks` three times. The first request
   is a cache miss (goes to MongoDB); the next ones are hits.
3. Record the readings in the table below.

### Response time readings (ms)
| Reading | Without cache | With cache |
|---------|---------------|------------|
| 1       |               |            |
| 2       |               |            |
| 3       |               |            |

Screenshots are stored in the `docs/` folder.

## Observations
- The first request after the server starts (or after a write) is always a cache miss and takes about as long as
  an uncached request.
- Repeated requests within the TTL are served from memory and are noticeably faster.
- node-cache lives in the memory of one Node process: restarting the server clears it, and it cannot be shared across
  multiple server instances (Redis would be the usual fix in production).

## Tech stack
Node.js, Express, MongoDB, Mongoose, node-cache, dotenv
