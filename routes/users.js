const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// SEARCH USERS
router.get("/search", async (req, res) => {
  const searchQuery = req.query.username;
  try {
    if (!searchQuery) {
      return res.status(200).json([]); // Return empty array if no query
    }
    
    // This now finds users if the search query appears ANYWHERE in the username
    const users = await User.find({
      username: { $regex: searchQuery, $options: 'i' }
    }).limit(10).select('-password');
    
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET A USER
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

// UPDATE USER PROFILE
// routes/users.js

// UPDATE USER PROFILE
router.put("/:id", async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        if (req.body.password) {
            try {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            } catch (err) {
                return res.status(500).json(err);
            }
        }
        try {
            // Update the user
            await User.findByIdAndUpdate(req.params.id, {
                $set: req.body,
            });
            // Fetch the updated user document to send back to the frontend
            const updatedUser = await User.findById(req.params.id);
            const { password, updatedAt, ...other } = updatedUser._doc;
            res.status(200).json(other); // --- FIX: Send back the updated user object ---
        } catch (err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(403).json("You can update only your account!");
    }
});

// FOLLOW A USER
router.put("/:id/follow", async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const userToFollow = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if (!userToFollow.followers.includes(req.body.userId)) {
                await userToFollow.updateOne({ $push: { followers: req.body.userId } });
                await currentUser.updateOne({ $push: { following: req.params.id } });
                res.status(200).json("User has been followed");
            } else {
                res.status(403).json("You already follow this user");
            }
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("You can't follow yourself");
    }
});

// UNFOLLOW A USER
router.put("/:id/unfollow", async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const userToUnfollow = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if (userToUnfollow.followers.includes(req.body.userId)) {
                await userToUnfollow.updateOne({ $pull: { followers: req.body.userId } });
                await currentUser.updateOne({ $pull: { following: req.params.id } });
                res.status(200).json("User has been unfollowed");
            } else {
                res.status(403).json("You don't follow this user");
            }
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("You can't unfollow yourself");
    }
});
router.get("/:id/followers", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const followers = await Promise.all(
            user.followers.map((followerId) => {
                return User.findById(followerId).select('-password');
            })
        );
        res.status(200).json(followers);
    } catch (err) {
        res.status(500).json(err);
    }
});
router.get("/:id/following", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const following = await Promise.all(
            user.following.map((followingId) => {
                return User.findById(followingId).select('-password');
            })
        );
        res.status(200).json(following);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;