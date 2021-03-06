'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');

const { PORT, CLIENT_ORIGIN } = require('./config.js');
const localStrategy = require('./passport/local.js');
const jwtStrategy = require('./passport/jwt.js');
const { dbConnect } = require('./db-mongoose');
// const {dbConnect} = require('./db-knex');

// Configure Passport to utilize strategies, this just loads into memory
passport.use(localStrategy);
passport.use(jwtStrategy);

// Import routers for specific endpoints
const authRouter = require('./routes/auth.js');
const usersRouter = require('./routes/users.js');
const protectedRouter = require('./routes/protected.js');
const questionsRouter = require('./routes/questions.js');

const app = express();

// Parse request body
app.use(express.json());

// Log all requests. Skip logging during
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'common', {
  skip: (req, res) => process.env.NODE_ENV === 'test'
}));

// CORS
app.use(
  cors({ origin: CLIENT_ORIGIN })
);
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
//   res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
//   if (req.method === 'OPTIONS') {
//     return res.sendStatus(204);
//   }
//   next();
// });

// API routes
app.use('/api', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/protected', protectedRouter);
app.use('/api/questions', questionsRouter);

// Custom 404 Not Found route handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Custom Error Handler
app.use((err, req, res, next) => {
  if (err.status) {
    const errBody = Object.assign({}, err, { message: err.message });
    res.status(err.status).json(errBody);
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.error(err);
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}

if (require.main === module) {
  dbConnect();
  runServer();
}

module.exports = { app };
