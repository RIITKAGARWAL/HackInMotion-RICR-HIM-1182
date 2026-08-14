const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, budgetController.getBudgets);
router.post('/', authMiddleware, budgetController.createBudget);

// Named sub-routes must be registered before the /:id parameter routes
router.post('/copy-past', authMiddleware, budgetController.copyPastBudgets);
router.get('/carry-over', authMiddleware, budgetController.getCarryOver);
router.put('/carry-over', authMiddleware, budgetController.setCarryOver);

router.put('/:id', authMiddleware, budgetController.updateBudget);
router.delete('/:id', authMiddleware, budgetController.deleteBudget);

module.exports = router;
