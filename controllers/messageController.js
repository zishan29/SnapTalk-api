const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const Message = require('../models/message');

exports.getMessages = asyncHandler(async (req, res, next) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.body.senderId, receiver: req.body.receiverId }],
    });
    res.status(200).json({ messages });
  } catch (err) {
    res.status(400).json({ err });
  }
});

exports.createMessage = asyncHandler(async (req, res, next) => {
  const newMessage = new Message({
    content: req.body.content,
    sender: req.body.senderId,
    receiver: req.body.receiverId,
  });
  try {
    await newMessage.save();
    res.status(200).json({ message: 'New message created successfully' });
  } catch (err) {
    res.status(400).json({ err });
  }
});
