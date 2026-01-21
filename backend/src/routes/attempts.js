const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const { supabase } = require('../config/supabase');
const tutorService = require('../services/tutorService');
const pdfService = require('../services/pdfService');

/**
 * POST /api/attempts
 * Create new attempt for an article
 */
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { article_id } = req.body;
    
    if (!article_id) {
      return res.status(400).json({ error: 'article_id is required' });
    }

    // Check if attempt already exists
    const { data: existingAttempt } = await supabase
      .from('student_attempts')
      .select('*')
      .eq('student_id', req.user.id)
      .eq('article_id', article_id)
      .single();

    if (existingAttempt) {
      return res.json({ success: true, data: existingAttempt });
    }

    // Create new attempt
    const { data: attempt, error } = await supabase
      .from('student_attempts')
      .insert({
        student_id: req.user.id,
        article_id: article_id,
        status: 'in_progress',
        bitacora_content: {
          observaciones: '',
          preguntas: [],
          hipotesis: '',
          variables: [],
          experimentos: '',
          errores_aprendizajes: '',
          reflexiones: '',
          conclusiones: ''
        }
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data: attempt });
  } catch (error) {
    console.error('Create attempt error:', error);
    res.status(500).json({ error: 'Failed to create attempt' });
  }
});

/**
 * GET /api/attempts/:id
 * Get specific attempt with article data
 */
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { data: attempt, error } = await supabase
      .from('student_attempts')
      .select(`
        *,
        articles (
          id,
          title,
          subtitle,
          week_number,
          pdf_url,
          difficulty_level
        )
      `)
      .eq('id', req.params.id)
      .single();

    if (error) throw error;

    // Check if user owns this attempt or is a mentor
    if (attempt.student_id !== req.user.id && req.profile.role !== 'mentor') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ success: true, data: attempt });
  } catch (error) {
    console.error('Get attempt error:', error);
    res.status(500).json({ error: 'Failed to fetch attempt' });
  }
});

/**
 * GET /api/attempts
 * Get student's attempts (optionally filtered by article)
 */
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { article_id, status } = req.query;
    
    let query = supabase
      .from('student_attempts')
      .select(`
        *,
        articles (
          id,
          title,
          week_number
        )
      `)
      .eq('student_id', req.user.id)
      .order('started_at', { ascending: false });
    
    if (article_id) {
      query = query.eq('article_id', article_id);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data: attempts, error } = await query;
    
    if (error) throw error;
    
    res.json({ success: true, data: attempts || [] });
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
    
    if (!bitacora_content) {
      return res.status(400).json({ error: 'bitacora_content is required' });
    }
    
    // Verify ownership
    const { data: attempt, error: fetchError } = await supabase
      .from('student_attempts')
      .select('student_id')
      .eq('id', req.params.id)
      .single();
    
    if (fetchError) {
      console.error('Fetch attempt error:', fetchError);
      return res.status(404).json({ error: 'Attempt not found' });
    }
    
    if (!attempt || attempt.student_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Update bitacora (database trigger handles timestamp)
    const { data: updated, error } = await supabase
      .from('student_attempts')
      .update({ bitacora_content })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) {
      console.error('Update error:', error);
      throw error;
    }
    
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update bitacora error:', error);
    res.status(500).json({ error: 'Failed to update bitácora', details: error.message });
  }
});

/**
 * POST /api/attempts/:id/chat
 * Send message to AI tutor (student or tutor message)
 */
router.post('/:id/chat', authenticateUser, async (req, res) => {
  try {
    const { message, bitacora_section } = req.body;
    const attemptId = req.params.id;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Get attempt with article data
    const { data: attempt, error: attemptError } = await supabase
      .from('student_attempts')
      .select('*, articles(*)')
      .eq('id', attemptId)
      .single();
    
    if (attemptError || !attempt) {
      return res.status(404).json({ error: 'Attempt not found' });
    }
    
    if (attempt.student_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Save student message
    const { data: studentMsg, error: studentMsgError } = await supabase
      .from('tutor_interactions')
      .insert({
        attempt_id: attemptId,
        role: 'student',
        tutor_message: message,
        interaction_type: 'question',
        bitacora_section: bitacora_section,
        context_snapshot: attempt.bitacora_content
      })
      .select()
      .single();
    
    if (studentMsgError) throw studentMsgError;
    
    // Get conversation history
    const { data: history } = await supabase
      .from('tutor_interactions')
      .select('*')
      .eq('attempt_id', attemptId)
      .order('timestamp', { ascending: true });
    
    // Use RAG to search article content
    const ragResults = await pdfService.searchArticleContent(
      attempt.article_id,
      message,
      3 // top 3 chunks
    );
    
    // Generate AI response
    const aiResponse = await tutorService.generateCognitiveIntervention({
      studentMessage: message,
      bitacoraContent: attempt.bitacora_content,
      articleContext: ragResults,
      conversationHistory: history || [],
      studentProfile: req.profile,
      currentSection: bitacora_section
    });
    
    // Save AI response
    const { data: tutorMsg, error: tutorMsgError } = await supabase
      .from('tutor_interactions')
      .insert({
        attempt_id: attemptId,
        role: 'tutor',
        tutor_message: aiResponse.message,
        interaction_type: aiResponse.intervention_type,
        cognitive_dimension: aiResponse.cognitive_dimension,
        intervention_strategy: aiResponse.strategy,
        article_chunks_used: ragResults.map((r, i) => ({ chunk_index: i, similarity: r.similarity })),
        bitacora_section: bitacora_section,
        ai_model_used: 'gpt-4o-mini'
      })
      .select()
      .single();
    
    if (tutorMsgError) throw tutorMsgError;
    
    res.json({ 
      success: true, 
      data: {
        studentMessage: studentMsg,
        tutorResponse: tutorMsg
      }
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

/**
 * GET /api/attempts/:id/interactions
 * Get all chat messages for this attempt
 */
router.get('/:id/interactions', authenticateUser, async (req, res) => {
  try {
    const { data: interactions, error } = await supabase
      .from('tutor_interactions')
      .select('*')
      .eq('attempt_id', req.params.id)
      .order('timestamp', { ascending: true });
    
    if (error) throw error;
    
    res.json({ success: true, data: interactions || [] });
  } catch (error) {
    console.error('Get interactions error:', error);
    res.status(500).json({ error: 'Failed to fetch interactions' });
  }
});

/**
 * PUT /api/attempts/:id/submit
 * Submit bitácora for evaluation
 */
router.put('/:id/submit', authenticateUser, async (req, res) => {
  try {
    const { data: attempt } = await supabase
      .from('student_attempts')
      .select('student_id')
      .eq('id', req.params.id)
      .single();
    
    if (!attempt || attempt.student_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { data: updated, error } = await supabase
      .from('student_attempts')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Submit attempt error:', error);
    res.status(500).json({ error: 'Failed to submit attempt' });
  }
});

/**
 * GET /api/attempts/student/:studentId
 * Get all attempts for a specific student (mentor access)
 */
router.get('/student/:studentId', authenticateUser, async (req, res) => {
  try {
    // Verify mentor access
    if (req.profile.role !== 'mentor' && req.profile.role !== 'admin') {
      return res.status(403).json({ error: 'Only mentors can access this' });
    }

    const { data: attempts, error } = await supabase
      .from('student_attempts')
      .select(`
        *,
        articles (
          id,
          title,
          week_number,
          difficulty_level
        )
      `)
      .eq('student_id', req.params.studentId)
      .order('started_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data: attempts || [] });
  } catch (error) {
    console.error('Get student attempts error:', error);
    res.status(500).json({ error: 'Failed to fetch attempts' });
  }
});

module.exports = router;