// server/services/summaryService.js
const prisma = require('../config/db');
const { summarize } = require('./summarizer');

const generateSummary = async (queryId) => {
    const rawResults = await prisma.rawResult.findMany({
        where: { queryId }
    });

    const summaryText = await summarize(rawResults); // Your OpenAI logic

    return prisma.summary.create({
        data: {
            text: summaryText,
            query: { connect: { id: queryId } }
        }
    });
};

module.exports = { generateSummary };