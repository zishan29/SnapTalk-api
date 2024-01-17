const express = require('express');
const passport = require('passport');
const userController = require('../controllers/userController');
const messageController = require('../controllers/messageController');

const router = express.Router();

router.post('/signup', userController.signUp);

router.post('/login', userController.login);

router.get('/users', userController.getAllUsers);

router.get('/messages', messageController.getMessages);

router.post('/messages', messageController.createMessage);

module.exports = router;
