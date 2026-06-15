const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const mockHalls = [
  { id: 1, name: '福寿厅', capacity: 50, description: '宽敞明亮，庄严肃穆，可容纳50人', image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', status: 1 },
  { id: 2, name: '永安厅', capacity: 80, description: '大气庄重，设施齐全，可容纳80人', image_url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400', status: 1 },
  { id: 3, name: '往生厅', capacity: 100, description: '豪华大厅，设备完善，可容纳100人', image_url: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=400', status: 1 }
];

const mockTimeSlots = [
  { id: 1, start_time: '08:00:00', end_time: '09:30:00', name: '上午第一场', status: 1 },
  { id: 2, start_time: '10:00:00', end_time: '11:30:00', name: '上午第二场', status: 1 },
  { id: 3, start_time: '13:30:00', end_time: '15:00:00', name: '下午第一场', status: 1 },
  { id: 4, start_time: '15:30:00', end_time: '17:00:00', name: '下午第二场', status: 1 }
];

const mockStaff = [
  { id: 1, name: '张司仪', role: 'host', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200', description: '资深司仪，从业20年，经验丰富', status: 1 },
  { id: 2, name: '李司仪', role: 'host', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', description: '专业司仪，主持风格庄重大气', status: 1 },
  { id: 3, name: '王化妆师', role: 'makeup', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200', description: '资深化妆师，技术精湛', status: 1 },
  { id: 4, name: '陈化妆师', role: 'makeup', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200', description: '专业化妆师，服务细致周到', status: 1 }
];

const mockPackages = [
  { id: 1, name: '标准司仪服务', description: '包含基础仪式主持', price: 2000.00, type: 'host', includes: '["仪式主持","流程安排","音乐配合"]', status: 1 },
  { id: 2, name: '豪华司仪服务', description: '包含全套仪式主持及家属心理疏导', price: 3800.00, type: 'host', includes: '["仪式主持","流程安排","音乐配合","悼词撰写","家属疏导"]', status: 1 },
  { id: 3, name: '基础化妆服务', description: '包含仪容整理和基础化妆', price: 800.00, type: 'makeup', includes: '["仪容整理","基础化妆","发型设计"]', status: 1 },
  { id: 4, name: '完整化妆服务', description: '包含全身仪容整理及高级化妆', price: 1500.00, type: 'makeup', includes: '["仪容整理","高级化妆","发型设计","服装搭配","美容护理"]', status: 1 }
];

let mockAppointments = [];
let mockReviews = [];
let apptCounter = 1;

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Mock服务运行正常' });
});

app.get('/api/halls', (req, res) => {
  res.json({ success: true, data: mockHalls });
});

app.get('/api/halls/:id', (req, res) => {
  const hall = mockHalls.find(h => h.id == req.params.id);
  if (!hall) return res.status(404).json({ success: false, message: '告别厅不存在' });
  res.json({ success: true, data: hall });
});

app.get('/api/time-slots', (req, res) => {
  res.json({ success: true, data: mockTimeSlots });
});

app.get('/api/staff', (req, res) => {
  let data = mockStaff.filter(s => s.status === 1);
  if (req.query.role) {
    data = data.filter(s => s.role === req.query.role);
  }
  res.json({ success: true, data });
});

app.get('/api/packages', (req, res) => {
  let data = mockPackages.filter(p => p.status === 1);
  if (req.query.type) {
    data = data.filter(p => p.type === req.query.type);
  }
  data = data.map(p => ({ ...p, includes: JSON.parse(p.includes) }));
  res.json({ success: true, data });
});

app.get('/api/appointments/check-availability', (req, res) => {
  const { hall_id, date } = req.query;
  if (!hall_id || !date) {
    return res.status(400).json({ success: false, message: '参数不完整' });
  }
  const bookedSlotIds = mockAppointments
    .filter(a => a.hall_id == hall_id && a.appointment_date === date && a.status !== 'cancelled')
    .map(a => a.time_slot_id);
  
  const data = mockTimeSlots.map(slot => ({
    ...slot,
    available: !bookedSlotIds.includes(slot.id)
  }));
  console.log(`[Mock] 查询可用时段 hall=${hall_id} date=${date}, 返回:`, data.map(d => ({ id: d.id, name: d.name, available: d.available })));
  res.json({ success: true, data });
});

app.post('/api/appointments', (req, res) => {
  const body = req.body;
  const appointment_no = `FB${Date.now()}${apptCounter++}`;
  const newAppt = {
    id: apptCounter,
    appointment_no,
    ...body,
    total_price: body.total_price || 0,
    status: 'pending',
    created_at: new Date().toISOString()
  };
  mockAppointments.push(newAppt);
  console.log('[Mock] 创建预约:', appointment_no);
  res.json({ success: true, data: { id: newAppt.id, appointment_no, total_price: newAppt.total_price }, message: '预约成功' });
});

app.get('/api/appointments/my', (req, res) => {
  const { phone, appointment_no } = req.query;
  let data = mockAppointments;
  if (phone) data = data.filter(a => a.family_phone === phone);
  if (appointment_no) data = data.filter(a => a.appointment_no === appointment_no);
  
  data = data.map(a => ({
    ...a,
    hall_name: mockHalls.find(h => h.id === a.hall_id)?.name || '',
    slot_name: mockTimeSlots.find(s => s.id === a.time_slot_id)?.name || '',
    start_time: mockTimeSlots.find(s => s.id === a.time_slot_id)?.start_time || '',
    end_time: mockTimeSlots.find(s => s.id === a.time_slot_id)?.end_time || '',
    host_name: mockStaff.find(s => s.id === a.host_id)?.name || '',
    makeup_name: mockStaff.find(s => s.id === a.makeup_id)?.name || ''
  }));
  
  res.json({ success: true, data });
});

app.get('/api/appointments/:id', (req, res) => {
  const a = mockAppointments.find(x => x.id == req.params.id);
  if (!a) return res.status(404).json({ success: false, message: '预约不存在' });
  const data = {
    ...a,
    hall_name: mockHalls.find(h => h.id === a.hall_id)?.name || '',
    slot_name: mockTimeSlots.find(s => s.id === a.time_slot_id)?.name || '',
    start_time: mockTimeSlots.find(s => s.id === a.time_slot_id)?.start_time || '',
    end_time: mockTimeSlots.find(s => s.id === a.time_slot_id)?.end_time || '',
    host_name: mockStaff.find(s => s.id === a.host_id)?.name || '',
    makeup_name: mockStaff.find(s => s.id === a.makeup_id)?.name || '',
    host_package_name: mockPackages.find(p => p.id === a.host_package_id)?.name || '',
    makeup_package_name: mockPackages.find(p => p.id === a.makeup_package_id)?.name || ''
  };
  res.json({ success: true, data });
});

app.put('/api/appointments/:id/cancel', (req, res) => {
  const appt = mockAppointments.find(x => x.id == req.params.id);
  if (!appt) return res.status(400).json({ success: false, message: '预约不存在' });
  appt.status = 'cancelled';
  res.json({ success: true, message: '预约已取消' });
});

app.post('/api/reviews', (req, res) => {
  const { appointment_id, rating, comment } = req.body;
  const existing = mockReviews.find(r => r.appointment_id == appointment_id);
  if (existing) {
    existing.rating = rating;
    existing.comment = comment || '';
    return res.json({ success: true, message: '评价已更新' });
  }
  mockReviews.push({ id: mockReviews.length + 1, appointment_id, rating, comment: comment || '', created_at: new Date().toISOString() });
  res.json({ success: true, message: '评价提交成功' });
});

app.get('/api/reviews/appointment/:id', (req, res) => {
  const review = mockReviews.find(r => r.appointment_id == req.params.id);
  res.json({ success: true, data: review || null });
});

app.get('/api/reviews', (req, res) => {
  const data = mockReviews.map(r => ({
    ...r,
    appointment_no: mockAppointments.find(a => a.id === r.appointment_id)?.appointment_no || '',
    deceased_name: mockAppointments.find(a => a.id === r.appointment_id)?.deceased_name || '',
    family_name: mockAppointments.find(a => a.id === r.appointment_id)?.family_name || '',
    hall_name: mockHalls.find(h => h.id === mockAppointments.find(a => a.id === r.appointment_id)?.hall_id)?.name || ''
  }));
  res.json({ success: true, data, total: data.length });
});

app.get('/api/admin/schedule', (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ success: false, message: '请选择日期' });
  
  const appointments = mockAppointments.filter(a => a.appointment_date === date && a.status !== 'cancelled').map(a => ({
    ...a,
    hall_name: mockHalls.find(h => h.id === a.hall_id)?.name || '',
    start_time: mockTimeSlots.find(s => s.id === a.time_slot_id)?.start_time || '',
    end_time: mockTimeSlots.find(s => s.id === a.time_slot_id)?.end_time || '',
    host_name: mockStaff.find(s => s.id === a.host_id)?.name || '',
    makeup_name: mockStaff.find(s => s.id === a.makeup_id)?.name || ''
  }));
  
  res.json({ success: true, data: { halls: mockHalls, slots: mockTimeSlots, schedule: [], appointments } });
});

app.get('/api/admin/appointments', (req, res) => {
  const { date, status, page = 1, pageSize = 10 } = req.query;
  let data = mockAppointments;
  if (date) data = data.filter(a => a.appointment_date === date);
  if (status) data = data.filter(a => a.status === status);
  
  data = data.map(a => ({
    ...a,
    hall_name: mockHalls.find(h => h.id === a.hall_id)?.name || '',
    slot_name: mockTimeSlots.find(s => s.id === a.time_slot_id)?.name || '',
    start_time: mockTimeSlots.find(s => s.id === a.time_slot_id)?.start_time || '',
    end_time: mockTimeSlots.find(s => s.id === a.time_slot_id)?.end_time || '',
    host_name: mockStaff.find(s => s.id === a.host_id)?.name || '',
    makeup_name: mockStaff.find(s => s.id === a.makeup_id)?.name || ''
  }));
  
  res.json({ success: true, data, total: data.length });
});

app.put('/api/admin/appointments/:id/status', (req, res) => {
  const appt = mockAppointments.find(x => x.id == req.params.id);
  if (!appt) return res.status(400).json({ success: false, message: '预约不存在' });
  appt.status = req.body.status;
  res.json({ success: true, message: '状态更新成功' });
});

app.listen(PORT, () => {
  console.log(`Mock后端服务运行在 http://localhost:${PORT}`);
});
