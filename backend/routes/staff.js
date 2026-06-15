const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const { role } = req.query;
    let sql = 'SELECT * FROM staff WHERE status = 1';
    let params = [];
    if (role) {
      sql += ' AND role = ?';
      params.push(role);
    }
    sql += ' ORDER BY id';
    const [rows] = await pool.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '获取员工列表失败' });
  }
});

module.exports = router;
