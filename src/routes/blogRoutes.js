const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { auth, requireAuth } = require('../middleware/auth');

// apply auth middleware to have req.user if token provided
router.use(auth);

// public list of published blogs
router.get('/', blogController.listPublished);

// get single blog (published or owner's draft)
router.get('/:id', blogController.getPublished);

// create blog (must be logged in)
router.post('/', requireAuth, blogController.createBlog);

// publish blog (owner only) -> must come before /:id
router.patch('/:id/publish', requireAuth, blogController.publishBlog);

// update blog (owner only)
router.patch('/:id', requireAuth, blogController.updateBlog);

// delete blog (owner only)
router.delete('/:id', requireAuth, blogController.deleteBlog);

// get list of authenticated user's blogs (paginated + filter by state)
router.get('/user/me/blogs', requireAuth, blogController.listUserBlogs);

module.exports = router;
