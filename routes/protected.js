'use strict';

const express = require('express');
const passport = require('passport');

const router = express.Router();
const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });

router.get('/', jwtAuth, (req, res, next) => {
  res.json({message: 'protected data loaded'});
});

module.exports = router;
