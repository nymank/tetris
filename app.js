const express = require('express');
const app = express();
require('dotenv').config();

const port = process.env.port || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}!`);
});

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/index.html`);
});

app.get('/tetris/index.js', (req, res) => {
    res.sendFile(`${__dirname}/index.js`);
});