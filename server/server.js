const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

require('./config/config');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


app.use(require('./routes/user'));


mongoose.connect(process.env.URL_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
}, (err, res) => {
    if (err) throw err;
    console.log('Database online');
});

app.listen(process.env.PORT, () => console.log(`Listen on port:${process.env.PORT}`));