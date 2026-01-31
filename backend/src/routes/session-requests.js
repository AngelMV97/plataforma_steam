const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const { supabase } = require('../config/supabase');

/**
 * POST /api/session-requests
 * Create a new session request (student only)
 */
router.post('/', authenticateUser, async (req, res) => {
  try {
    if (req.profile.role !== 'student') {
      return res.status(403).json({ error: 'Only students can request sessions' });
    }
    const { topic, preferred_dates, notes } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }
    const { data, error } = await supabase
      .from('session_requests')
      .insert({
        student_id: req.user.id,
        topic,
        preferred_dates,
        notes,
        status: 'pending',
      })
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Create session request error:', error);
    res.status(500).json({ error: 'Failed to create session request' });
  }
});

/**
 * GET /api/session-requests
 * List all session requests (mentor/admin only)
 */
router.get('/', authenticateUser, async (req, res) => {
  try {
    if (req.profile.role !== 'mentor' && req.profile.role !== 'admin') {
      return res.status(403).json({ error: 'Only mentors can view session requests' });
    }
    const { data, error } = await supabase
      .from('session_requests')
      .select('*, student:student_id(full_name, email)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('List session requests error:', error);
    res.status(500).json({ error: 'Failed to list session requests' });
  }
});

/**
 * GET /api/session-requests/mine
 * List session requests for the current student
 */
router.get('/mine', authenticateUser, async (req, res) => {
  try {
    if (req.profile.role !== 'student') {
      return res.status(403).json({ error: 'Only students can view their requests' });
    }
    const { data, error } = await supabase
      .from('session_requests')
      .select('*')
      .eq('student_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('List my session requests error:', error);
    res.status(500).json({ error: 'Failed to list your session requests' });
  }
});

/**
 * PUT /api/session-requests/:id/status
 * Update status (mentor/admin only)
 */
router.put('/:id/status', authenticateUser, async (req, res) => {
  try {
    if (req.profile.role !== 'mentor' && req.profile.role !== 'admin') {
      return res.status(403).json({ error: 'Only mentors can update status' });
    }
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    const { data, error } = await supabase
      .from('session_requests')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Update session request status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

module.exports = router;
