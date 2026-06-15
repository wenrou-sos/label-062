const express = require('express');
const router = express.Router();
const pool = require('../db');

function generateOrderNo() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `FB${y}${m}${d}${rand}`;
}

router.get('/check-availability', async (req, res) => {
  try {
    const { hall_id, date } = req.query;
    if (!hall_id || !date) {
      return res.status(400).json({ success: false, message: '参数不完整' });
    }

    const [slots] = await pool.query(
      'SELECT * FROM time_slots WHERE status = 1 ORDER BY start_time'
    );

    const [appointments] = await pool.query(
      'SELECT time_slot_id FROM appointments WHERE hall_id = ? AND appointment_date = ? AND status != "cancelled"',
      [hall_id, date]
    );

    const bookedSlotIds = appointments.map(a => a.time_slot_id);

    const data = slots.map(slot => ({
      ...slot,
      available: !bookedSlotIds.includes(slot.id)
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '查询可用时段失败' });
  }
});

router.post('/', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const {
      hall_id,
      time_slot_id,
      appointment_date,
      deceased_name,
      family_name,
      family_phone,
      host_id,
      makeup_id,
      host_package_id,
      makeup_package_id,
      remark
    } = req.body;

    if (!hall_id || !time_slot_id || !appointment_date || !deceased_name || !family_name || !family_phone) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: '必填项不能为空' });
    }

    const [existing] = await conn.query(
      'SELECT id FROM appointments WHERE hall_id = ? AND time_slot_id = ? AND appointment_date = ? AND status != "cancelled" FOR UPDATE',
      [hall_id, time_slot_id, appointment_date]
    );

    if (existing.length > 0) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: '该时段已被预约，请选择其他时段' });
    }

    if (host_id) {
      const [hostConflict] = await conn.query(
        'SELECT id FROM appointments WHERE host_id = ? AND appointment_date = ? AND time_slot_id = ? AND status != "cancelled"',
        [host_id, appointment_date, time_slot_id]
      );
      if (hostConflict.length > 0) {
        await conn.rollback();
        return res.status(400).json({ success: false, message: '所选司仪该时段已有安排，请选择其他司仪' });
      }
    }

    if (makeup_id) {
      const [makeupConflict] = await conn.query(
        'SELECT id FROM appointments WHERE makeup_id = ? AND appointment_date = ? AND time_slot_id = ? AND status != "cancelled"',
        [makeup_id, appointment_date, time_slot_id]
      );
      if (makeupConflict.length > 0) {
        await conn.rollback();
        return res.status(400).json({ success: false, message: '所选化妆师该时段已有安排，请选择其他化妆师' });
      }
    }

    let totalPrice = 0;
    if (host_package_id) {
      const [pkg] = await conn.query('SELECT price FROM packages WHERE id = ?', [host_package_id]);
      if (pkg.length > 0) totalPrice += parseFloat(pkg[0].price);
    }
    if (makeup_package_id) {
      const [pkg] = await conn.query('SELECT price FROM packages WHERE id = ?', [makeup_package_id]);
      if (pkg.length > 0) totalPrice += parseFloat(pkg[0].price);
    }

    const appointment_no = generateOrderNo();

    const [result] = await conn.query(
      `INSERT INTO appointments (appointment_no, hall_id, time_slot_id, appointment_date, deceased_name, family_name, family_phone, host_id, makeup_id, host_package_id, makeup_package_id, total_price, remark, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        appointment_no,
        hall_id,
        time_slot_id,
        appointment_date,
        deceased_name,
        family_name,
        family_phone,
        host_id || null,
        makeup_id || null,
        host_package_id || null,
        makeup_package_id || null,
        totalPrice,
        remark || null
      ]
    );

    await conn.commit();

    res.json({
      success: true,
      data: {
        id: result.insertId,
        appointment_no,
        total_price: totalPrice
      },
      message: '预约成功'
    });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({ success: false, message: '预约失败' });
  } finally {
    conn.release();
  }
});

router.get('/my', async (req, res) => {
  try {
    const { phone, appointment_no } = req.query;
    let sql = `
      SELECT a.*, h.name as hall_name, h.image_url as hall_image,
             ts.name as slot_name, ts.start_time, ts.end_time,
             s1.name as host_name, s2.name as makeup_name,
             p1.name as host_package_name, p2.name as makeup_package_name
      FROM appointments a
      LEFT JOIN halls h ON a.hall_id = h.id
      LEFT JOIN time_slots ts ON a.time_slot_id = ts.id
      LEFT JOIN staff s1 ON a.host_id = s1.id
      LEFT JOIN staff s2 ON a.makeup_id = s2.id
      LEFT JOIN packages p1 ON a.host_package_id = p1.id
      LEFT JOIN packages p2 ON a.makeup_package_id = p2.id
      WHERE 1=1
    `;
    let params = [];

    if (phone) {
      sql += ' AND a.family_phone = ?';
      params.push(phone);
    }
    if (appointment_no) {
      sql += ' AND a.appointment_no = ?';
      params.push(appointment_no);
    }
    sql += ' ORDER BY a.created_at DESC';

    const [rows] = await pool.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '查询预约失败' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, h.name as hall_name, h.image_url as hall_image, h.capacity, h.description as hall_description,
              ts.name as slot_name, ts.start_time, ts.end_time,
              s1.name as host_name, s1.avatar as host_avatar,
              s2.name as makeup_name, s2.avatar as makeup_avatar,
              p1.name as host_package_name, p1.price as host_package_price,
              p2.name as makeup_package_name, p2.price as makeup_package_price
       FROM appointments a
       LEFT JOIN halls h ON a.hall_id = h.id
       LEFT JOIN time_slots ts ON a.time_slot_id = ts.id
       LEFT JOIN staff s1 ON a.host_id = s1.id
       LEFT JOIN staff s2 ON a.makeup_id = s2.id
       LEFT JOIN packages p1 ON a.host_package_id = p1.id
       LEFT JOIN packages p2 ON a.makeup_package_id = p2.id
       WHERE a.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: '预约不存在' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '获取预约详情失败' });
  }
});

router.put('/:id/cancel', async (req, res) => {
  try {
    const [result] = await pool.query(
      "UPDATE appointments SET status = 'cancelled' WHERE id = ? AND status != 'completed'",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ success: false, message: '无法取消该预约' });
    }

    res.json({ success: true, message: '预约已取消' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '取消预约失败' });
  }
});

module.exports = router;
