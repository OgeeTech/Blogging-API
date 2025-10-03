const express = require('express');
const authRoutes = require('./src/routes/authRoutes');
const blogRoutes = require('./src/routes/blogRoutes');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
app.use(express.json());

// routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

// basic health check
app.get('/', (req, res) => res.json({ ok: true }));

// error handler
app.use(errorHandler);

module.exports = app;
