'use strict';

const express = require('express');
const router = express.Router();

const Question = require('../models/question.js');

// mongoimport --uri MONGODB_URI --collection COLLECTION_NAME --file FILE_NAME --jsonArray

/* ========== GET A POKEMON ========== */
router.get('/', (req, res, next) => {
  return Question
    .findOne()
    .then(result=>res.json(result))
    .catch(err => {
      // Forward validation errors on to the client, otherwise give a 500
      // error because something unexpected has happened
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({code: 500, message: 'Internal server error'});
    });
});

/* ========== GET A POKEMON ========== */
router.post('/', (req, res, next) => {
  // const { id } = req.params;
  const { input, id } = req.body;
  return Question
    .findById(id)
    .then(result => result.name === input ? res.json({bool: true, name: result.name}) : res.json({bool: false, name: result.name}))
    .catch(err => {
      // Forward validation errors on to the client, otherwise give a 500
      // error because something unexpected has happened
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({code: 500, message: 'Internal server error'});
    });
});

module.exports = router;
