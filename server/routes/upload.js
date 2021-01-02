const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const User = require('../models/user');
const Product = require('../models/product');
const fs = require('fs');
const path = require('path');
// default options
app.use(fileUpload());

app.put('/upload/:type/:id', function (req, res) {
  let type = req.params.type;
  let id = req.params.id;
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({
      ok: false,
      err: {
        message: 'No file has been selected',
      },
    });
  }
  // valid type
  let validTypes = ['products', 'users'];
  if (validTypes.indexOf(type) < 0) {
    return res.status(400).json({
      ok: false,
      err: {
        message: 'Types allowed are ' + validTypes.join(', '),
      },
    });
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let file = req.files.file;
  let fileNameSplit = file.name.split('.');
  let fileExtension = fileNameSplit[fileNameSplit.length - 1];

  // extension allowed
  let validExtensions = ['png', 'jpg', 'gif', 'jpeg'];

  if (validExtensions.indexOf(fileExtension) < 0) {
    return res.status(400).json({
      ok: false,
      err: {
        message: 'Extensions allowed are ' + validExtensions.join(', '),
      },
    });
  }

  // change name's file
  let newFileName = `${id}-${new Date().getMilliseconds()}.${fileExtension}`;

  // Use the mv() method to place the file somewhere on your server
  file.mv(`uploads/${type}/${newFileName}`, (err) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }
    if (type === 'users') {
      userImage(id, res, newFileName);
    } else {
      productImage(id, res, newFileName);
    }
  });
});

function userImage(id, res, fileName) {
  User.findById(id, (err, userDB) => {
    if (err) {
      removeImage('users', fileName);
      return res.status(500).json({
        ok: false,
        err,
      });
    }
    if (!userDB) {
      removeImage('users', fileName);
      return res.status(400).json({
        ok: false,
        err: {
          message: 'User not found',
        },
      });
    }
    removeImage('users', userDB.image);
    userDB.image = fileName;
    userDB.save((err, userSaved) => {
      res.json({
        ok: true,
        user: userSaved,
        img: fileName,
      });
    });
  });
}

function productImage(id, res, fileName) {
  Product.findById(id, (err, productDB) => {
    if (err) {
      removeImage('products', fileName);
      return res.status(500).json({
        ok: false,
        err,
      });
    }
    if (!productDB) {
      removeImage('products', fileName);
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Product not found',
        },
      });
    }
    removeImage('products', productDB.image);
    productDB.image = fileName;
    productDB.save((err, productSaved) => {
      res.json({
        ok: true,
        product: productSaved,
        img: fileName,
      });
    });
  });
}

function removeImage(type, fileName) {
  let imagePath = path.resolve(__dirname, `../../uploads/${type}/${fileName}`);
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }
}

module.exports = app;
