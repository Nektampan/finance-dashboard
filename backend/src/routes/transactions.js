const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getTransactions, createTransaction, deleteTransaction, getSummary } = require('../controllers/transactionController');

router.get('/', auth, getTransactions);
router.post('/', auth, createTransaction);
router.delete('/:id', auth, deleteTransaction);
router.get('/summary', auth, getSummary);

module.exports = router;