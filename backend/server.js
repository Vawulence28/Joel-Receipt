const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const pool = require('./config/db');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const { apiLimiter } = require('./middleware/rateLimiter');
const clientRoutes = require('./routes/client.routes');
const quotationRoutes = require('./routes/quotation.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const receiptRoutes = require('./routes/receipt.routes');
const reportRoutes = require('./routes/report.routes');
const settingsRoutes = require('./routes/settings.routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

// When hosting on the same domain, CORS can be simplified or restricted to your Render URL
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'https://jorec.onrender.com',
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);

app.use(
  session({
    store: new pgSession({
      pool: pool,
      tableName: 'jcir_sessions',
      createTableIfMissing: false,
    }),
    secret: process.env.SESSION_SECRET || 'default_session_secret_change_me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      // Since frontend and backend share the exact same domain on Render, 'lax' works perfectly for first-party cookies!
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// API Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);

// --- SERVE REACT FRONTEND STATIC FILES IN PRODUCTION ---
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});
// -----------------------------------------------------

app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`Joel Consult Finance Desk listening on port ${PORT}`);
});