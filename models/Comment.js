const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    postId: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model("Comment", CommentSchema);