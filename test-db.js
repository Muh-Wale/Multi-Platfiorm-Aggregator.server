const prisma = require('./config/db');

async function testDB() {
    try {
        const users = await prisma.user.findMany();
        console.log("Users in DB:", users);
    } catch (error) {
        console.error("DB Error:", error);
    } finally {
        await prisma.$disconnect(); // Close DB connection
    }
}

testDB();