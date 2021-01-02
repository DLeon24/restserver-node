const express = require('express');

const { validateToken } = require('../middlewares/authentication');

let app = express();
let Product = require('../models/product');

app.get('/product', validateToken, (req, res) => {
  let from = req.query.from || 0;
  from = Number(from);
  let limit = req.query.limit || 5;
  limit = Number(limit);

  Product.find({ available: true })
    .skip(from)
    .limit(limit)
    .populate('category', 'description')
    .populate('user', 'name email')
    .exec((err, products) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err,
        });
      }
      res.json({
        ok: true,
        products,
      });
    });
});

app.get('/product/:id', validateToken, (req, res) => {
  let id = req.params.id;
  Product.findById(id)
    .populate('category', 'description')
    .populate('user', 'name email')
    .exec((err, productDB) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err,
        });
      }
      if (!productDB) {
        return res.status(400).json({
          ok: true,
          err: {
            message: 'Product does not exist',
          },
        });
      }
      res.json({
        ok: true,
        product: productDB,
      });
    });
});

app.get('/product/find/:term', validateToken, (req, res) => {
  let term = req.params.term;
  let regex = new RegExp(term, 'i');

  Product.find({ name: regex, available: true })
    .populate('category', 'description')
    .exec((err, products) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err,
        });
      }
      res.json({
        ok: true,
        products,
      });
    });
});

app.post('/product', validateToken, (req, res) => {
  let body = req.body;
  let product = new Product({
    name: body.name,
    unitPrice: body.unitPrice,
    description: body.description,
    category: body.category,
    user: req.user._id,
  });
  product.save((err, productDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }
    if (!productDB) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }
    res.json({
      ok: true,
      product: productDB,
    });
  });
});

app.put('/product/:id', validateToken, (req, res) => {
  let id = req.params.id;
  let body = req.body;
  let newProduct = {
    name: body.name,
    unitPrice: body.unitPrice,
    description: body.description,
    category: body.category,
    available: body.available,
  };
  Product.findByIdAndUpdate(
    id,
    newProduct,
    { new: true, runValidators: true },
    (err, productDB) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err,
        });
      }
      if (!productDB) {
        return res.statuws(400).json({
          ok: false,
          err,
        });
      }
      res.json({
        ok: true,
        product: productDB,
      });
    }
  );
});

app.delete('/product/:id', validateToken, (req, res) => {
  let id = req.params.id;

  let available = { available: false };
  Product.findByIdAndUpdate(id, available, { new: true }, (err, productDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }
    if (!productDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Id does not exist',
        },
      });
    }
    res.json({
      ok: true,
      message: 'Product removed',
    });
  });
});

module.exports = app;

