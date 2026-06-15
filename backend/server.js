const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const hallsRouter = require('./routes/halls');
const timeSlotsRouter = require('./routes/timeSlots');
const staffRouter = require('./routes/staff');
const packagesRouter = require('./routes/packages');
const appointmentsRouter = require('./routes/appointments');
const reviewsRouter = require('./routes/reviews');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '服务运行正常' });
});

app.use('/api/halls', hallsRouter);
app.use('/api/time-slots', timeSlotsRouter);
app.use('/api/staff', staffRouter);
app.use('/api/packages', packagesRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/admin', adminRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
