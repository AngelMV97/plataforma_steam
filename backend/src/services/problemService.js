const { supabase } = require('../config/supabase');

class ProblemService {
  
  /**
   * Get all articles
   */
  async getArticles(filters = {}) {
    let query = supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.difficulty_level) {
      query = query.eq('difficulty_level', filters.difficulty_level);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  /**
   * Get single article with its problems
   */
  async getArticleWithProblems(articleId) {
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('*')
      .eq('id', articleId)
      .single();

    if (articleError) throw articleError;

    const { data: problems, error: problemsError } = await supabase
      .from('problems')
      .select('*')
      .eq('article_id', articleId);

    if (problemsError) throw problemsError;

    return {
      ...article,
      problems
    };
  }

  /**
   * Create new student attempt (bitácora)
   */
  async createAttempt(studentId, problemId) {
    // Check if there's an existing incomplete attempt
    const { data: existing } = await supabase
      .from('student_attempts')
      .select('*')
      .eq('student_id', studentId)
      .eq('problem_id', problemId)
      .eq('status', 'in_progress')
      .single();

    if (existing) {
      return existing; // Return existing attempt instead of creating new
    }

    // Create new attempt
    const { data, error } = await supabase
      .from('student_attempts')
      .insert({
        student_id: studentId,
        problem_id: problemId,
        attempt_number: 1
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update bitácora content
   */
  async updateBitacora(attemptId, studentId, bitacoraContent) {
    const { data, error } = await supabase
      .from('student_attempts')
      .update({
        bitacora_content: bitacoraContent,
        last_updated: new Date().toISOString()
      })
      .eq('id', attemptId)
      .eq('student_id', studentId) // Security: ensure student owns this attempt
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get student's attempts
   */
  async getStudentAttempts(studentId, filters = {}) {
    let query = supabase
      .from('student_attempts')
      .select(`
        *,
        problems:problem_id (
          id,
          title,
          article_id,
          articles:article_id (
            id,
            title
          )
        )
      `)
      .eq('student_id', studentId)
      .order('last_updated', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
}

module.exports = new ProblemService();