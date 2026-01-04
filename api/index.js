
// api/index.js
const express = require('express');
const cors = require('cors');
const prisma = require('../lib/prisma'); // ✅ Import Prisma
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>QuickBite API</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
        h1 { color: #333; border-bottom: 2px solid #eaeaea; padding-bottom: 10px; }
        .endpoint { background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #eaeaea; }
        .method { font-weight: bold; padding: 4px 8px; border-radius: 4px; display: inline-block; min-width: 60px; text-align: center; margin-right: 10px; font-size: 0.9em; }
        .get { background-color: #e3f2fd; color: #1565c0; }
        .post { background-color: #e8f5e9; color: #2e7d32; }
        .put { background-color: #fff3e0; color: #ef6c00; }
        .delete { background-color: #ffebee; color: #c62828; }
        .url { font-family: monospace; font-size: 1.1em; color: #444; text-decoration: none; }
        .url:hover { text-decoration: underline; }
        .desc { color: #666; margin-top: 5px; font-size: 0.95em; }
        .footer { margin-top: 40px; color: #888; font-size: 0.9em; border-top: 1px solid #eee; padding-top: 20px; }
      </style>
    </head>
    <body>
      <h1>🚀 QuickBite API</h1>
      <p>Welcome to the QuickBite Backend API! Here is the list of available endpoints:</p>

      <div class="endpoint">
        <span class="method get">GET</span>
        <a href="/api/menu" class="url" target="_blank">/api/menu</a>
        <div class="desc">Retrieve all menu items.</div>
      </div>

      <div class="endpoint">
        <span class="method get">GET</span>
        <a href="/api/menu/1" class="url" target="_blank">/api/menu/:id</a>
        <div class="desc">Retrieve a single menu item by ID (e.g., /api/menu/1).</div>
      </div>

      <div class="endpoint">
        <span class="method get">GET</span>
        <a href="/api/specials" class="url" target="_blank">/api/specials</a>
        <div class="desc">Retrieve 4 random specials.</div>
      </div>

      <div class="endpoint">
        <span class="method post">POST</span>
        <a href="/api/menu" class="url" target="_blank">/api/menu</a>
        <div class="desc">Create a new menu item. (Requires JSON body)</div>
      </div>

      <div class="endpoint">
        <span class="method put">PUT</span>
        <a href="/api/menu/1" class="url" target="_blank">/api/menu/:id</a>
        <div class="desc">Update an existing menu item. (Requires JSON body)</div>
      </div>

      <div class="endpoint">
        <span class="method delete">DELETE</span>
        <a href="/api/menu/1" class="url" target="_blank">/api/menu/:id</a>
        <div class="desc">Delete a menu item properly.</div>
      </div>

      <div class="footer">
        Running on Node.js ${process.version} | Environment: ${process.env.NODE_ENV || 'development'}
      </div>
    </body>
    </html>
  `;
    res.send(html);
});

// --- ROUTES ---

// 1. GET ALL (Read from DB)
app.get('/api/menu', async (req, res) => {
  try {
    // ✅ Prisma: Find Many
    const menu = await prisma.menuItem.findMany({
      orderBy: { id: 'asc' } // Keep order consistent
    });
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch menu" });
  }
});

// 2. GET SINGLE ITEM
app.get('/api/menu/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    // ✅ Prisma: Find Unique
    const item = await prisma.menuItem.findUnique({
      where: { id: id }
    });
    if (item) res.json(item);
    else res.status(404).json({ error: "Item not found" });
  } catch (error) {
    res.status(500).json({ error: "Error fetching item" });
  }
});

// 3. ✅ GET SPECIALS (Random 4)
app.get('/api/specials', async (req, res) => {
  try {
    // 1. Fetch all IDs (lightweight) or all items
    // Since we only have ~40 items, fetching all is fine and fast.
    const allItems = await prisma.menuItem.findMany();

    // 2. Shuffle using JavaScript (same logic as before)
    const shuffled = allItems.sort(() => 0.5 - Math.random());

    // 3. Return top 4
    res.json(shuffled.slice(0, 4));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch specials" });
  }
});

// 4. CREATE (Admin)
app.post('/api/menu', async (req, res) => {
  try {
    const { title, price, category, img, desc } = req.body;
    
    // ✅ Prisma: Create
    const newItem = await prisma.menuItem.create({
      data: {
        title,
        price: Number(price),
        category,
        img,
        desc
      }
    });
    res.status(201).json(newItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create item" });
  }
});

// 5. UPDATE (Admin)
app.put('/api/menu/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const { title, price, category, img, desc } = req.body;

    // ✅ Prisma: Update
    const updatedItem = await prisma.menuItem.update({
      where: { id: id },
      data: {
        title,
        price: Number(price),
        category,
        img,
        desc
      }
    });
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: "Failed to update item" });
  }
});

// 6. DELETE (Admin)
app.delete('/api/menu/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    // ✅ Prisma: Delete
    await prisma.menuItem.delete({
      where: { id: id }
    });
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete item" });
  }
});

// Local Server Setup
if (process.env.NODE_ENV !== 'production') {
  const PORT = 3001;
  app.listen(PORT, () => {
    console.log(`Server running locally at http://localhost:${PORT}`);
  });
}

module.exports = app;