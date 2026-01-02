const express = require('express');
const cors = require('cors');
const menuData = require('./data');
const app = express();

app.use(cors()); // Allow Frontend to talk to Backend
app.get('/', (req, res) => res.send('QuickBite API is running 🚀'));

// 1. Route to get all menu items
app.get('/api/menu', (req, res) => {
    res.json(menuData);
});

// 2. Route to get single item (For Details Page)
app.get('/api/menu/:id', (req, res) => {
    const id = Number(req.params.id);
    const item = menuData.find((dish) => dish.id === id);

    if (!item) {
        return res.status(404).json({ error: "Item not found" });
    }
    res.json(item);
});

// 3. Route to get Specials (Random 4)
app.get('/api/specials', (req, res) => {
    // Simple shuffle
    const shuffled = [...menuData].sort(() => 0.5 - Math.random());
    res.json(shuffled.slice(0, 4));
});

// ✅ ADD THIS AT THE BOTTOM
if (process.env.NODE_ENV !== 'production') {
  const PORT = 3001; // Use 3001 so it doesn't clash with Next.js (3000)
  app.listen(PORT, () => {
    console.log(`Server running locally at http://localhost:${PORT}`);
  });
}

// ✅ ALWAYS KEEP THIS FOR VERCEL
module.exports = app;