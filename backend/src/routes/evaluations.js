// backend/src/routes/evaluations.js
const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const { supabase } = require('../config/supabase');
const RUBRICS = require('../config/rubrics');

/**
 * POST /api/evaluations
 * Create a new rubric evaluation
 */
router.post('/', authenticateUser, async (req, res) => {
  try {
    // Verify user is a mentor
    if (req.profile.role !== 'mentor' && req.profile.role !== 'admin') {
      return res.status(403).json({ error: 'Only mentors can create evaluations' });
    }

    const {
      attempt_id,
      dimension,
      level,
      feedback,
      evidence_quotes
    } = req.body;

    if (!attempt_id || !dimension || !level) {
      return res.status(400).json({ 
        error: 'attempt_id, dimension, and level are required' 
      });
    }

    // Validate dimension and level
    const validDimensions = ['representacion', 'abstraccion', 'estrategia', 
                            'argumentacion', 'metacognicion', 'transferencia'];
    const validLevels = ['inicial', 'en_desarrollo', 'competente', 'avanzado'];

    if (!validDimensions.includes(dimension)) {
      return res.status(400).json({ error: 'Invalid dimension' });
    }

    if (!validLevels.includes(level)) {
      return res.status(400).json({ error: 'Invalid level' });
    }

    // Check if evaluation already exists for this attempt + dimension
    const { data: existing } = await supabase
      .from('rubric_evaluations')
      .select('id')
      .eq('attempt_id', attempt_id)
      .eq('dimension', dimension)
      .eq('evaluator_id', req.user.id)
      .single();

    let result;
    
    if (existing) {
      // Update existing evaluation
      const { data, error } = await supabase
        .from('rubric_evaluations')
        .update({
          level,
          feedback,
          evidence_quotes: evidence_quotes || [],
          evaluated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new evaluation
      const { data, error } = await supabase
        .from('rubric_evaluations')
        .insert({
          attempt_id,
          evaluator_id: req.user.id,
          evaluator_type: 'mentor',
          dimension,
          level,
          feedback,
          evidence_quotes: evidence_quotes || []
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    // Update cognitive profile
    await updateCognitiveProfile(attempt_id, dimension, level);

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Create evaluation error:', error);
    res.status(500).json({ error: 'Failed to create evaluation' });
  }
});

/**
 * GET /api/evaluations/attempt/:attemptId
 * Get all evaluations for an attempt
 */
router.get('/attempt/:attemptId', authenticateUser, async (req, res) => {
  try {
    const { data: evaluations, error } = await supabase
      .from('rubric_evaluations')
      .select(`
        *,
        evaluator:evaluator_id (
          full_name,
          email
        )
      `)
      .eq('attempt_id', req.params.attemptId)
      .order('evaluated_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data: evaluations || [] });
  } catch (error) {
    console.error('Get evaluations error:', error);
    res.status(500).json({ error: 'Failed to fetch evaluations' });
  }
});

/**
 * GET /api/evaluations/student/:studentId
 * Get all evaluations for a student across all attempts
 */
router.get('/student/:studentId', authenticateUser, async (req, res) => {
  try {
    // Verify access
    if (req.user.id !== req.params.studentId && 
        req.profile.role !== 'mentor' && 
        req.profile.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data: evaluations, error } = await supabase
      .from('rubric_evaluations')
      .select(`
        *,
        attempt:attempt_id (
          id,
          article_id,
          started_at,
          completed_at,
          article:article_id (
            title,
            week_number
          )
        )
      `)
      .eq('attempt_id.student_id', req.params.studentId)
      .order('evaluated_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data: evaluations || [] });
  } catch (error) {
    console.error('Get student evaluations error:', error);
    res.status(500).json({ error: 'Failed to fetch student evaluations' });
  }
});

/**
 * Helper: Update cognitive profile with new evaluation
 */
async function updateCognitiveProfile(attemptId, dimension, level) {
  try {
    // Get student_id from attempt
    const { data: attempt } = await supabase
      .from('student_attempts')
      .select('student_id')
      .eq('id', attemptId)
      .single();

    if (!attempt) return;

    // Get student's cognitive profile
    const { data: profile } = await supabase
      .from('cognitive_profiles')
      .select('profile_data')
      .eq('student_id', attempt.student_id)
      .single();

    if (!profile) return;

    // Convert level to numeric value
    const levelMap = { inicial: 1, en_desarrollo: 2, competente: 3, avanzado: 4 };
    const numericLevel = levelMap[level];

    // Update profile_data
    const updatedData = { ...profile.profile_data };
    
    if (!updatedData[dimension]) {
      updatedData[dimension] = { level: 1, observations: [] };
    }

    // Calculate new level (average of all evaluations for this dimension)
    const { data: allEvals } = await supabase
      .from('rubric_evaluations')
      .select('level')
      .eq('attempt_id.student_id', attempt.student_id)
      .eq('dimension', dimension);

    if (allEvals && allEvals.length > 0) {
      const avgLevel = allEvals.reduce((sum, e) => sum + levelMap[e.level], 0) / allEvals.length;
      updatedData[dimension].level = Math.round(avgLevel);
    } else {
      updatedData[dimension].level = numericLevel;
    }

    // Add observation timestamp
    updatedData[dimension].observations = updatedData[dimension].observations || [];
    updatedData[dimension].observations.push({
      date: new Date().toISOString(),
      level: numericLevel
    });

    // Update database
    await supabase
      .from('cognitive_profiles')
      .update({ 
        profile_data: updatedData,
        last_updated: new Date().toISOString()
      })
      .eq('student_id', attempt.student_id);

  } catch (error) {
    console.error('Update cognitive profile error:', error);
    // Don't throw - this is a background update
  }
}

module.exports = router;