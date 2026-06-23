require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const User = require('./models/User');

const authRoutes = require('./routes/authRoutes');
const testRoutes = require('./routes/testRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const offerRoutes = require('./routes/offerRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');
const settingRoutes = require('./routes/settingRoutes');

connectDB();

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Anjali Diagnostic Centre API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/settings', settingRoutes);

app.use(notFound);
app.use(errorHandler);

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: process.env.ADMIN_EMAIL || 'admin@anjali.com',
        password: process.env.ADMIN_PASSWORD || 'Admin@123',
        role: 'admin',
      });
      console.log('Admin user created successfully');
    }
  } catch (error) {
    console.error('Error seeding admin:', error.message);
  }
};

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  seedAdmin();
});
