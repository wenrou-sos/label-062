const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
  try {
    const { appointment_id, rating, comment } = req.body;

    if (!appointment_id || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: '参数不合法' });
    }

    const [appointments] = await pool.query(
      "SELECT id, status FROM appointments WHERE id = ? AND status = 'completed'",
      [appointment_id]
    );

    if (appointments.length === 0) {
      return res.status(400).json({ success: false, message: '只能对已完成的预约进行评价' });
    }

    const [existing] = await pool.query(
      'SELECT id FROM reviews WHERE appointment_id = ?',
      [appointment_id]
    );

    if (existing.length > 0) {
      await pool.query(
        'UPDATE reviews SET rating = ?, comment = ? WHERE appointment_id = ?',
        [rating, comment || '', appointment_id]
      );
      return res.json({ success: true, message: '评价已更新' });
    }

    await pool.query(
      'INSERT INTO reviews (appointment_id, rating, comment) VALUES (?, ?, ?)',
      [appointment_id, rating, comment || '']
    );

    res.json({ success: true, message: '评价提交成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '提交评价失败' });
  }
});

router.get('/appointment/:appointmentId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM reviews WHERE appointment_id = ?',
      [req.params.appointmentId]
    );

    if (rows.length === 0) {
      return res.json({ success: true, data: null });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '获取评价失败' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;

    const [rows] = await pool.query(
      `SELECT r.*, a.appointment_no, a.deceased_name, a.family_name, h.name as hall_name
       FROM reviews r
       LEFT JOIN appointments a ON r.appointment_id = a.id
       LEFT JOIN halls h ON a.hall_id = h.id
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [parseInt(pageSize), parseInt(offset)]
    );

    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM reviews');

    res.json({
      success: true,
      data: rows,
      total: countResult[0].total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '获取评价列表失败' });
  }
});

module.exports = router;
