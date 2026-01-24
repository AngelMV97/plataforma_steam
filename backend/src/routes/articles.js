const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateUser, requireRole } = require('../middleware/auth');
const problemService = require('../services/problemService');
const pdfService = require('../services/pdfService');
const { supabase } = require('../config/supabase');

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

/**
 * GET /api/articles
 * Get all articles
 */
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { difficulty_level, current_week } = req.query;
    
    let query = supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (difficulty_level) {
      query = query.eq('difficulty_level', difficulty_level);
    }
    
    // Filter for current week (articles uploaded in last 7 days)
    if (current_week === 'true') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      query = query.gte('created_at', sevenDaysAgo.toISOString());
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

/**
 * GET /api/articles/:id
 * Get single article
 */
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

/**
 * POST /api/articles
 * Create new article with PDF upload (mentors only)
 */
router.post(
  '/',
  authenticateUser,
  requireRole('mentor', 'admin'),
  upload.single('pdf'),
  async (req, res) => {
    try {
      const {
        title,
        subtitle,
        summary,
        difficulty_level,
        cognitive_axes,
        article_type,
        estimated_reading_minutes,
        week_number,
      } = req.body;

      const pdfFile = req.file;

      if (!pdfFile) {
        return res.status(400).json({ error: 'PDF file is required' });
      }

      // Parse cognitive_axes if it's a string
      const parsedAxes = typeof cognitive_axes === 'string' 
        ? JSON.parse(cognitive_axes) 
        : cognitive_axes;

      // Upload PDF to Supabase Storage
      // Sanitize filename: remove accents and special characters
      const sanitizedFilename = pdfFile.originalname
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-zA-Z0-9.-]/g, '_'); // Replace other special chars with underscore
        
      const fileName = `${Date.now()}-${sanitizedFilename}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('articles')
        .upload(fileName, pdfFile.buffer, {
          contentType: 'application/pdf',
          cacheControl: '3600',
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('articles')
        .getPublicUrl(fileName);

      // Create article record
      const { data: article, error: articleError } = await supabase
        .from('articles')
        .insert({
          title,
          subtitle,
          summary,
          difficulty_level: parseInt(difficulty_level),
          cognitive_axes: parsedAxes,
          article_type,
          estimated_reading_minutes: parseInt(estimated_reading_minutes),
          week_number: week_number ? parseInt(week_number) : null,
          pdf_url: publicUrl,
          pdf_processed: false,
          created_by: req.user.id,
        })
        .select()
        .single();

      if (articleError) throw articleError;

      // Process PDF asynchronously (don't wait)
      pdfService.processPDF(pdfFile.buffer, article.id)
        .then(() => console.log(`PDF processed for article ${article.id}`))
        .catch(err => console.error('Background PDF processing error:', err));

      res.json({ 
        success: true, 
        data: article,
        message: 'Article created. PDF is being processed in the background.'
      });
    } catch (error) {
      console.error('Create article error:', error);
      res.status(500).json({ error: error.message || 'Failed to create article' });
    }
  }
);

/**
 * POST /api/articles/:id/search
 * Search article content using RAG
 */
router.post('/:id/search', authenticateUser, async (req, res) => {
  try {
    const { query } = req.body;
    const articleId = req.params.id;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    const results = await pdfService.searchArticleContent(articleId, query);
    
    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Article search error:', error);
    res.status(500).json({ error: 'Failed to search article' });
  }
});

/**
 * PUT /api/articles/:id
 * Update article metadata (mentors only)
 */
router.put(
  '/:id',
  authenticateUser,
  requireRole('mentor', 'admin'),
  async (req, res) => {
    try {
      const { title, week_number, difficulty_level, article_type } = req.body;
      const articleId = req.params.id;

      // Validate required fields
      if (!title || !title.trim()) {
        return res.status(400).json({ error: 'El título es obligatorio' });
      }

      // Build update object with only provided fields
      const updateData = {};
      
      if (title) updateData.title = title.trim();
      if (week_number !== undefined) updateData.week_number = parseInt(week_number);
      if (difficulty_level !== undefined) updateData.difficulty_level = parseInt(difficulty_level);
      if (article_type) updateData.article_type = article_type;

      // Update article in database
      const { data: article, error: updateError } = await supabase
        .from('articles')
        .update(updateData)
        .eq('id', articleId)
        .select()
        .single();

      if (updateError) throw updateError;

      if (!article) {
        return res.status(404).json({ error: 'Artículo no encontrado' });
      }

      res.json({ 
        success: true, 
        data: article,
        message: 'Artículo actualizado exitosamente'
      });
    } catch (error) {
      console.error('Update article error:', error);
      res.status(500).json({ error: error.message || 'Error al actualizar artículo' });
    }
  }
);

/**
 * DELETE /api/articles/:id
 * Delete article (mentors only)
 */
router.delete(
  '/:id',
  authenticateUser,
  requireRole('mentor', 'admin'),
  async (req, res) => {
    try {
      const articleId = req.params.id;

      // First get the article to get the PDF filename
      const { data: article, error: fetchError } = await supabase
        .from('articles')
        .select('pdf_url')
        .eq('id', articleId)
        .single();

      if (fetchError || !article) {
        return res.status(404).json({ error: 'Artículo no encontrado' });
      }

      // Delete the article from database
      const { error: deleteError } = await supabase
        .from('articles')
        .delete()
        .eq('id', articleId);

      if (deleteError) throw deleteError;

      // Optionally delete the PDF from storage
      // Extract filename from pdf_url
      if (article.pdf_url) {
        const filename = article.pdf_url.split('/').pop();
        if (filename) {
          await supabase.storage
            .from('articles')
            .remove([filename]);
        }
      }

      res.json({ 
        success: true,
        message: 'Artículo eliminado exitosamente'
      });
    } catch (error) {
      console.error('Delete article error:', error);
      res.status(500).json({ error: error.message || 'Error al eliminar artículo' });
    }
  }
);

module.exports = router;