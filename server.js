require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors'); // import cors

const adminRoutes = require('./src/routes/adminRoutes');
const studentRoutes = require('./src/routes/studentRoutes');

const app = express();
app.use(express.json());

// Enable CORS for all routes
app.use(cors());

// static frontend (optional) - serve frontend folder
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// API routes
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);

// fallback to index.html (for SPA or simple static pages)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error', err);
    process.exit(1);
});
