const express = require('express');
const cors = require('cors');
const fs = require('fs'); // 1. Import file system
const path = require('path'); // 2. Import path utility

const app = express();

app.use(cors()); // Allow Frontend to talk to Backend
app.use(express.json()); // 3. IMPORTANT: Allows backend to parse JSON from forms

// 4. Point to your new JSON database
// Make sure you have a 'menu.json' file inside your 'data' folder!
const DB_FILE = path.join(__dirname, '..', 'data', 'menu.json');

// --- HELPER FUNCTIONS (To avoid repeating code) ---

const readMenuData = () => {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading file:", error);
        return []; // Return empty array if file fails
    }
};

const writeMenuData = (data) => {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error writing file:", error);
    }
};

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

// 1. GET ALL (Modified to read from file)
app.get('/api/menu', (req, res) => {
    const menuData = readMenuData();
    res.json(menuData);
});

// 2. GET SINGLE ITEM
app.get('/api/menu/:id', (req, res) => {
    const menuData = readMenuData();
    const id = Number(req.params.id);
    const item = menuData.find((dish) => dish.id === id);

    if (!item) {
        return res.status(404).json({ error: "Item not found" });
    }
    res.json(item);
});

// 3. GET SPECIALS
app.get('/api/specials', (req, res) => {
    const menuData = readMenuData();
    // Simple shuffle
    const shuffled = [...menuData].sort(() => 0.5 - Math.random());
    res.json(shuffled.slice(0, 4));
});

// 4. CREATE (Add New Item) - FOR ADMIN
app.post('/api/menu', (req, res) => {
    const menuData = readMenuData();
    const newItem = req.body;

    // Assign a simple unique ID using timestamp
    newItem.id = Date.now();

    menuData.push(newItem);
    writeMenuData(menuData);

    res.status(201).json({ message: "Item added successfully", item: newItem });
});

// 5. UPDATE (Edit Item) - FOR ADMIN
app.put('/api/menu/:id', (req, res) => {
    const menuData = readMenuData();
    const id = Number(req.params.id);
    const updates = req.body;

    const index = menuData.findIndex(item => item.id === id);

    if (index !== -1) {
        menuData[index] = { ...menuData[index], ...updates };
        writeMenuData(menuData);
        res.json({ message: "Item updated", item: menuData[index] });
    } else {
        res.status(404).json({ error: "Item not found" });
    }
});

// 6. DELETE (Remove Item) - FOR ADMIN
app.delete('/api/menu/:id', (req, res) => {
    const menuData = readMenuData();
    const id = Number(req.params.id);

    const newMenuData = menuData.filter(item => item.id !== id);

    if (menuData.length !== newMenuData.length) {
        writeMenuData(newMenuData);
        res.json({ message: "Item deleted successfully" });
    } else {
        res.status(404).json({ error: "Item not found" });
    }
});

// ✅ LOCAL SERVER SETUP
if (process.env.NODE_ENV !== 'production') {
    const PORT = 3001;
    app.listen(PORT, () => {
        console.log(`Server running locally at http://localhost:${PORT}`);
    });
}

// ✅ EXPORT FOR VERCEL
module.exports = app;