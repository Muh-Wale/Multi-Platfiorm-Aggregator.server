// server/services/queue.js
require('dotenv').config();
const { setKey } = require('../utils/upstash');
const logger = require('../utils/logger');

const MAX_RETRIES = 3;

const QUEUE_PREFIX = 'queue_';

async function addJob(queueName, jobData) {
  const jobId = Date.now();
  await setKey(`${QUEUE_PREFIX}${queueName}:${jobId}`, JSON.stringify(jobData));
  return jobId;
}

async function processJobs(queueName, handler) {
  const pattern = `${QUEUE_PREFIX}${queueName}:*`;
  
  // Note: Upstash doesn't support KEYS in REST API. Use SCAN in production.
  const mockJobs = [
    { id: 1, data: { test: 'data' } } // Mock for demo
  ];

  for (const job of mockJobs) {
    await handler(job.data);
    await setKey(`${QUEUE_PREFIX}${queueName}:${job.id}`, 'completed');
  }

  try {
    await handler(jobData);
  } catch (error) {
    if (jobData.retryCount < MAX_RETRIES) {
      await setKey(/*...*/ { ...jobData, retryCount: jobData.retryCount + 1 });
    }
    throw error;
  }
}

module.exports = { addJob,processJobs }