const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, budgetController.getBudgets);
router.post('/', authMiddleware, budgetController.createBudget);
router.post('/copy-past', authMiddleware, budgetController.copyPastBudgets);

// Carry-over surplus preference
router.get('/carry-over', authMiddleware, budgetController.getCarryOver);
router.put('/carry-over', authMiddleware, budgetController.setCarryOver);

module.exports = router;
