'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  questions: [
    {
      question: {
        id: mongoose.Schema.Types.ObjectId,
        pokedex: {type: Number, required: true, unique: true},
        typeColor: {type: String, required: true},
        imageURL: {type: String, required: true},
        imageDescription: {type: String, required: true},
        description: {type: String, required: true},
      },
      memoryStrength: {type: Number, default: 0},
      attempts: {type: Number, default: 0},
      passed: {type: Number, default: 0},
      next: {type: Number}
    }
  ],
  head: {type: Number, default: 0}
});

userSchema.set('timestamps', true);

userSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.password;
    delete ret.updatedAt;
  }
});

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

module.exports = mongoose.model('User', userSchema);
