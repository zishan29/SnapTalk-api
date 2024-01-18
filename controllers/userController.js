const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/user');

exports.signUp = [
  body('username').custom(async (username) => {
    if (!username || username.length < 3) {
      throw new Error('Username is too short');
    }

    const user = await User.findOne({ username });
    if (user) {
      throw new Error('Username already exists');
    }
    return true;
  }),
  body('email').custom(async (email) => {
    const userWithEmail = await User.findOne({ email });

    if (userWithEmail) {
      throw new Error('Email already in use');
    }
  }),
  body('password').isLength({ min: 5 }).withMessage('Password is too short'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      const errorMessages = {};
      errors.array().forEach((error) => {
        const { path, msg } = error;
        if (!errorMessages[path]) {
          errorMessages[path] = [];
        }
        errorMessages[path].push(msg);
      });

      res.status(400).json({ errors: errorMessages });
    } else {
      const hashedPassword = await bcrypt.hash(req.body.password, 12);
      const user = new User({
        username: req.body.username,
        password: hashedPassword,
        email: req.body.email,
        contacts: [],
        profilePicture: '',
      });
      try {
        await user.save();
        const token = jwt.sign({ user }, process.env.SECRET_KEY, {
          expiresIn: '1d',
        });
        res
          .status(200)
          .json({ message: 'User created successfully', user, token });
      } catch (err) {
        next(err);
      }
    }
  }),
];

exports.login = asyncHandler(async (req, res, next) => {
  try {
    passport.authenticate('local', { session: false }, (err, user, info) => {
      if (err || !user) {
        res.status(403).json({
          info,
        });
      }
      req.login(user, { session: false }, (err) => {
        if (err) {
          next(err);
        }
        const userData = {
          _id: user._id,
          username: user.username,
        };
        const token = jwt.sign({ user: userData }, process.env.SECRET_KEY, {
          expiresIn: '1d',
        });

        res.status(200).json({ userData, token });
      });
    })(req, res, next);
  } catch (err) {
    res.status(403).json({
      err,
    });
  }
});

exports.getAllUsers = asyncHandler(async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({ users });
  } catch (err) {
    res.status(400).json({ err });
  }
});

exports.verifyToken = asyncHandler(async (req, res, next) => {
  const { token } = req.body;
  console.log(token);
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;

    res.status(200).json({ message: 'Token is valid' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Token expired' });
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  }
});
