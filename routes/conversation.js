const router = require("express").Router();
const Conversation = require("../models/Conversation");

// New Conversation
router.post("/", async (req, res) => {
  // Check if a conversation between these two users already exists
  const existingConversation = await Conversation.findOne({
    members: { $all: [req.body.senderId, req.body.receiverId] },
  });

  if (existingConversation) {
    return res.status(200).json(existingConversation);
  }

  // If not, create a new one
  const newConversation = new Conversation({
    members: [req.body.senderId, req.body.receiverId],
  });

  try {
    const savedConversation = await newConversation.save();
    res.status(201).json(savedConversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get Conversations of a User
router.get("/:userId", async (req, res) => {
  try {
    const conversation = await Conversation.find({
      members: { $in: [req.params.userId] },
    });
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;