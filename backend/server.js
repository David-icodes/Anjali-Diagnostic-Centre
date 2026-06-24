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
const radiologyRoutes = require('./routes/radiologyRoutes');
const healthPackageRoutes = require('./routes/healthPackageRoutes');
const reportRoutes = require('./routes/reportRoutes');
const activityLogRoutes = require('./routes/activityLogRoutes');
const userRoutes = require('./routes/userRoutes');
const heroSlideRoutes = require('./routes/heroSlideRoutes');

connectDB();

const app = express();
app.set('trust proxy', 1);

const productionOrigins = [
  'https://anjali-diagnostic-centre.vercel.app',
  'https://anjalidiagnostic.com',
  'https://www.anjalidiagnostic.com',
  'http://localhost:3000',
  'http://localhost:3001',
];

const envOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [...new Set([...productionOrigins, ...envOrigins])];

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    console.warn(`CORS blocked origin: ${origin}`);
    callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
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
app.use('/api/radiology', radiologyRoutes);
app.use('/api/health-packages', healthPackageRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hero-slides', heroSlideRoutes);

app.use(notFound);
app.use(errorHandler);

const seedSuperAdmin = async () => {
  try {
    const adminUsername = 'admin';
    const adminExists = await User.findOne({ username: adminUsername });

    if (!adminExists) {
      await User.create({
        name: 'Super Admin',
        username: 'admin',
        email: 'admin@anjalidiagnostic.com',
        password: 'Anjali@123',
        role: 'superadmin',
        isDefault: true,
        mobileNumber: '9876543210',
      });
      console.log('Default super admin created successfully (admin / Anjali@123)');
    } else if (!adminExists.isDefault) {
      adminExists.isDefault = true;
      await adminExists.save();
      console.log('Existing admin marked as default super admin');
    }
  } catch (error) {
    console.error('Error seeding admin:', error.message);
  }
};

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  seedSuperAdmin();
});
