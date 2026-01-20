const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const problemService = require('../services/problemService');

/**
 * GET /api/articles
 * Get all articles
 */
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { difficulty_level } = req.query;
    const articles = await problemService.getArticles({ difficulty_level });
    res.json({ success: true, data: articles });
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

/**
 * GET /api/articles/:id
 * Get single article with problems
 */
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const article = await problemService.getArticleWithProblems(req.params.id);
    res.json({ success: true, data: article });
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

module.exports = router;