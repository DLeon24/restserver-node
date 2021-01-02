const mongoose = require('mongoose');
const category = require('./category');
const user = require('./user');
let Schema = mongoose.Schema;

let productSchema = new Schema({
  name: { type: String, required: [true, 'name is necessary'] },
  unitPrice: { type: Number, required: [true, 'unit price is necessary'] },
  description: { type: String, required: false },
  image: { type: String, required: false },
  available: { type: Boolean, required: true, default: true },
  category: { type: Schema.Types.ObjectId, ref: category, required: true },
  user: { type: Schema.Types.ObjectId, ref: user },
});

module.exports = mongoose.model('product', productSchema);
