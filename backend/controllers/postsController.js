const Post = require('../models/Post');
const cloudinary = require('../utils/cloudinary');

exports.createPost = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    let { text = '', imageBase64 = '', category = 'All' } = req.body;

    // Basic validations
    text = String(text || '').trim();
    category = String(category || 'All');
    const allowedCategories = ['All','Level','Department','Exam','Timetable','Event'];
    if (!allowedCategories.includes(category)) category = 'All';

    if (!text && !imageBase64) return res.status(400).json({ message: 'Provide text or image' });
    if (text.length > 2000) return res.status(400).json({ message: 'Text too long (max 2000 chars)' });

    let imageUrl = '';
    if (imageBase64) {
      // Expect data URL format: data:image/<type>;base64,<data>
      const match = /^data:(image\/(png|jpeg|jpg|webp));base64,(.+)$/i.exec(imageBase64);
      if (!match) return res.status(400).json({ message: 'Invalid image format. Use png/jpeg/webp base64 data URL.' });
      const b64 = match[3];
      const approxBytes = Math.floor((b64.length * 3) / 4); // approximate
      const maxBytes = 10 * 1024 * 1024; // 10MB
      if (approxBytes > maxBytes) return res.status(400).json({ message: 'Image too large (max 10MB)' });
      // Upload to Cloudinary
      const uploadRes = await cloudinary.uploader.upload(imageBase64, { folder: 'adustech/posts', resource_type: 'image' });
      imageUrl = uploadRes.secure_url;
      imageBase64 = ''; // clear legacy field
    }

    const post = new Post({
      userId: user.id,
      userName: user.name || user.email,
      text,
      imageBase64,
      imageUrl,
      category,
    });
    await post.save();
    return res.status(201).json({ message: 'Post created', post });
  } catch (e) {
    console.error('createPost error', e);
    res.status(500).json({ message: 'Error creating post' });
  }
};

exports.listPosts = async (req, res) => {
  try {
    const { q = '', category = 'All', page = 1, limit = 10 } = req.query;
    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (q) filter.$or = [
      { text: { $regex: q, $options: 'i' } },
      { userName: { $regex: q, $options: 'i' } },
    ];
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const posts = await Post.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    const total = await Post.countDocuments(filter);
    res.json({ posts, total, page: parseInt(page) });
  } catch (e) {
    console.error('listPosts error', e);
    res.status(500).json({ message: 'Error listing posts' });
  }
};

exports.toggleLikePost = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const idx = post.likes.findIndex(u => u.toString() === user.id);
    if (idx >= 0) post.likes.splice(idx, 1); else post.likes.push(user.id);
    await post.save();
    res.json({ likes: post.likes.length, liked: idx < 0 });
  } catch (e) {
    console.error('toggleLikePost error', e);
    res.status(500).json({ message: 'Error toggling like' });
  }
};

exports.toggleRepostPost = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (!post.reposts) post.reposts = [];
    const idx = post.reposts.findIndex(u => u.toString() === user.id);
    if (idx >= 0) post.reposts.splice(idx, 1); else post.reposts.push(user.id);
    await post.save();
    res.json({ reposts: post.reposts.length, reposted: idx < 0 });
  } catch (e) {
    console.error('toggleRepostPost error', e);
    res.status(500).json({ message: 'Error toggling repost' });
  }
};

exports.addComment = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    const { id } = req.params;
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Text required' });
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    post.comments.push({ userId: user.id, userName: user.name || user.email, text });
    await post.save();
    const last = post.comments[post.comments.length - 1];
    res.status(201).json({ comment: last });
  } catch (e) {
    console.error('addComment error', e);
    res.status(500).json({ message: 'Error adding comment' });
  }
};

exports.getPost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ post });
  } catch (e) {
    console.error('getPost error', e);
    res.status(500).json({ message: 'Error fetching post' });
  }
};

exports.listComments = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id).select('comments');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ comments: post.comments });
  } catch (e) {
    console.error('listComments error', e);
    res.status(500).json({ message: 'Error fetching comments' });
  }
};

exports.toggleLikeComment = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    const { id, commentId } = req.params;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    const idx = comment.likes.findIndex(u => u.toString() === user.id);
    if (idx >= 0) comment.likes.splice(idx, 1); else comment.likes.push(user.id);
    await post.save();
    res.json({ likes: comment.likes.length, liked: idx < 0 });
  } catch (e) {
    console.error('toggleLikeComment error', e);
    res.status(500).json({ message: 'Error toggling like on comment' });
  }
};
