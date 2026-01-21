-- ============================================
-- STEM ACADEMY PLATFORM - DATABASE SCHEMA
-- Optimized for Supabase with RLS
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE
-- ============================================
-- Note: Supabase auth.users is separate
-- This is our application profile table

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'mentor', 'admin')),
    grade_level VARCHAR(20) CHECK (grade_level IN ('9', '10', '11', 'graduate', NULL)),
    interests TEXT[], -- Array of interests: ['mathematics', 'physics', 'engineering']
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. ARTICLES (Papers for Analysis)
-- ============================================

CREATE TABLE public.articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    subtitle TEXT,
    content_url TEXT, -- Link to PDF or external source
    content_text TEXT, -- Full text if stored directly
    summary TEXT,
    difficulty_level INT CHECK (difficulty_level BETWEEN 1 AND 4),
    -- Cognitive axes this article trains
    cognitive_axes JSONB DEFAULT '[]'::jsonb,
    -- e.g., ["representation", "abstraction", "argumentation", "transfer"]
    article_type VARCHAR(50), -- 'divulgacion', 'tecnico', 'caso_real'
    estimated_reading_minutes INT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. PROBLEMS (Tied to Articles)
-- ============================================

CREATE TABLE public.problems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    problem_type VARCHAR(50), -- 'open-ended', 'modeling', 'interpretation'
    cognitive_focus JSONB DEFAULT '[]'::jsonb, -- Primary axes
    expected_duration_minutes INT,
    difficulty_level INT CHECK (difficulty_level BETWEEN 1 AND 4),
    -- Questions/prompts for different grade levels
    prompts_by_level JSONB DEFAULT '{}'::jsonb,
    -- e.g., {"9": "Identify main variables", "11": "Critique the model"}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. STUDENT ATTEMPTS (Bitácora Entries)
-- ============================================

CREATE TABLE public.student_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    problem_id UUID REFERENCES public.problems(id) ON DELETE CASCADE,
    attempt_number INT DEFAULT 1,
    -- Bitácora content structure
    bitacora_content JSONB DEFAULT '{
        "initial_understanding": "",
        "hypotheses": [],
        "attempts": [],
        "reflections": [],
        "final_thoughts": ""
    }'::jsonb,
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Index for faster queries
CREATE INDEX idx_student_attempts_student ON public.student_attempts(student_id);
CREATE INDEX idx_student_attempts_problem ON public.student_attempts(problem_id);

-- ============================================
-- 5. TUTOR INTERACTIONS (AI Interventions)
-- ============================================

CREATE TABLE public.tutor_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID REFERENCES public.student_attempts(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL,
    -- Types: 'clarification', 'counterexample', 'metacognition', 'transfer', 'focus'
    tutor_message TEXT NOT NULL,
    student_response TEXT,
    context_snapshot JSONB, -- What the student had written when tutor intervened
    ai_model_used VARCHAR(50), -- 'gpt-4', 'claude-3-opus', etc.
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tutor_interactions_attempt ON public.tutor_interactions(attempt_id);

-- ============================================
-- 6. COGNITIVE PROFILES (Student Progress)
-- ============================================

CREATE TABLE public.cognitive_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    -- Profile dimensions (updated over time)
    profile_data JSONB DEFAULT '{
        "representation": {"level": 1, "observations": []},
        "abstraction": {"level": 1, "observations": []},
        "strategy": {"level": 1, "observations": []},
        "argumentation": {"level": 1, "observations": []},
        "metacognition": {"level": 1, "observations": []},
        "transfer": {"level": 1, "observations": []}
    }'::jsonb,
    -- Computed metrics
    strengths TEXT[],
    growth_areas TEXT[],
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. RUBRIC EVALUATIONS (Qualitative Assessments)
-- ============================================

CREATE TABLE public.rubric_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID REFERENCES public.student_attempts(id) ON DELETE CASCADE,
    evaluator_id UUID REFERENCES public.profiles(id), -- mentor or NULL if AI
    evaluator_type VARCHAR(10) CHECK (evaluator_type IN ('mentor', 'ai')),
    dimension VARCHAR(50) NOT NULL,
    -- Dimensions: 'representation', 'abstraction', 'strategy', 'argumentation', 'metacognition', 'transfer'
    level VARCHAR(20) NOT NULL CHECK (level IN ('inicial', 'en_desarrollo', 'competente', 'avanzado')),
    feedback TEXT,
    evidence_quotes TEXT[], -- Specific quotes from bitácora
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rubric_evaluations_attempt ON public.rubric_evaluations(attempt_id);
CREATE INDEX idx_rubric_evaluations_student ON public.rubric_evaluations(attempt_id);

-- ============================================
-- 8. SESSIONS (Weekly Guided Sessions)
-- ============================================

CREATE TABLE public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES public.articles(id),
    session_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INT DEFAULT 90,
    session_type VARCHAR(50) DEFAULT 'guided', -- 'guided', 'discussion', 'metacognitive'
    facilitator_id UUID REFERENCES public.profiles(id),
    meeting_link TEXT, -- Zoom/Google Meet link
    notes TEXT,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 9. SESSION PARTICIPANTS
-- ============================================

CREATE TABLE public.session_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    attendance_status VARCHAR(20) DEFAULT 'registered' CHECK (attendance_status IN ('registered', 'present', 'absent', 'late')),
    participation_notes TEXT,
    UNIQUE(session_id, student_id)
);

-- ============================================
-- 10. ADDITIONAL SUPPORT SESSIONS (Profundización)
-- ============================================

CREATE TABLE public.support_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    mentor_id UUID REFERENCES public.profiles(id),
    session_type VARCHAR(50), -- 'profundizacion', 'preparacion_icfes', 'asesoria'
    topic VARCHAR(255),
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INT DEFAULT 60,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cognitive_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rubric_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Mentors can view all student profiles
CREATE POLICY "Mentors can view all profiles"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('mentor', 'admin')
        )
    );

-- ============================================
-- ARTICLES & PROBLEMS POLICIES
-- ============================================

-- Everyone can view articles and problems
CREATE POLICY "Anyone can view articles"
    ON public.articles FOR SELECT
    USING (true);

CREATE POLICY "Anyone can view problems"
    ON public.problems FOR SELECT
    USING (true);

-- Only mentors/admins can create/update articles
CREATE POLICY "Mentors can manage articles"
    ON public.articles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('mentor', 'admin')
        )
    );

CREATE POLICY "Mentors can manage problems"
    ON public.problems FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('mentor', 'admin')
        )
    );

-- ============================================
-- STUDENT ATTEMPTS POLICIES (Bitácora)
-- ============================================

-- Students can view their own attempts
CREATE POLICY "Students can view own attempts"
    ON public.student_attempts FOR SELECT
    USING (student_id = auth.uid());

-- Students can create/update their own attempts
CREATE POLICY "Students can manage own attempts"
    ON public.student_attempts FOR INSERT
    WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update own attempts"
    ON public.student_attempts FOR UPDATE
    USING (student_id = auth.uid());

-- Mentors can view all attempts
CREATE POLICY "Mentors can view all attempts"
    ON public.student_attempts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('mentor', 'admin')
        )
    );

-- ============================================
-- TUTOR INTERACTIONS POLICIES
-- ============================================

-- Students can view interactions on their attempts
CREATE POLICY "Students can view own tutor interactions"
    ON public.tutor_interactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.student_attempts
            WHERE id = attempt_id AND student_id = auth.uid()
        )
    );

-- Students can respond to tutor interactions
CREATE POLICY "Students can update own interactions"
    ON public.tutor_interactions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.student_attempts
            WHERE id = attempt_id AND student_id = auth.uid()
        )
    );

-- System can create interactions (handled via service role)
-- Mentors can view all
CREATE POLICY "Mentors can view all interactions"
    ON public.tutor_interactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('mentor', 'admin')
        )
    );

-- ============================================
-- COGNITIVE PROFILES POLICIES
-- ============================================

-- Students can view their own profile
CREATE POLICY "Students can view own cognitive profile"
    ON public.cognitive_profiles FOR SELECT
    USING (student_id = auth.uid());

-- Mentors can view all profiles
CREATE POLICY "Mentors can view all cognitive profiles"
    ON public.cognitive_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('mentor', 'admin')
        )
    );

-- Only mentors can update profiles
CREATE POLICY "Mentors can update cognitive profiles"
    ON public.cognitive_profiles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('mentor', 'admin')
        )
    );

-- ============================================
-- RUBRIC EVALUATIONS POLICIES
-- ============================================

-- Students can view evaluations of their attempts
CREATE POLICY "Students can view own evaluations"
    ON public.rubric_evaluations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.student_attempts
            WHERE id = attempt_id AND student_id = auth.uid()
        )
    );

-- Mentors can create/view all evaluations
CREATE POLICY "Mentors can manage evaluations"
    ON public.rubric_evaluations FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('mentor', 'admin')
        )
    );

-- ============================================
-- SESSIONS POLICIES
-- ============================================

-- Everyone can view scheduled sessions
CREATE POLICY "Anyone can view sessions"
    ON public.sessions FOR SELECT
    USING (true);

-- Mentors can manage sessions
CREATE POLICY "Mentors can manage sessions"
    ON public.sessions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('mentor', 'admin')
        )
    );

-- ============================================
-- SESSION PARTICIPANTS POLICIES
-- ============================================

-- Students can view their participation
CREATE POLICY "Students can view own participation"
    ON public.session_participants FOR SELECT
    USING (student_id = auth.uid());

-- Students can register for sessions
CREATE POLICY "Students can register for sessions"
    ON public.session_participants FOR INSERT
    WITH CHECK (student_id = auth.uid());

-- Mentors can view/manage all participants
CREATE POLICY "Mentors can manage participants"
    ON public.session_participants FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('mentor', 'admin')
        )
    );

-- ============================================
-- SUPPORT SESSIONS POLICIES
-- ============================================

-- Students can view their own support sessions
CREATE POLICY "Students can view own support sessions"
    ON public.support_sessions FOR SELECT
    USING (student_id = auth.uid());

-- Students can request support sessions
CREATE POLICY "Students can create support sessions"
    ON public.support_sessions FOR INSERT
    WITH CHECK (student_id = auth.uid());

-- Mentors can view/manage all support sessions
CREATE POLICY "Mentors can manage support sessions"
    ON public.support_sessions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('mentor', 'admin')
        )
    );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON public.articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_problems_updated_at BEFORE UPDATE ON public.problems
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_attempts_updated_at BEFORE UPDATE ON public.student_attempts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create cognitive profile when student signs up
CREATE OR REPLACE FUNCTION create_cognitive_profile_for_new_student()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role = 'student' THEN
        INSERT INTO public.cognitive_profiles (student_id)
        VALUES (NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_profile_on_signup AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION create_cognitive_profile_for_new_student();

-- ============================================
-- INITIAL SEED DATA (Optional)
-- ============================================

-- Create a sample article (you can remove this)
INSERT INTO public.articles (title, subtitle, summary, difficulty_level, cognitive_axes, article_type, estimated_reading_minutes)
VALUES (
    'El Problema de Monty Hall: Probabilidad e Intuición',
    'Un análisis sobre cómo nuestras intuiciones pueden engañarnos',
    'Exploramos el famoso problema de Monty Hall y por qué la respuesta correcta desafía nuestra intuición sobre probabilidad.',
    2,
    '["abstraction", "argumentation", "representation"]'::jsonb,
    'divulgacion',
    15
);

-- ============================================
-- END OF SCHEMA
-- ============================================

-- Post-Setup Verification
-- After running this schema, verify in Supabase:

-- Authentication > Policies: Verify RLS policies are active
-- Table Editor: Check all 10 tables are created
-- Run the above query to list all tables and ensure they exist.

SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Fix the search_path warnings if any
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';
ALTER FUNCTION public.create_cognitive_profile_for_new_student() SET search_path = '';


-- ============================================
-- ADDITIONAL MIGRATION FOR RAG EMBEDDINGS AND PDF HANDLING
-- ============================================
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create embeddings table for RAG
CREATE TABLE public.article_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding vector(1536), -- OpenAI ada-002 dimension
    page_number INT,
    chunk_index INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for similarity search
CREATE INDEX ON public.article_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Add RLS policies
ALTER TABLE public.article_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read embeddings"
    ON public.article_embeddings FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Mentors can insert embeddings"
    ON public.article_embeddings FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('mentor', 'admin'))
    );

-- Update articles table to store PDF URL
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS pdf_url TEXT,
ADD COLUMN IF NOT EXISTS pdf_processed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS week_number INT;

-- Add index for week filtering
CREATE INDEX idx_articles_created_at ON public.articles(created_at DESC);

-- ============================================
-- END OF ADDITIONAL MIGRATION
-- ============================================

-- ============================================
-- MIGRATION: Adapt schema for RAG-based approach
-- ============================================

-- 1. Drop problems table
DROP TABLE IF EXISTS public.problems CASCADE;

-- 2. Update student_attempts to link to articles directly
ALTER TABLE public.student_attempts 
DROP CONSTRAINT IF EXISTS student_attempts_problem_id_fkey;

ALTER TABLE public.student_attempts 
DROP COLUMN IF EXISTS problem_id;

ALTER TABLE public.student_attempts 
ADD COLUMN IF NOT EXISTS article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_student_attempts_article 
ON public.student_attempts(article_id);

-- 3. Add helpful columns
ALTER TABLE public.student_attempts 
ADD COLUMN IF NOT EXISTS rag_queries_count INT DEFAULT 0;

COMMENT ON COLUMN public.student_attempts.bitacora_content IS 
'Student work log - free-form notes, questions, reflections, and AI conversation history';

-- 4. Verify final table list
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verification: Run this to confirm policies are still valid
SELECT 
    tablename, 
    policyname, 
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'student_attempts';


-- ============================================
-- MIGRATION: Bitácora Structured Template
-- Date: 2026-01-21
-- Purpose: Update schema for structured bitácora sections + AI tutor context
-- ============================================

-- 1. Update student_attempts bitacora_content structure to match pedagogical template
ALTER TABLE public.student_attempts 
ALTER COLUMN bitacora_content SET DEFAULT '{
  "observaciones": "",
  "preguntas": [],
  "hipotesis": "",
  "variables": [],
  "experimentos": "",
  "errores_aprendizajes": "",
  "reflexiones": "",
  "conclusiones": ""
}'::jsonb;

-- Update comment to reflect new structure
COMMENT ON COLUMN public.student_attempts.bitacora_content IS 
'Structured student notebook with 8 sections: observaciones, preguntas, hipotesis, variables, experimentos, errores_aprendizajes, reflexiones, conclusiones';

-- 2. Add context fields to tutor_interactions for better AI tracking
ALTER TABLE public.tutor_interactions
ADD COLUMN IF NOT EXISTS cognitive_dimension VARCHAR(50),
ADD COLUMN IF NOT EXISTS intervention_strategy VARCHAR(50),
ADD COLUMN IF NOT EXISTS article_chunks_used JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS bitacora_section VARCHAR(50);

-- Add comments for documentation
COMMENT ON COLUMN tutor_interactions.cognitive_dimension IS 
'Which of the 6 cognitive dimensions this interaction targets: representation, abstraction, strategy, argumentation, metacognition, transfer';

COMMENT ON COLUMN tutor_interactions.intervention_strategy IS 
'Type of pedagogical intervention: socratic_question, hint, clarification, validation, challenge, connection';

COMMENT ON COLUMN tutor_interactions.article_chunks_used IS 
'Array of article_embeddings chunk indices used in RAG for this response';

COMMENT ON COLUMN tutor_interactions.bitacora_section IS 
'Which bitacora section the student was working on when this interaction occurred';

-- 3. Add role field to tutor_interactions to distinguish student vs AI messages
ALTER TABLE public.tutor_interactions
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'tutor' CHECK (role IN ('student', 'tutor'));

-- Update comment on tutor_message to clarify it can be from either party
COMMENT ON COLUMN tutor_interactions.tutor_message IS 
'Message content - can be from student (role=student) or AI tutor (role=tutor)';

-- 4. Create index for faster bitacora queries by week
CREATE INDEX IF NOT EXISTS idx_attempts_student_article 
ON public.student_attempts(student_id, article_id);

-- 5. Create index for tutor interactions ordering
CREATE INDEX IF NOT EXISTS idx_tutor_interactions_timestamp 
ON public.tutor_interactions(attempt_id, timestamp);

-- 6. Verify the changes
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'student_attempts' 
AND column_name = 'bitacora_content';

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tutor_interactions' 
AND column_name IN ('cognitive_dimension', 'intervention_strategy', 'article_chunks_used', 'bitacora_section', 'role')
ORDER BY column_name;

-- ============================================
-- END OF MIGRATION
-- ============================================