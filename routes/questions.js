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

  let resultPokemonName
  return Question
    .findById(id)
    // .then(result => result.name === input ? res.json({bool: true, name: result.name}) : res.json({bool: false, name: result.name}))
    .then(result => {
      console.log("triggered")
      resultPokemonName = result.name
      return result.name === input ? {isCorrect: true, answer: result.name} : {isCorrect: false, answer: result.name}})
    .then(answer => {
      if (answer.isCorrect) {
        User
          .findById(userId)
          .then(user => {
            let newQuestions = user
            let newHead = newQuestions.questions[user.head].next;
            newQuestions.questions[user.head].memoryStrength *= 2
            newQuestions.questions[user.head].next = newQuestions.questions[newQuestions.questions[user.head].memoryStrength].next
            // newQuestions.questions[user.head].next =  user.questions[user.head].memoryStrength * 2
            // newQuestions.questions[user.head].memoryStrength *= 2
            newQuestions.questions[newQuestions.questions[user.head].memoryStrength].next = user.head
            newQuestions.head = newHead
            console.log(newQuestions)
            return User.findByIdAndUpdate(userId, {head: newHead, questions: newQuestions.questions})
          })
          .then(()=>res.json({bool: true, name: resultPokemonName}))
          .catch();
        // send user feedback using res.json
      } else {
        User
          .findById(userId)
          .then(user => {
            let newQuestions = user
            let newHead = newQuestions.questions[user.head].next;
            newQuestions.questions[user.head].next =  user.questions[user.head].memoryStrength
            newQuestions.questions[user.head].memoryStrength = 1
            newQuestions.questions[newQuestions.questions[user.head].next].next = user.head
            newQuestions.head = newHead
            console.log(newQuestions)
            return User.findByIdAndUpdate(userId, {head: newHead, questions: newQuestions.questions})
          })
          .then(()=>res.json({bool: false, name: resultPokemonName}))
          .catch();
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
