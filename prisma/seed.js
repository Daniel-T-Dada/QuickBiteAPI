// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Paste your JSON array here directly, OR require it if the path is correct
// For simplicity, let's say we read it from your data/menu.json file
const fs = require('fs');
const path = require('path');

async function main() {
  const jsonPath = path.join(__dirname, '../data/menu.json');
  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const menuData = JSON.parse(rawData);

  console.log(`Start seeding ${menuData.length} items...`);

  for (const item of menuData) {
    await prisma.menuItem.create({
      data: {
        // Note: We don't include 'id' here because the DB auto-generates it!
        title: item.title,
        price: item.price,
        category: item.category,
        img: item.img,
        desc: item.desc
      }
    });
  }

  console.log(`Seeding finished.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });