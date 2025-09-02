// server.js
const express = require('express');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const wordRoutes = require('./routes/guess');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// --- CORS setup ---
// FRONTEND_URL should be set in .env for production (e.g., https://your-wordle.vercel.app)
// In dev, you can leave it unset, and fallback will be localhost:5173 or *.
const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173"; // adjust port if CRA uses 3000
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
}));

// --- Healthcheck route ---
app.get('/health', (req, res) => res.send('ok'));

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/word', wordRoutes);

// --- Error handling middleware ---
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ message: 'Server Error' });
});

// --- Dynamic Port (important for Render) ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
