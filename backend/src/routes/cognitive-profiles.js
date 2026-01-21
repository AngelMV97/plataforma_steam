const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const { supabase } = require('../config/supabase');

/**
 * GET /api/cognitive-profiles/:studentId
 * Get cognitive profile for a student
 */
router.get('/:studentId', authenticateUser, async (req, res) => {
  try {
    // Verify access
    if (req.user.id !== req.params.studentId && 
        req.profile.role !== 'mentor' && 
        req.profile.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data: profile, error } = await supabase
      .from('cognitive_profiles')
      .select('*')
      .eq('student_id', req.params.studentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Profile doesn't exist, return default
        return res.json({
          success: true,
          data: {
            student_id: req.params.studentId,
            profile_data: {
              representacion: { level: 0, observations: [] },
              abstraccion: { level: 0, observations: [] },
              estrategia: { level: 0, observations: [] },
              argumentacion: { level: 0, observations: [] },
              metacognicion: { level: 0, observations: [] },
              transferencia: { level: 0, observations: [] }
            },
            strengths: [],
            growth_areas: []
          }
        });
      }
      throw error;
    }

    res.json({ success: true, data: profile });
  } catch (error) {
    console.error('Get cognitive profile error:', error);
    res.status(500).json({ error: 'Failed to fetch cognitive profile' });
  }
});

/**
 * GET /api/cognitive-profiles/:studentId/history
 * Get historical evolution of cognitive profile
 */
router.get('/:studentId/history', authenticateUser, async (req, res) => {
  try {
    // Verify access
    if (req.user.id !== req.params.studentId && 
        req.profile.role !== 'mentor' && 
        req.profile.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get all evaluations for this student ordered by date
    const { data: evaluations, error } = await supabase
      .from('rubric_evaluations')
      .select(`
        *,
        attempt:attempt_id (
          started_at,
          completed_at,
          article:article_id (
            title,
            week_number
          )
        )
      `)
      .eq('attempt_id.student_id', req.params.studentId)
      .order('evaluated_at', { ascending: true });

    if (error) throw error;

    // Group by week and dimension
    const history = {};
    const levelMap = { inicial: 1, en_desarrollo: 2, competente: 3, avanzado: 4 };

    (evaluations || []).forEach(evaluation => {
      if (!evaluation.attempt?.article) return;
      
      const week = evaluation.attempt.article.week_number;
      if (!history[week]) {
        history[week] = {
          week_number: week,
          article_title: evaluation.attempt.article.title,
          evaluated_at: evaluation.evaluated_at,
          dimensions: {}
        };
      }
      
      history[week].dimensions[evaluation.dimension] = {
        level: levelMap[evaluation.level],
        level_name: evaluation.level,
        feedback: evaluation.feedback
      };
    });

    const historyArray = Object.values(history).sort((a, b) => a.week_number - b.week_number);

    res.json({ success: true, data: historyArray });
  } catch (error) {
    console.error('Get profile history error:', error);
    res.status(500).json({ error: 'Failed to fetch profile history' });
  }
});

/**
 * GET /api/cognitive-profiles/compare
 * Compare all students' profiles (mentor only)
 */
router.get('/', authenticateUser, async (req, res) => {
  try {
    // Verify mentor access
    if (req.profile.role !== 'mentor' && req.profile.role !== 'admin') {
      return res.status(403).json({ error: 'Only mentors can access this' });
    }

    const { data: profiles, error } = await supabase
      .from('cognitive_profiles')
      .select(`
        *,
        student:student_id (
          id,
          full_name,
          email,
          grade_level
        )
      `)
      .order('last_updated', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data: profiles || [] });
  } catch (error) {
    console.error('List cognitive profiles error:', error);
    res.status(500).json({ error: 'Failed to list profiles' });
  }
});

module.exports = router;