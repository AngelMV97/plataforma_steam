const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const { supabase } = require('../config/supabase');

/**
 * POST /api/sessions
 * Create a new session (mentor only)
 */
router.post('/', authenticateUser, async (req, res) => {
  try {
    // Verify mentor access
    if (req.profile.role !== 'mentor' && req.profile.role !== 'admin') {
      return res.status(403).json({ error: 'Only mentors can create sessions' });
    }

    const {
      article_id,
      session_date,
      duration_minutes,
      session_type,
      meeting_link,
      notes
    } = req.body;

    if (!session_date) {
      return res.status(400).json({ error: 'session_date is required' });
    }

    const { data: session, error } = await supabase
      .from('sessions')
      .insert({
        article_id,
        session_date: new Date(session_date).toISOString(),
        duration_minutes: duration_minutes || 90,
        session_type: session_type || 'guided',
        facilitator_id: req.user.id,
        meeting_link,
        notes,
        status: 'scheduled'
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data: session });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

/**
 * GET /api/sessions
 * List all sessions (with optional filters)
 */
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { status, upcoming } = req.query;

    let query = supabase
      .from('sessions')
      .select(`
        *,
        article:article_id (
          id,
          title,
          week_number
        ),
        facilitator:facilitator_id (
          full_name,
          email
        )
      `)
      .order('session_date', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    if (upcoming === 'true') {
      query = query.gte('session_date', new Date().toISOString());
    }

    const { data: sessions, error } = await query;

    if (error) throw error;

    res.json({ success: true, data: sessions || [] });
  } catch (error) {
    console.error('List sessions error:', error);
    res.status(500).json({ error: 'Failed to list sessions' });
  }
});

/**
 * GET /api/sessions/:id
 * Get specific session with participants
 */
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { data: session, error } = await supabase
      .from('sessions')
      .select(`
        *,
        article:article_id (
          id,
          title,
          week_number
        ),
        facilitator:facilitator_id (
          full_name,
          email
        )
      `)
      .eq('id', req.params.id)
      .single();

    if (error) throw error;

    // Get participants
    const { data: participants, error: participantsError } = await supabase
      .from('session_participants')
      .select(`
        *,
        student:student_id (
          id,
          full_name,
          email,
          grade_level
        )
      `)
      .eq('session_id', req.params.id)
      .order('attendance_status');

    if (participantsError) throw participantsError;

    res.json({ 
      success: true, 
      data: {
        ...session,
        participants: participants || []
      }
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

/**
 * PUT /api/sessions/:id
 * Update session (mentor only)
 */
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    // Verify mentor access
    if (req.profile.role !== 'mentor' && req.profile.role !== 'admin') {
      return res.status(403).json({ error: 'Only mentors can update sessions' });
    }

    const {
      session_date,
      duration_minutes,
      session_type,
      meeting_link,
      notes,
      status
    } = req.body;

    const updates = {};
    if (session_date) updates.session_date = new Date(session_date).toISOString();
    if (duration_minutes) updates.duration_minutes = duration_minutes;
    if (session_type) updates.session_type = session_type;
    if (meeting_link !== undefined) updates.meeting_link = meeting_link;
    if (notes !== undefined) updates.notes = notes;
    if (status) updates.status = status;

    const { data: session, error } = await supabase
      .from('sessions')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data: session });
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({ error: 'Failed to update session' });
  }
});

/**
 * DELETE /api/sessions/:id
 * Delete/cancel session (mentor only)
 */
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    // Verify mentor access
    if (req.profile.role !== 'mentor' && req.profile.role !== 'admin') {
      return res.status(403).json({ error: 'Only mentors can delete sessions' });
    }

    const { error } = await supabase
      .from('sessions')
      .update({ status: 'cancelled' })
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

/**
 * POST /api/sessions/:id/register
 * Register student for a session
 */
router.post('/:id/register', authenticateUser, async (req, res) => {
  try {
    // Check if already registered
    const { data: existing } = await supabase
      .from('session_participants')
      .select('*')
      .eq('session_id', req.params.id)
      .eq('student_id', req.user.id)
      .single();

    if (existing) {
      return res.json({ success: true, data: existing, message: 'Already registered' });
    }

    // Register
    const { data: participant, error } = await supabase
      .from('session_participants')
      .insert({
        session_id: req.params.id,
        student_id: req.user.id,
        attendance_status: 'registered'
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data: participant });
  } catch (error) {
    console.error('Register for session error:', error);
    res.status(500).json({ error: 'Failed to register for session' });
  }
});

/**
 * DELETE /api/sessions/:id/register
 * Unregister from a session
 */
router.delete('/:id/register', authenticateUser, async (req, res) => {
  try {
    const { error } = await supabase
      .from('session_participants')
      .delete()
      .eq('session_id', req.params.id)
      .eq('student_id', req.user.id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Unregister from session error:', error);
    res.status(500).json({ error: 'Failed to unregister from session' });
  }
});

/**
 * PUT /api/sessions/:id/attendance
 * Update attendance for participants (mentor only)
 */
router.put('/:id/attendance', authenticateUser, async (req, res) => {
  try {
    // Verify mentor access
    if (req.profile.role !== 'mentor' && req.profile.role !== 'admin') {
      return res.status(403).json({ error: 'Only mentors can update attendance' });
    }

    const { attendance } = req.body;
    // attendance format: [{ student_id, status, notes }]

    if (!Array.isArray(attendance)) {
      return res.status(400).json({ error: 'attendance must be an array' });
    }

    // Update each participant
    const updates = await Promise.all(
      attendance.map(async (record) => {
        const { data, error } = await supabase
          .from('session_participants')
          .update({
            attendance_status: record.status,
            participation_notes: record.notes
          })
          .eq('session_id', req.params.id)
          .eq('student_id', record.student_id)
          .select()
          .single();

        if (error) throw error;
        return data;
      })
    );

    res.json({ success: true, data: updates });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({ error: 'Failed to update attendance' });
  }
});

module.exports = router;