const express = require('express');
const fs = require('fs');
const path = require('path');
const { validateTokenUrl } = require('../middlewares/authentication');
let app = express();

app.get('/image/:type/:image', validateTokenUrl, (req, res) => {
  let type = req.params.type;
  let image = req.params.image;
  let imagePath = path.resolve(__dirname, `../../uploads/${type}/${image}`);
  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    let noImagePath = path.resolve(__dirname, '../assets/image-not-found.jpg');
    res.sendFile(noImagePath);
  }
});

module.exports = app;
