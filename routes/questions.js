'use strict';

const express = require('express');
const router = express.Router();

const Question = require('../models/user.js');

/* ========== GET A POKEMON ========== */
router.get('/questions', (req, res, next) => {
  const { typeColor, imageURL, imageDescription, description, id } = req.body;
  
  // verify required fields exist
  const requiredFields = ['typeColor', 'imageURL', 'imageDescription', 'description', 'pokedex'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }
  return Question
    .findOne()
    .then(res=>json(res))
    .catch(err => {
        // Forward validation errors on to the client, otherwise give a 500
      // error because something unexpected has happened
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({code: 500, message: 'Internal server error'})
    })
})

/* ========== GET A POKEMON ========== */
router.post('/questions', (req, res, next) => {
    // const { id } = req.params;
    const { input, id } = req.body;
    return Question
      .findById(id)
      .then(res=>json(res))
      .then(res=>res.name === input ? {bool: true, name: res.name}  : {bool: false, name: res.name})
      .catch(err => {
          // Forward validation errors on to the client, otherwise give a 500
        // error because something unexpected has happened
        if (err.reason === 'ValidationError') {
          return res.status(err.code).json(err);
        }
        res.status(500).json({code: 500, message: 'Internal server error'})
      })
  
  })

