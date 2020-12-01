const express = require('express');
let {validateToken, validateAdminRole} = require('../middlewares/authentication');
const app = express();
let Category = require('../models/category');

app.get('/category', validateToken, (req, res) => {
	Category.find({})
		.sort('description')
		.populate('user', 'name email')
		.exec((err, categories) => {
			if (err) {
				return res.status(500).json({
					ok: false,
					err
				});
			}
			res.json({
				ok: true,
				categories
			});
		});
});

app.get('/category/:id', validateToken, (req, res) => {
	let id = req.params.id;
	Category.findById(id, (err, categoryDB) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				err
			});
		}
		if (!categoryDB) {
			return res.status(400).json({
				ok: false,
				err: {
					message: 'Category does not exist.'
				}
			});
		}
		res.json({
			ok: true,
			category: categoryDB
		});
	});
});

app.post('/category', validateToken, (req, res) => {
	let body = req.body;
	let category = new Category({
		description: body.description,
		user: req.user._id
	});
	category.save((err, categoryDB) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				err
			});
		}
		if (!categoryDB) {
			return res.status(400).json({
				ok: false,
				err
			});
		}
		res.json({
			ok: true,
			category: categoryDB
		});
	});

});

app.put('/category/:id', validateToken, (req, res) => {
	let id = req.params.id;
	let body = req.body;

	let description = {description: body.description};
	Category.findByIdAndUpdate(id, description, {new: true, runValidators: true}, (err, categoryDB) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				err
			});
		}
		if (!categoryDB) {
			return res.status(400).json({
				ok: false,
				err
			});
		}
		res.json({
			ok: true,
			category: categoryDB
		});
	});
});

app.delete('/category/:id', [validateToken, validateAdminRole], (req, res) => {
	let id = req.params.id;
	Category.findByIdAndRemove(id, (err, categoryDB) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				err
			});
		}
		if (!categoryDB) {
			return res.status(400).json({
				ok: false,
				err: {
					message: 'Id does not exist.'
				}
			});
		}
		res.json({
			ok: true,
			message: 'Category removed.'
		});
	});
});

module.exports = app;
