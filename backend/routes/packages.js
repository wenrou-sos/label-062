const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    let sql = 'SELECT * FROM packages WHERE status = 1';
    let params = [];
    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }
    sql += ' ORDER BY price';
    const [rows] = await pool.query(sql, params);
    const data = rows.map(row => ({
      ...row,
      includes: JSON.parse(row.includes || '[]')
    }));
    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '获取套餐列表失败' });
  }
});

module.exports = router;
