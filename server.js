const express = require("express");
require("dotenv").config();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const userRoute = require('./routes/auth.route');
const listRoute = require('./routes/list.route');
const connectToDatabase = require("./database/db");
connectToDatabase();

const app = express();
app.set('trust proxy', 1)

// CORS must be before anything
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true 
}));

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Rate limiter for login/signup
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { message: "Too many login attempts. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply only to signin/signup routes
app.use('/api/v1/signin', authLimiter);
app.use('/api/v1/signup', authLimiter);

// Routes
app.use('/api/v1', userRoute);
app.use('/api/v2', listRoute);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running at ${port}`);
});
