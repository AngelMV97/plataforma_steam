const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const problemService = require('../services/problemService');
const tutorService = require('../services/tutorService');

/**
 * POST /api/attempts
 * Create new attempt for a problem
 */
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { problem_id } = req.body;
    const attempt = await problemService.createAttempt(req.user.id, problem_id);
    res.json({ success: true, data: attempt });
  } catch (error) {
    console.error('Create attempt error:', error);
    res.status(500).json({ error: 'Failed to create attempt' });
  }
});

/**
 * GET /api/attempts
 * Get student's attempts
 */
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { status } = req.query;
    const attempts = await problemService.getStudentAttempts(req.user.id, { status });
    res.json({ success: true, data: attempts });
  } catch (error) {
    console.error('Get attempts error:', error);
    res.status(500).json({ error: 'Failed to fetch attempts' });
  }
});

/**
 * PUT /api/attempts/:id/bitacora
 * Update bitácora content
 */
router.put('/:id/bitacora', authenticateUser, async (req, res) => {
  try {
    const { bitacora_content } = req.body;
    const attempt = await problemService.updateBitacora(
      req.params.id,
      req.user.id,
      bitacora_content
    );
    res.json({ success: true, data: attempt });
  } catch (error) {
    console.error('Update bitacora error:', error);
    res.status(500).json({ error: 'Failed to update bitácora' });
  }
});

/**
 * POST /api/attempts/:id/request-help
 * Request AI tutor intervention
 */
router.post('/:id/request-help', authenticateUser, async (req, res) => {
  try {
    const { bitacora_content } = req.body;
    
    // Get interaction history
    const interactionHistory = await tutorService.getInteractionHistory(req.params.id);
    
    // Generate intervention
    const result = await tutorService.generateIntervention(
      req.params.id,
      bitacora_content,
      interactionHistory
    );
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Tutor intervention error:', error);
    res.status(500).json({ error: 'Failed to generate tutor response' });
  }
});

/**
 * GET /api/attempts/:id/interactions
 * Get tutor interactions for an attempt
 */
router.get('/:id/interactions', authenticateUser, async (req, res) => {
  try {
    const interactions = await tutorService.getInteractionHistory(req.params.id);
    res.json({ success: true, data: interactions });
  } catch (error) {
    console.error('Get interactions error:', error);
    res.status(500).json({ error: 'Failed to fetch interactions' });
  }
});

module.exports = router;