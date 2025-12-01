const express = require('express');
const path = require('path');
const router = require('./routes/api.js');
try {
    // dotenv is optional here; if missing, continue without crash
    require('dotenv').config();
} catch (err) {
    console.warn('dotenv not installed; continuing without .env');
}
const app = express();
// Initialize MongoDB connection (Mongoose)
const connectDB = require('./database/database.js');
connectDB();
const port = 3000;

app.use(express.json());

// Serve static files from FRONTEND folder
app.use('/css', express.static(path.join(__dirname, '../FRONTEND/css')));
app.use('/controllers', express.static(path.join(__dirname, '../FRONTEND/controllers')));
app.use('/html', express.static(path.join(__dirname, '../FRONTEND/html')));

// API routes
app.use('/api', router);

// Root and other routes
app.use(router);

app.listen(port, () => {
    console.log(`Proyecto Final Running on Port ${port}!`);
});