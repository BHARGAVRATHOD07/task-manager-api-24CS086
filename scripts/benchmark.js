// Optional helper: sends GET /tasks several times and prints each response time.
// Run the server first. Usage: npm run benchmark   (or: node scripts/benchmark.js 5)
// Postman is still the tool used for the lab journal screenshots.
const runs = Number(process.argv[2]) || 3;
const url = `http://localhost:${process.env.PORT || 5000}/tasks`;

(async () => {
  for (let i = 1; i <= runs; i++) {
    const start = performance.now();
    const res = await fetch(url);
    await res.json();
    const ms = (performance.now() - start).toFixed(1);
    console.log(`Request ${i}: ${ms} ms  (X-Cache: ${res.headers.get('x-cache')})`);
  }
})();
