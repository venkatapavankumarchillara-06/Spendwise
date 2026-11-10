import express from 'express';
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getCategories,
} from '../controllers/transactionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protect middleware to all transaction routes
router.use(protect);

router.route('/categories').get(getCategories);
router.route('/').get(getTransactions).post(createTransaction);
router
  .route('/:id')
  .get(getTransactionById)
  .put(updateTransaction)
  .delete(deleteTransaction);

export default router;

