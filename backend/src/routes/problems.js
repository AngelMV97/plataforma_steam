const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const { supabase } = require('../config/supabase');
const problemGenerator = require('../services/problemGeneratorService');

/**
 * GET /api/problems/test
 * Test endpoint to verify service configuration
 */
router.get('/test', authenticateUser, async (req, res) => {
  try {
    const hasOpenAiKey = !!process.env.OPENAI_API_KEY;
    const hasSupabase = !!process.env.SUPABASE_URL;
    
    res.json({
      success: true,
      status: 'Service is running',
      config: {
        openai_configured: hasOpenAiKey,
        supabase_configured: hasSupabase,
        user_id: req.user.id,
        profile_role: req.profile.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/problems/generate
 * Generate a new problem for the student
 */
router.post('/generate', authenticateUser, async (req, res) => {
  try {
    const { 
      article_id, 
      problem_type,
      cognitive_target 
    } = req.body;

    console.log('Generating problem with params:', {
      user_id: req.user.id,
      problem_type,
      cognitive_target
    });

    // Get student's cognitive profile
    const { data: profile } = await supabase
      .from('cognitive_profiles')
      .select('*')
      .eq('student_id', req.user.id)
      .single();

    console.log('Student profile:', profile ? 'found' : 'not found');

    // Get article context if provided
    let articleContext = null;
    if (article_id) {
      const { data: article } = await supabase
        .from('articles')
        .select('title, summary, content_text')
        .eq('id', article_id)
        .single();
      articleContext = article;
    }

    // Determine difficulty based on profile
    const avgLevel = profile?.profile_data 
      ? Object.values(profile.profile_data).reduce((sum, d) => sum + (d.level || 1), 0) / 6
      : 2;
    const difficulty = Math.ceil(avgLevel);

    console.log('About to call generateProblem...');

    // Generate problem (with fallback if OpenAI unavailable)
    const problem = await problemGenerator.generateProblemWithFallback({
      studentProfile: {
        grade_level: req.profile.grade_level || '9',
        profile_data: profile?.profile_data
      },
      articleContext,
      problemType: problem_type || 'integrado',
      difficulty,
      cognitiveTarget: cognitive_target || 'representacion'
    });

    console.log('Problem generated successfully');

    // Create attempt for this problem
    const { data: attempt, error } = await supabase
      .from('student_attempts')
      .insert({
        student_id: req.user.id,
        article_id: article_id || null,
        status: 'in_progress',
        bitacora_content: {
          observaciones: '',
          preguntas: [],
          hipotesis: '',
          variables: [],
          experimentos: '',
          errores_aprendizajes: '',
          reflexiones: '',
          conclusiones: '',
          // Store generated problem
          generated_problem: problem
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    console.log('Attempt created:', attempt.id);

    res.json({ 
      success: true, 
      data: {
        attempt_id: attempt.id,
        problem
      }
    });
  } catch (error) {
    console.error('Generate problem error:', error);
    console.error('Error details:', {
      message: error?.message,
      status: error?.status,
      code: error?.code,
      name: error?.name,
      stack: error?.stack
    });
    
    const errorMessage = error?.message || 'Unknown error occurred';
    res.status(500).json({ 
      error: 'Failed to generate problem', 
      details: errorMessage
    });
  }
});

/**
 * POST /api/problems/hint
 * Request a hint for current problem
 */
router.post('/hint', authenticateUser, async (req, res) => {
  try {
    const { attempt_id, hint_level } = req.body;

    // Get attempt with problem
    const { data: attempt } = await supabase
      .from('student_attempts')
      .select('*')
      .eq('id', attempt_id)
      .eq('student_id', req.user.id)
      .single();

    if (!attempt) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    const problem = attempt.bitacora_content.generated_problem;
    if (!problem) {
      return res.status(400).json({ error: 'No problem found in attempt' });
    }

    // Generate hint
    const hint = await problemGenerator.generateHint({
      problem,
      studentAttempt: JSON.stringify(attempt.bitacora_content),
      studentProfile: req.profile,
      hintLevel: hint_level || 'light'
    });

    // Save hint as tutor interaction
    await supabase
      .from('tutor_interactions')
      .insert({
        attempt_id,
        role: 'tutor',
        tutor_message: hint,
        interaction_type: 'hint',
        intervention_strategy: hint_level
      });

    res.json({ success: true, data: { hint } });
  } catch (error) {
    console.error('Generate hint error:', error);
    res.status(500).json({ error: 'Failed to generate hint' });
  }
});

/**
 * POST /api/problems/analyze
 * Get AI analysis of problem-solving process
 */
router.post('/analyze', authenticateUser, async (req, res) => {
  try {
    const { attempt_id } = req.body;

    const { data: attempt } = await supabase
      .from('student_attempts')
      .select('*')
      .eq('id', attempt_id)
      .eq('student_id', req.user.id)
      .single();

    if (!attempt || !attempt.bitacora_content.generated_problem) {
      return res.status(404).json({ error: 'Problem attempt not found' });
    }

    // Import tutorService to use the analysis function
    const tutorService = require('../services/tutorService');

    const analysis = await tutorService.analyzeProblemSolvingProcess(
      attempt.bitacora_content,
      attempt.bitacora_content.generated_problem,
      req.profile
    );

    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error('Analyze problem error:', error);
    res.status(500).json({ error: 'Failed to analyze problem' });
  }
});

module.exports = router;