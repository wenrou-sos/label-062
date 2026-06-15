const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/appointments', async (req, res) => {
  try {
    const { date, status, page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;

    let sql = `
      SELECT a.*, h.name as hall_name, 
             ts.name as slot_name, ts.start_time, ts.end_time,
             s1.name as host_name, s2.name as makeup_name
      FROM appointments a
      LEFT JOIN halls h ON a.hall_id = h.id
      LEFT JOIN time_slots ts ON a.time_slot_id = ts.id
      LEFT JOIN staff s1 ON a.host_id = s1.id
      LEFT JOIN staff s2 ON a.makeup_id = s2.id
      WHERE 1=1
    `;
    let params = [];
    let countSql = 'SELECT COUNT(*) as total FROM appointments WHERE 1=1';
    let countParams = [];

    if (date) {
      sql += ' AND a.appointment_date = ?';
      params.push(date);
      countSql += ' AND appointment_date = ?';
      countParams.push(date);
    }
    if (status) {
      sql += ' AND a.status = ?';
      params.push(status);
      countSql += ' AND status = ?';
      countParams.push(status);
    }

    sql += ' ORDER BY a.appointment_date DESC, ts.start_time ASC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), parseInt(offset));

    const [rows] = await pool.query(sql, params);
    const [countResult] = await pool.query(countSql, countParams);

    res.json({
      success: true,
      data: rows,
      total: countResult[0].total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '获取预约列表失败' });
  }
});

router.put('/appointments/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: '无效的状态' });
    }

    await pool.query('UPDATE appointments SET status = ? WHERE id = ?', [status, req.params.id]);

    res.json({ success: true, message: '状态更新成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '更新状态失败' });
  }
});

router.get('/schedule', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, message: '请选择日期' });
    }

    const [halls] = await pool.query('SELECT * FROM halls WHERE status = 1 ORDER BY id');
    const [slots] = await pool.query('SELECT * FROM time_slots WHERE status = 1 ORDER BY start_time');

    const [appointments] = await pool.query(
      `SELECT a.*, h.name as hall_name, ts.start_time, ts.end_time,
              s1.name as host_name, s2.name as makeup_name
       FROM appointments a
       LEFT JOIN halls h ON a.hall_id = h.id
       LEFT JOIN time_slots ts ON a.time_slot_id = ts.id
       LEFT JOIN staff s1 ON a.host_id = s1.id
       LEFT JOIN staff s2 ON a.makeup_id = s2.id
       WHERE a.appointment_date = ? AND a.status != 'cancelled'
       ORDER BY h.id, ts.start_time`,
      [date]
    );

    const schedule = halls.map(hall => {
      const hallAppointments = appointments.filter(a => a.hall_id === hall.id);
      return {
        hall,
        slots: slots.map(slot => {
          const appt = hallAppointments.find(a => a.time_slot_id === slot.id);
          return {
            slot,
            appointment: appt || null
          };
        })
      };
    });

    res.json({ success: true, data: { halls, slots, schedule, appointments } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '获取排期数据失败' });
  }
});

module.exports = router;
