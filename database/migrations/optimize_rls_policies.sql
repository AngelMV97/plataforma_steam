-- ============================================
-- MIGRATION: Optimize RLS Policies & Indexes
-- Date: 2026-01-24
-- Purpose: Fix 30 performance warnings from Supabase
-- ============================================

-- ============================================
-- PART 1: Optimize auth.uid() Re-evaluation (Issues 1-22)
-- Fix: Wrap auth.uid() in (SELECT auth.uid()) to prevent re-evaluation per row
-- ============================================

-- PROFILES TABLE (Issues 1-3)
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Mentors can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS profiles_insert ON public.profiles;
DROP POLICY IF EXISTS profiles_select ON public.profiles;
DROP POLICY IF EXISTS profiles_update ON public.profiles;

-- Recreate with optimized auth checks
CREATE POLICY profiles_select ON public.profiles
    FOR SELECT
    TO authenticated
    USING (
        id = (SELECT auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (SELECT auth.uid()) AND role IN ('mentor', 'admin')
        )
    );

CREATE POLICY profiles_insert ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY profiles_update ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (id = (SELECT auth.uid()));

-- ARTICLES TABLE (Issue 4)
-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view articles" ON public.articles;
DROP POLICY IF EXISTS "Mentors can manage articles" ON public.articles;
DROP POLICY IF EXISTS articles_select ON public.articles;
DROP POLICY IF EXISTS articles_modify ON public.articles;
DROP POLICY IF EXISTS articles_all_access ON public.articles;

-- Recreate combined policy (fixes duplicate policy issue #23)
CREATE POLICY articles_access ON public.articles
    FOR ALL
    TO authenticated
    USING (
        -- Anyone can view
        true
    )
    WITH CHECK (
        -- Only mentors can modify
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (SELECT auth.uid()) AND role IN ('mentor', 'admin')
        )
    );

-- STUDENT ATTEMPTS TABLE (Issues 5-7)
DROP POLICY IF EXISTS "Students can view own attempts" ON public.student_attempts;
DROP POLICY IF EXISTS "Students can manage own attempts" ON public.student_attempts;
DROP POLICY IF EXISTS "Students can update own attempts" ON public.student_attempts;
DROP POLICY IF EXISTS "Mentors can view all attempts" ON public.student_attempts;
DROP POLICY IF EXISTS attempts_insert ON public.student_attempts;
DROP POLICY IF EXISTS attempts_select ON public.student_attempts;
DROP POLICY IF EXISTS attempts_update ON public.student_attempts;

-- Recreate with optimized auth
CREATE POLICY attempts_select ON public.student_attempts
    FOR SELECT
    TO authenticated
    USING (
        student_id = (SELECT auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (SELECT auth.uid()) AND role IN ('mentor', 'admin')
        )
    );

CREATE POLICY attempts_insert ON public.student_attempts
    FOR INSERT
    TO authenticated
    WITH CHECK (student_id = (SELECT auth.uid()));

CREATE POLICY attempts_update ON public.student_attempts
    FOR UPDATE
    TO authenticated
    USING (student_id = (SELECT auth.uid()));

-- TUTOR INTERACTIONS TABLE (Issues 8-9)
DROP POLICY IF EXISTS "Students can view own tutor interactions" ON public.tutor_interactions;
DROP POLICY IF EXISTS "Students can update own interactions" ON public.tutor_interactions;
DROP POLICY IF EXISTS "Mentors can view all interactions" ON public.tutor_interactions;
DROP POLICY IF EXISTS interactions_insert ON public.tutor_interactions;
DROP POLICY IF EXISTS interactions_select ON public.tutor_interactions;

CREATE POLICY interactions_select ON public.tutor_interactions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.student_attempts
            WHERE id = attempt_id AND student_id = (SELECT auth.uid())
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (SELECT auth.uid()) AND role IN ('mentor', 'admin')
        )
    );

CREATE POLICY interactions_insert ON public.tutor_interactions
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.student_attempts
            WHERE id = attempt_id AND student_id = (SELECT auth.uid())
        )
    );

-- COGNITIVE PROFILES TABLE (Issues 10-12)
DROP POLICY IF EXISTS "Students can view own cognitive profile" ON public.cognitive_profiles;
DROP POLICY IF EXISTS "Mentors can view all cognitive profiles" ON public.cognitive_profiles;
DROP POLICY IF EXISTS "Mentors can update cognitive profiles" ON public.cognitive_profiles;
DROP POLICY IF EXISTS cognitive_insert ON public.cognitive_profiles;
DROP POLICY IF EXISTS cognitive_select ON public.cognitive_profiles;
DROP POLICY IF EXISTS cognitive_update ON public.cognitive_profiles;

CREATE POLICY cognitive_select ON public.cognitive_profiles
    FOR SELECT
    TO authenticated
    USING (
        student_id = (SELECT auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (SELECT auth.uid()) AND role IN ('mentor', 'admin')
        )
    );

CREATE POLICY cognitive_insert ON public.cognitive_profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (SELECT auth.uid()) AND role IN ('mentor', 'admin')
        )
    );

CREATE POLICY cognitive_update ON public.cognitive_profiles
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (SELECT auth.uid()) AND role IN ('mentor', 'admin')
        )
    );

-- RUBRIC EVALUATIONS TABLE (Issues 13-14, 24)
DROP POLICY IF EXISTS "Students can view own evaluations" ON public.rubric_evaluations;
DROP POLICY IF EXISTS "Mentors can manage evaluations" ON public.rubric_evaluations;
DROP POLICY IF EXISTS evaluations_modify ON public.rubric_evaluations;
DROP POLICY IF EXISTS evaluations_select ON public.rubric_evaluations;

-- Combine into single policy (fixes duplicate policy issue #24)
CREATE POLICY evaluations_access ON public.rubric_evaluations
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.student_attempts
            WHERE id = attempt_id AND student_id = (SELECT auth.uid())
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (SELECT auth.uid()) AND role IN ('mentor', 'admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (SELECT auth.uid()) AND role IN ('mentor', 'admin')
        )
    );

-- SESSIONS TABLE (Issue 15, 27)
DROP POLICY IF EXISTS "Anyone can view sessions" ON public.sessions;
DROP POLICY IF EXISTS "Mentors can manage sessions" ON public.sessions;
DROP POLICY IF EXISTS sessions_modify ON public.sessions;
DROP POLICY IF EXISTS sessions_select ON public.sessions;

-- Combine into single policy (fixes duplicate policy issue #27)
CREATE POLICY sessions_access ON public.sessions
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (SELECT auth.uid()) AND role IN ('mentor', 'admin')
        )
    );

-- SESSION PARTICIPANTS TABLE (Issues 16-18, 25-26)
DROP POLICY IF EXISTS "Students can view own participation" ON public.session_participants;
DROP POLICY IF EXISTS "Students can register for sessions" ON public.session_participants;
DROP POLICY IF EXISTS "Mentors can manage participants" ON public.session_participants;
DROP POLICY IF EXISTS participants_insert ON public.session_participants;
DROP POLICY IF EXISTS participants_modify ON public.session_participants;
DROP POLICY IF EXISTS participants_select ON public.session_participants;

-- Combine into single policy (fixes duplicate policy issues #25-26)
CREATE POLICY participants_access ON public.session_participants
    FOR ALL
    TO authenticated
    USING (
        student_id = (SELECT auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (SELECT auth.uid()) AND role IN ('mentor', 'admin')
        )
    )
    WITH CHECK (
        student_id = (SELECT auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (SELECT auth.uid()) AND role IN ('mentor', 'admin')
        )
    );

-- SUPPORT SESSIONS TABLE (Issues 19-21, 28-29)
DROP POLICY IF EXISTS "Students can view own support sessions" ON public.support_sessions;
DROP POLICY IF EXISTS "Students can create support sessions" ON public.support_sessions;
DROP POLICY IF EXISTS "Mentors can manage support sessions" ON public.support_sessions;
DROP POLICY IF EXISTS support_insert ON public.support_sessions;
DROP POLICY IF EXISTS support_modify ON public.support_sessions;
DROP POLICY IF EXISTS support_select ON public.support_sessions;

-- Combine into single policy (fixes duplicate policy issues #28-29)
CREATE POLICY support_access ON public.support_sessions
    FOR ALL
    TO authenticated
    USING (
        student_id = (SELECT auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (SELECT auth.uid()) AND role IN ('mentor', 'admin')
        )
    )
    WITH CHECK (
        student_id = (SELECT auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (SELECT auth.uid()) AND role IN ('mentor', 'admin')
        )
    );

-- ARTICLE EMBEDDINGS TABLE (Issue 22)
DROP POLICY IF EXISTS "Anyone can read embeddings" ON public.article_embeddings;
DROP POLICY IF EXISTS "Mentors can insert embeddings" ON public.article_embeddings;

CREATE POLICY embeddings_select ON public.article_embeddings
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY embeddings_insert ON public.article_embeddings
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (SELECT auth.uid()) AND role IN ('mentor', 'admin')
        )
    );

-- ============================================
-- PART 2: Remove Duplicate Indexes (Issue 30)
-- ============================================

-- Check which indexes exist and are identical
DO $$
DECLARE
    index_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'idx_rubric_evaluations_student'
    ) INTO index_exists;
    
    IF index_exists THEN
        DROP INDEX IF EXISTS idx_rubric_evaluations_student;
        RAISE NOTICE 'Dropped duplicate index: idx_rubric_evaluations_student';
    END IF;
END $$;

-- Keep idx_rubric_evaluations_attempt as it's likely more useful

-- ============================================
-- PART 3: Verify Changes
-- ============================================

-- List all policies to verify
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- List all indexes on rubric_evaluations
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'rubric_evaluations';

-- ============================================
-- END OF MIGRATION
-- ============================================

COMMENT ON TABLE public.profiles IS 'Migration applied: 2026-01-24 - Optimized RLS policies for performance';

-- ============================================
-- ADDENDUM: Fix Security Warnings (search_path, vector schema, RLS)
-- Date: 2026-01-24
-- ============================================

-- Fix security warnings related to search_path, vector extension schema, and overly permissive RLS policies

-- 1) Move vector extension to dedicated schema and set stable search_path on match_article_chunks
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Drop legacy signatures and recreate with fixed search_path and expected signature
DROP FUNCTION IF EXISTS public.match_article_chunks(vector, double precision, integer);
DROP FUNCTION IF EXISTS public.match_article_chunks(uuid, text, double precision, integer);

CREATE OR REPLACE FUNCTION public.match_article_chunks(
    query_embedding vector,
    article_id uuid,
    match_threshold double precision DEFAULT 0.7,
    match_count integer DEFAULT 5
)
RETURNS TABLE (
    id uuid,
    article_id uuid,
    content text,
    page_number integer,
    chunk_index integer,
    similarity double precision
)
LANGUAGE sql STABLE
SET search_path = pg_catalog, public, extensions
AS $$
    SELECT
        ae.id,
        ae.article_id,
        ae.content,
        ae.page_number,
        ae.chunk_index,
        (1 - (ae.embedding <=> query_embedding)) AS similarity
    FROM public.article_embeddings ae
    WHERE (article_id IS NULL OR ae.article_id = article_id)
        AND (1 - (ae.embedding <=> query_embedding)) > match_threshold
    ORDER BY similarity DESC
    LIMIT match_count;
$$;

-- 2) Replace permissive RLS on articles with separate read/write policies
DROP POLICY IF EXISTS articles_access ON public.articles;
DROP POLICY IF EXISTS articles_read ON public.articles;
DROP POLICY IF EXISTS articles_insert ON public.articles;
DROP POLICY IF EXISTS articles_update ON public.articles;
DROP POLICY IF EXISTS articles_delete ON public.articles;

CREATE POLICY articles_read ON public.articles
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY articles_insert ON public.articles
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (SELECT auth.uid()) AND role IN ('mentor', 'admin')
        )
    );

CREATE POLICY articles_update ON public.articles
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (SELECT auth.uid()) AND role IN ('mentor', 'admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (SELECT auth.uid()) AND role IN ('mentor', 'admin')
        )
    );

CREATE POLICY articles_delete ON public.articles
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (SELECT auth.uid()) AND role IN ('mentor', 'admin')
        )
    );

-- 3) Replace permissive RLS on sessions with separate read/write policies
DROP POLICY IF EXISTS sessions_access ON public.sessions;
DROP POLICY IF EXISTS sessions_read ON public.sessions;
DROP POLICY IF EXISTS sessions_insert ON public.sessions;
DROP POLICY IF EXISTS sessions_update ON public.sessions;
DROP POLICY IF EXISTS sessions_delete ON public.sessions;

CREATE POLICY sessions_read ON public.sessions
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY sessions_insert ON public.sessions
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (SELECT auth.uid()) AND role IN ('mentor', 'admin')
        )
    );

CREATE POLICY sessions_update ON public.sessions
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (SELECT auth.uid()) AND role IN ('mentor', 'admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (SELECT auth.uid()) AND role IN ('mentor', 'admin')
        )
    );

CREATE POLICY sessions_delete ON public.sessions
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (SELECT auth.uid()) AND role IN ('mentor', 'admin')
        )
    );

-- ============================================
-- Leaked Password Protection Disabled needs Pro plan
-- ALTER SYSTEM SET auth.leaked_password_protection = 'on';
-- or go to Supabase Dashboard > Authentication > Attack Protection > set Prevent use of leaked passwords to ON
-- only available on Supabase Pro plan and above
-- ============================================

-- Helper to avoid recursive RLS on public.profiles
CREATE OR REPLACE FUNCTION public.is_mentor_or_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = user_id
      AND role IN ('mentor','admin')
  );
$$;

-- Replace recursive profiles SELECT policy
DROP POLICY IF EXISTS profiles_select ON public.profiles;

CREATE POLICY profiles_select ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    id = (SELECT auth.uid())
    OR public.is_mentor_or_admin((SELECT auth.uid()))
  );