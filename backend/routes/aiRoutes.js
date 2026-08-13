const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/chat', authMiddleware, aiController.streamChatAssistant);
router.get('/insights', authMiddleware, aiController.getInsights);

module.exports = router;