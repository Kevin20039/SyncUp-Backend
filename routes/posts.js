// routes/posts.js

const router = require('express').Router();
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');

// CREATE A POST
router.post('/', async (req, res) => {
    const newPost = new Post(req.body);
    try {
        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (err) {
        res.status(500).json(err);
    }
});

// LIKE / DISLIKE A POST
router.put('/:id/like', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post.likes.includes(req.body.userId)) {
            await post.updateOne({ $push: { likes: req.body.userId } });
            res.status(200).json("The post has been liked");
        } else {
            await post.updateOne({ $pull: { likes: req.body.userId } });
            res.status(200).json("The post has been disliked");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

// GET TIMELINE POSTS (SHOW ALL POSTS)
router.get('/timeline/:userId', async (req, res) => {
    try {
        // Get all posts from all users
        const allPosts = await Post.find();
        res.status(200).json(allPosts.sort((p1, p2) => {
            return new Date(p2.createdAt) - new Date(p1.createdAt);
        }));
    } catch (err) {
        res.status(500).json(err);
    }
});

// GET USER'S ALL POSTS
router.get("/profile/:username", async (req, res) => {
    try {
      const user = await User.findOne({ username: req.params.username });
      const posts = await Post.find({ userId: user._id });
      res.status(200).json(posts);
    } catch (err) {
      res.status(500).json(err);
    }
});

// GET ALL POSTS (PUBLIC FEED)
router.get("/all", async (req, res) => {
    try {
        const allPosts = await Post.find();
        res.status(200).json(allPosts.sort((p1, p2) => {
            return new Date(p2.createdAt) - new Date(p1.createdAt);
        }));
    } catch (err) {
        res.status(500).json(err);
    }
});
// CREATE A COMMENT
router.post('/:id/comments', async (req, res) => {
    try {
        const newComment = new Comment({
            postId: req.params.id,
            userId: req.body.userId,
            text: req.body.text,
        });
        const savedComment = await newComment.save();
        res.status(201).json(savedComment);
    } catch (err) {
        res.status(500).json(err);
    }
});

// GET ALL COMMENTS FOR A POST
router.get('/:id/comments', async (req, res) => {
    try {
        const comments = await Comment.find({ postId: req.params.id });
        res.status(200).json(comments);
    } catch (err) {
        res.status(500).json(err);
    }
});



module.exports = router;