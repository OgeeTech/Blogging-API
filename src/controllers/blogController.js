const Blog = require('../models/Blog');
const User = require('../models/User');
const estimateReadingTime = require('../utils/readingTime');
const paginate = require('../utils/paginate');
const mongoose = require('mongoose');

function parseSort(sortQuery) {
    if (!sortQuery) return { createdAt: -1 };
    const mapping = {
        read_count: 'read_count',
        reading_time: 'reading_time',
        timestamp: 'createdAt'
    };
    // allow prefix '-' for desc
    const parts = sortQuery.split(',');
    const sort = {};
    parts.forEach(p => {
        p = p.trim();
        let dir = 1;
        if (p.startsWith('-')) { dir = -1; p = p.slice(1); }
        const field = mapping[p] || mapping[p];
        if (field) sort[field] = dir;
    });
    if (Object.keys(sort).length === 0) sort.createdAt = -1;
    return sort;
}


exports.listPublished = async (req, res, next) => {
    try {
        const { page, limit, skip } = paginate(req);
        const q = req.query.q;
        const tags = req.query.tags;
        const authorName = req.query.author;
        const sort = parseSort(req.query.sort);

        const filter = { state: 'published' };

        if (q) {
            // text search on title/description/body
            filter.$text = { $search: q };
        }
        if (tags) {
            // tags can be comma-separated
            const tagArr = tags.split(',').map(t => t.trim());
            filter.tags = { $in: tagArr };
        }
        if (authorName) {
            // find user(s) with that name
            const authorRegex = new RegExp(authorName, 'i');
            const authors = await User.find({
                $or: [
                    { first_name: authorRegex },
                    { last_name: authorRegex }
                ]
            }, '_id');
            const authorIds = authors.map(a => a._id);
            filter.author = { $in: authorIds };
        }

        const total = await Blog.countDocuments(filter);
        const blogs = await Blog.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate('author', 'first_name last_name email');

        res.json({
            page,
            limit,
            total,
            data: blogs
        });
    } catch (err) {
        next(err);
    }
};

exports.getPublished = async (req, res, next) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid ID' });

        const blog = await Blog.findById(id).populate('author', 'first_name last_name email');
        if (!blog) return res.status(404).json({ error: 'Blog not found' });

        // if not owner, only allow published
        const isOwner = req.user && blog.author && String(blog.author._id) === String(req.user._id);
        if (!isOwner && blog.state !== 'published') {
            return res.status(403).json({ error: 'Not allowed to view this blog' });
        }

        // increment read_count only when blog is published (owner reading their draft shouldn't increment)
        if (blog.state === 'published') {
            blog.read_count = (blog.read_count || 0) + 1;
            await blog.save();
        }

        res.json(blog);
    } catch (err) {
        next(err);
    }
};

exports.createBlog = async (req, res, next) => {
    try {
        const { title, description, body, tags } = req.body;
        if (!title || !body) return res.status(400).json({ error: 'Title and body required' });

        const reading_time = estimateReadingTime(body);
        const blog = new Blog({
            title,
            description,
            body,
            tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
            author: req.user._id,
            reading_time,
            // default state => draft
        });
        await blog.save();
        res.status(201).json(blog);
    } catch (err) {
        next(err);
    }
};

exports.updateBlog = async (req, res, next) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid ID' });
        const blog = await Blog.findById(id);
        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        if (String(blog.author) !== String(req.user._id)) return res.status(403).json({ error: 'Not owner' });

        const allowed = ['title', 'description', 'body', 'tags', 'state'];
        allowed.forEach(k => {
            if (req.body[k] !== undefined) {
                blog[k] = req.body[k];
            }
        });
        // recompute reading time if body updated
        if (req.body.body) blog.reading_time = estimateReadingTime(req.body.body);
        // ensure state remains valid
        if (blog.state !== 'draft' && blog.state !== 'published') blog.state = 'draft';
        await blog.save();
        res.json(blog);
    } catch (err) {
        next(err);
    }
};

exports.deleteBlog = async (req, res, next) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid ID' });
        const blog = await Blog.findById(id);
        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        if (String(blog.author) !== String(req.user._id)) return res.status(403).json({ error: 'Not owner' });
        await blog.deleteOne();
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
};

exports.publishBlog = async (req, res, next) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid ID' });
        const blog = await Blog.findById(id);
        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        if (String(blog.author) !== String(req.user._id)) return res.status(403).json({ error: 'Not owner' });
        blog.state = 'published';
        await blog.save();
        res.json(blog);
    } catch (err) {
        next(err);
    }
};

// list a user's blogs (owner) with pagination and state filter
exports.listUserBlogs = async (req, res, next) => {
    try {
        const { page, limit, skip } = paginate(req);
        const state = req.query.state;
        const filter = { author: req.user._id };
        if (state) filter.state = state; // allow draft or published
        const total = await Blog.countDocuments(filter);
        const data = await Blog.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 });
        res.json({ page, limit, total, data });
    } catch (err) {
        next(err);
    }
};
