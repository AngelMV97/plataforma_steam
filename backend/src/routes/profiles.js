// backend/src/routes/profiles.js (NEW FILE)
const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const { supabase } = require('../config/supabase');

/**
 * GET /api/profiles/:id
 * Get user profile
 */
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;

    // Check access
    if (profile.id !== req.user.id && 
        req.profile.role !== 'mentor' && 
        req.profile.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ success: true, data: profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * GET /api/profiles
 * List all students (mentor access)
 */
router.get('/', authenticateUser, async (req, res) => {
  try {
    // Verify mentor access
    if (req.profile.role !== 'mentor' && req.profile.role !== 'admin') {
      return res.status(403).json({ error: 'Only mentors can access this' });
    }

    const { data: students, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .order('full_name');

    if (error) throw error;

    res.json({ success: true, data: students || [] });
  } catch (error) {
    console.error('List profiles error:', error);
    res.status(500).json({ error: 'Failed to list profiles' });
  }
});

module.exports = router;