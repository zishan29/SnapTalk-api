const cloudinary = require('cloudinary').v2;
const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const Message = require('../models/message');

exports.getMessages = asyncHandler(async (req, res, next) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.receiverId },
        { sender: req.params.receiverId, receiver: req.user._id },
      ],
    }).sort({ createdAt: 1 });
    res.status(200).json({ messages });
  } catch (err) {
    res.status(400).json({ err });
  }
});

exports.createMessage = asyncHandler(async (req, res, next) => {
  let imageUrl;

  if (req.file) {
    try {
      const uniqueIdentifier = uuidv4();

      const imageBuffer = req.file.buffer.toString('base64');

      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${imageBuffer}`,
        { public_id: uniqueIdentifier, folder: 'SnapTalk/images/' },
      );

      imageUrl = result.secure_url;
    } catch (error) {
      console.error('Error uploading image to cloud:', error);
      return res.status(500).json({ error: 'Error uploading image to cloud' });
    }
  }

  const newMessage = new Message({
    content: {
      type: req.body.content.type,
      data: imageUrl || req.body.content.data,
    },
    sender: req.user._id,
    receiver: req.body.receiverId,
  });

  try {
    await newMessage.save();
    res.status(200).json({ message: 'New message created successfully' });
  } catch (err) {
    res.status(400).json({ err });
  }
});
