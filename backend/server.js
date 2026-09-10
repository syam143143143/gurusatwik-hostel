require('dotenv').config();

const express = require('express');
const cors = require('cors');

const pool = require('./config/database');
const dashboardRoutes = require('./routes/dashboard.routes');

const studentRoutes = require('./routes/student.routes');
const roomRoutes = require('./routes/room.routes');
const allocationRoutes = require('./routes/allocation.routes');
const feesRoutes = require('./routes/feesRoutes');
const paymentsRoutes = require('./routes/paymentsRoutes');
const attendanceRoutes =
  require('./routes/attendanceRoutes');
const complaintsRoutes = require('./routes/complaintsRoutes');
const reportsRoutes = require('./routes/reportsRoutes');
const authRoutes = require('./routes/authRoutes');
const { authenticateToken } = require('./middleware/authMiddleware');
const app = express();

app.use(cors());
app.use(express.json());


// Root API
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Gurusatwik Hostel API is running'
  });
});


// Health Check
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');

    res.json({
      success: true,
      message: 'Backend and PostgreSQL are connected',
      databaseTime: result.rows[0].now
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});


// Dashboard
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/students', studentRoutes);

app.use('/api/rooms', roomRoutes);
app.use('/api/allocations', allocationRoutes);
app.use('/api/fees', feesRoutes);

app.use('/api/payments', paymentsRoutes);
app.use(
  '/api/attendance',
  attendanceRoutes
);
app.use('/api/complaints', complaintsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', authenticateToken);
// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Gurusatwik Hostel API running on port ${PORT}`);
});