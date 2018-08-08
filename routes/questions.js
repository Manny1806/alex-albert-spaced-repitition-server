'use strict';

const express = require('express');
const passport = require('passport');

const router = express.Router();
const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });

const User = require('../models/user.js');
const Question = require('../models/question.js');

/* ========== GET A POKEMON ========== */
router.post('/', jwtAuth, (req, res, next) => {
  const { id } = req.body;
  console.log(id);
  return User
    .findById(id)
    .then(user => res.json(user.questions[user.head]))
    .catch(err => next(err));
});

/* ========== GET ANSWER FOR A POKEMON ========== */
router.post('/:id', jwtAuth, (req, res, next) => {
  const { id } = req.params;
  const { input, userId } = req.body;
  return Question
    .findById(id)
    // .then(result => result.name === input ? res.json({bool: true, name: result.name}) : res.json({bool: false, name: result.name}))
    .then(result => result.name === input ? {isCorrect: true, answer: result.name} : {isCorrect: false, answer: result.name})
    .then(answer => {
      if (answer.isCorrect) {
        // update user's list of questions
        // call up user's list of question, modify
        User
          .findById(userId)
          .then(user => {
            // already know where we are based on head
            // find insertion point, which is question[newMemValue]
            // so question[newMemValue].next changes to currHead
            let currHead = user.questions[user.head];
            let currMemValue = user.questions[user.head].memoryStrength;
            let currNext = user.questions[user.head].next;
            let nextQuestion;

            currMemValue *= 2;
            currHead = currNext;
            currNext;

            // return User.findAndUpdate()
          })
          .catch();
        // send user feedback using res.json
      } else {
        // update user's list of questions
        User.findById(userId).then().catch();
        // send user feedback using res.json
      }
    })
    .catch(err => {
      // Forward validation errors on to the client, otherwise give a 500
      // error because something unexpected has happened
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({code: 500, message: 'Internal server error'});
    });
});













// mongoimport --uri MONGODB_URI --collection COLLECTION_NAME --file FILE_NAME --jsonArray

/* ========== GET A POKEMON ========== */
// router.get('/:count', (req, res, next) => {
//   console.log(req.params.count);
//   return Question
//     .findOne().skip(Number(req.params.count))
//     .then(result=>res.json(result))
//     .catch(err => {
//       // Forward validation errors on to the client, otherwise give a 500
//       // error because something unexpected has happened
//       if (err.reason === 'ValidationError') {
//         return res.status(err.code).json(err);
//       }
//       res.status(500).json({code: 500, message: 'Internal server error'});
//     });
// });

// /* ========== GET ANSWER FOR A POKEMON ========== */
// router.post('/', (req, res, next) => {
//   // const { id } = req.params;
//   const { input, id } = req.body;
//   return Question
//     .findById(id)
//     .then(result => result.name === input ? res.json({bool: true, name: result.name}) : res.json({bool: false, name: result.name}))
//     .catch(err => {
//       // Forward validation errors on to the client, otherwise give a 500
//       // error because something unexpected has happened
//       if (err.reason === 'ValidationError') {
//         return res.status(err.code).json(err);
//       }
//       res.status(500).json({code: 500, message: 'Internal server error'});
//     });
// });

module.exports = router;
