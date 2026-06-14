const pool = require('../db');

const getTransactions = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, c.name as category_name, c.type as category_type 
       FROM transactions t 
       LEFT JOIN categories c ON t.category_id = c.id 
       WHERE t.user_id = $1 
       ORDER BY t.date DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const createTransaction = async (req, res) => {
  const { category_id, amount, description, date } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO transactions (user_id, category_id, amount, description, date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, category_id, amount, description, date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Transaksi dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getSummary = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        SUM(CASE WHEN c.type = 'income' THEN t.amount ELSE 0 END) as total_income,
        SUM(CASE WHEN c.type = 'expense' THEN t.amount ELSE 0 END) as total_expense
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = $1`,
      [req.user.id]
    );
    const { total_income, total_expense } = result.rows[0];
    res.json({
      total_income: total_income || 0,
      total_expense: total_expense || 0,
      balance: (total_income || 0) - (total_expense || 0)
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getTransactions, createTransaction, deleteTransaction, getSummary };