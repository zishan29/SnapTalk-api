const express = require('express');
const passport = require('passport');
const multer = require('multer');
const userController = require('../controllers/userController');
const messageController = require('../controllers/messageController');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/signup', userController.signUp);

router.post('/login', userController.login);

router.post('/verifyToken', userController.verifyToken);

router.get(
  '/users',
  passport.authenticate('jwt', { session: false }),
  userController.getAllUsers,
);

router.get(
  '/messages/:receiverId',
  passport.authenticate('jwt', { session: false }),
  messageController.getMessages,
);

router.post(
  '/messages',
  passport.authenticate('jwt', { session: false }),
  upload.single('image'),
  messageController.createMessage,
);

router.get(
  '/user',
  passport.authenticate('jwt', { session: false }),
  userController.getUser,
);

router.post(
  '/user',
  passport.authenticate('jwt', { session: false }),
  upload.single('image'),
  userController.editUser,
);

router.put(
  '/contacts',
  passport.authenticate('jwt', { session: false }),
  userController.addContact,
);

router.delete(
  '/contacts',
  passport.authenticate('jwt', { session: false }),
  userController.removeContact,
);

module.exports = router;
