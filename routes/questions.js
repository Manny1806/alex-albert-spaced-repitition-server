'use strict';

const express = require('express');
const passport = require('passport');

const router = express.Router();
const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });

const User = require('../models/user.js');
const Question = require('../models/question.js');

/* ========== GET A POKEMON ========== */
router.get('/:id', jwtAuth, (req, res, next) => {
  const { id } = req.params;
  return User
    .findById(id)
    .then(user => {
      console.log(user.questions[user.head]);
      delete user.questions[user.head].question.name;
      return res.json(user.questions[user.head]);
    })
    .catch(err => next(err));
});

/* ========== GET ANSWER FOR A POKEMON ========== */
router.post('/:id', jwtAuth, (req, res, next) => {
  const { input, userId } = req.body;

  return User 
    .findById(userId)
    .then(user => {
      const answer = {
        name: user.questions[user.head].question.name
      };
      if (user.questions[user.head].question.name === input) {
        answer.bool = true;
      }
      else {
        answer.bool = false;
      }

      // grab current "node"
      const currentQuestion = user.questions[user.head];
      // save for later as next pointer of insertAfterQuestion
      const currentHead = user.head;
      // set header to next node
      user.head = currentQuestion.next;

      if (answer.bool) {
        // if answer is correct, double memoryStrength
        currentQuestion.memoryStrength *= 2;
        currentQuestion.attempts++;
        currentQuestion.passed++;
      } else {
        currentQuestion.memoryStrength = 1;
        currentQuestion.attempts++;
      }

      // loop thru linked list and find an insertion point
      let insertAfterQuestion = currentQuestion;
      let tempQuestion = currentQuestion;
      for (let i = 0; i < currentQuestion.memoryStrength; i++) {
        let index = tempQuestion.next;
        if (currentQuestion.memoryStrength > user.questions.length) {
          currentQuestion.memoryStrength = user.questions.length - 1;
          index = user.questions.length - 1;
        }
        insertAfterQuestion = user.questions[index];
        tempQuestion = user.questions[tempQuestion.next];
      }

      // if the insertion point is at the end, make the currQuestion point to null
      if (insertAfterQuestion.next === null) {
        currentQuestion.next = null;
        // otherwise set the currentQuestion to point to the node after the insertion point
      } else {
        currentQuestion.next = insertAfterQuestion.next;
      }
      // set the insertion point to point to the original index of the currentQuestion
      insertAfterQuestion.next = currentHead;

      user.save();

      Object.assign(
        answer, {
          attempts: currentQuestion.attempts,
          passed: currentQuestion.passed
        }
      );

      return answer;
    })
    .then(answer => res.json(answer))
    .catch(err => {
      // forward validation errors on to the client, otherwise give a 500 error because something unexpected has happened
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({code: 500, message: 'Internal server error'});
    });
});

module.exports = router;
