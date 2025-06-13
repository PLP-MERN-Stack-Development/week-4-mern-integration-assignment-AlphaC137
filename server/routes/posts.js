// posts.js - Routes for blog posts

const express = require('express');
const router = express.Router();
const Joi = require('joi');
const Post = require('../models/Post');
const Category = require('../models/Category');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// Validation schemas
const postSchema = Joi.object({
  title: Joi.string().required().min(3).max(100),
  content: Joi.string().required().min(10),
  excerpt: Joi.string().max(200),
  category: Joi.string().required(),
  tags: Joi.array().items(Joi.string()),
  isPublished: Joi.boolean().default(false),
});

const commentSchema = Joi.object({
  content: Joi.string().required().min(1).max(500),
});

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const search = req.query.search;

    // Build query
    let query = { isPublished: true };
    
    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const posts = await Post.find(query)
      .populate('author', 'name avatar')
      .populate('category', 'name color')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / limit);

    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const post = await Post.findOne({
      $or: [{ _id: req.params.id }, { slug: req.params.id }]
    })
      .populate('author', 'name avatar bio')
      .populate('category', 'name color')
      .populate('comments.user', 'name avatar');

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found',
      });
    }

    // Increment view count
    await post.incrementViewCount();

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    // Validate input
    const { error } = postSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    // Check if category exists
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Category not found',
      });
    }

    const post = await Post.create({
      ...req.body,
      author: req.user.id,
    });

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name avatar')
      .populate('category', 'name color');

    res.status(201).json({
      success: true,
      data: populatedPost,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
router.put('/:id', protect, async (req, res, next) => {
  try {
    // Validate input
    const { error } = postSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found',
      });
    }

    // Check if user owns post or is admin
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this post',
      });
    }

    // Check if category exists
    if (req.body.category) {
      const category = await Category.findById(req.body.category);
      if (!category) {
        return res.status(400).json({
          success: false,
          error: 'Category not found',
        });
      }
    }

    post = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate('author', 'name avatar')
      .populate('category', 'name color');

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found',
      });
    }

    // Check if user owns post or is admin
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this post',
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Add comment to post
// @route   POST /api/posts/:id/comments
// @access  Private
router.post('/:id/comments', protect, async (req, res, next) => {
  try {
    // Validate input
    const { error } = commentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found',
      });
    }

    await post.addComment(req.user.id, req.body.content);

    const updatedPost = await Post.findById(req.params.id)
      .populate('comments.user', 'name avatar');

    res.status(201).json({
      success: true,
      data: updatedPost.comments,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Search posts
// @route   GET /api/posts/search
// @access  Public
router.get('/search', async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required',
      });
    }

    const posts = await Post.find({
      $and: [
        { isPublished: true },
        {
          $or: [
            { title: { $regex: q, $options: 'i' } },
            { content: { $regex: q, $options: 'i' } },
            { tags: { $in: [new RegExp(q, 'i')] } }
          ]
        }
      ]
    })
      .populate('author', 'name avatar')
      .populate('category', 'name color')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
