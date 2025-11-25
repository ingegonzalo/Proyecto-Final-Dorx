const express = require('express');
const router = require('./routes/api.js');
const app = express();
const port = 3000;

app.use(express.json());
app.use(router);
app.use('/api', router);

app.listen(port, () => {
    console.log(`Proyecto Final Running on Port ${port}!`);
});

app.use(express.static('FRONTEND'));
app.use('/controllers', express.static('../FRONTEND/controllers'));
app.use('/html', express.static('../FRONTEND/html'));
app.use('/css', express.static('../FRONTEND/css'));