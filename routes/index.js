const express = require('express');
const passport = require('passport');
const userController = require('../controllers/userController');
const messageController = require('../controllers/messageController');

const router = express.Router();

router.post('/signup', userController.signUp);

router.post('/login', userController.login);

router.post('/verifyToken', userController.verifyToken);

router.get(
  '/users',
  passport.authenticate('jwt', { session: false }),
  userController.getAllUsers,
);

router.get(
  '/messages',
  passport.authenticate('jwt', { session: false }),
  messageController.getMessages,
);

router.post(
  '/messages',
  passport.authenticate('jwt', { session: false }),
  messageController.createMessage,
);

module.exports = router;
