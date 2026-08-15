const { Queue } = require('bullmq');
const redis = require('../config/redis');

const csvQueue = new Queue('csv-file-processing', { connection: redis });

async function enqueueCsvFile(userId, filePath) {
  const job = await csvQueue.add(
    'parse-and-categorize',
    {
      userId,
      filePath,
    },
    {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: true,
    }
  );

  return job.id;
}

module.exports = { csvQueue, enqueueCsvFile };
