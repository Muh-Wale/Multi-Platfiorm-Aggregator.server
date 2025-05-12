const prisma = require('../config/db');

async function testDB() {
    const users = await prisma.user.findMany();
    console.log(users);
}
testDB();