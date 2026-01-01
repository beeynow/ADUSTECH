const express = require('express');
const auth = require('../middleware/authmiddleware');
const { createPost, listPosts, toggleLikePost, toggleRepostPost, addComment, listComments, toggleLikeComment, health, getPost } = require('../controllers/postsController');

const router = express.Router();

router.get('/posts', listPosts);
router.post('/posts', auth, createPost);
router.post('/posts/:id/like', auth, toggleLikePost);
router.post('/posts/:id/repost', auth, toggleRepostPost);
router.get('/posts/:id/comments', listComments);
router.post('/posts/:id/comments', auth, addComment);
router.post('/posts/:id/comments/:commentId/like', auth, toggleLikeComment);
router.get('/posts/:id', getPost);
router.get('/health', health);

module.exports = router;
