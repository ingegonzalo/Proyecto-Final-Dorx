const express = require('express');
const path = require('path');
const router = require('./routes/api.js');
const app = express();
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