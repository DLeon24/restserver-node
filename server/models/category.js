const mongoose = require('mongoose');
const user = require('./user');
const Schema = mongoose.Schema;

let categorySchema = new Schema({
    description: { type: String, unique: true, required: [true, 'description is necessary'] },
    user: { type: Schema.Types.ObjectId, ref: user }
});

module.exports = mongoose.model('category', categorySchema);