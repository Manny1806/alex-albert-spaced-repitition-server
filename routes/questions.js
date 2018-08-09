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
      console.log(result)
      resultPokemonName = result.name
      return result.name === input ? {isCorrect: true, answer: result.name} : {isCorrect: false, answer: result.name}})
    .then(answer => {
      console.log("triggered")
      if (answer.isCorrect) {
        User
          .findById(userId)
          .then(user => {
            console.log(user)
            let currentQuestion = user.questions[user.head]
            let currentIndex = user.head
            currentQuestion.memoryStrength *= 2;
            user.head = currentQuestion.next;
            let insertAfterQuestion = currentQuestion;
            let currQ = currentQuestion;
              for (let i = 0; i < currentQuestion.memoryStrength; i++) {
                let index = currQ.next;
                if (currentQuestion.memoryStrength > user.questions.length) {
                  currentQuestion.memoryStrength = user.questions.length - 1;
                  index = user.questions.length - 1;
                }
                insertAfterQuestion = user.questions[index];
                currQ = user.questions[currQ.next];
              }

              if (insertAfterQuestion.next === null) {
                currentQuestion.next = null;
              // otherwise set the currentQuestion to point to the node after the insertion point
              } else {
                currentQuestion.next = insertAfterQuestion.next;
              }
              // set the insertion point to point to the original index of the currentQuestion
              insertAfterQuestion.next = currentIndex;
              console.log(user)
              user.save();
            // }
            // newQuestions.questions[user.head].next = newQuestions.questions[newQuestions.questions[user.head].memoryStrength].next
            // newQuestions.questions[newQuestions.questions[user.head].memoryStrength].next = user.head
            // newQuestions.head = newHead
            // console.log(newQuestions)
            return user
          })
          .then((user)=>res.json({bool: true, name: resultPokemonName}))
          .catch(err => next(err));
        // send user feedback using res.json
      } else {
        User
          .findById(userId)
          .then(user => {
            let currentQuestion = user.questions[user.head]
            let currentIndex = user.head
            currentQuestion.memoryStrength = 1;
            user.head = currentQuestion.next;
            let insertAfterQuestion = currentQuestion;
            let currQ = currentQuestion;
              for (let i = 0; i < currentQuestion.memoryStrength; i++) {
                let index = currQ.next;
                if (currentQuestion.memoryStrength > user.questions.length) {
                  currentQuestion.memoryStrength = user.questions.length - 1;
                  index = user.questions.length - 1;
                }
                insertAfterQuestion = user.questions[index];
                currQ = user.questions[currQ.next];
              }

              if (insertAfterQuestion.next === null) {
                currentQuestion.next = null;
              // otherwise set the currentQuestion to point to the node after the insertion point
              } else {
                currentQuestion.next = insertAfterQuestion.next;
              }
              // set the insertion point to point to the original index of the currentQuestion
              insertAfterQuestion.next = currentIndex;
        
              user.save();
              return user
          })
            .then((user)=>res.json({bool: false, name: resultPokemonName}))
          .catch(err => next(err));
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

module.exports = router;
