'use strict';

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  pokedex: {type: Number, required: true, unique: true},
  name: { type: String, required: true, unique: true},
  typeColor: {type: String, required: true},
  imageURL: {type: String, required: true},
  imageDescription: {type: String, required: true},
  description: {type: String, required: true}
});

// Add `createdAt` and `updatedAt` fields
// questionSchema.set('timestamps', true);

// Customize output for `res.json(data)`, `console.log(data)` etc.
questionSchema.set('toObject', {
  virtuals: true, // include built-in virtual `id`
  versionKey: false, // remove `__v` version key
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
  }
});

module.exports = mongoose.model('Question', questionSchema);
