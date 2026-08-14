const { Worker } = require('bullmq');
const redis = require('../config/redis');
const { processCsvFile } = require('../services/csvImportService');

const csvWorker = new Worker('csv-file-processing', async (job) => {
  const { userId, filePath } = job.data;

  try {
    const result = await processCsvFile(userId, filePath);
    return { success: true, count: result.count, categoryIds: result.categoryIds };
  } catch (err) {
    if (require('fs').existsSync(filePath)) require('fs').unlinkSync(filePath);
    throw err;
  }
}, { connection: redis, concurrency: 4 });

csvWorker.on('completed', (job) => console.log(`✓ Job ${job.id} completed successfully`));
csvWorker.on('failed', (job, err) => console.error(`❌ Job ${job.id} failed:`, err));

module.exports = csvWorker;
