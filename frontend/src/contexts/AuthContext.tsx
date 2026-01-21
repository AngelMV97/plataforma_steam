'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'mentor' | 'admin';
  grade_level?: string;
  interests?: string[];
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: string, gradeLevel?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSigningUp, setIsSigningUp] = useState(false); // NEW: Track signup state
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session fetch error:', error);
        setError(error.message);
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('Found session for user:', session.user.email);
        fetchProfile(session.user.id);
      } else {
        console.log('No active session');
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Don't fetch profile during signup - it will be fetched after creation
        if (!isSigningUp) {
          fetchProfile(session.user.id);
        }
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [isSigningUp]);

  async function fetchProfile(userId: string, silent = false) {
    try {
      if (!silent) {
        console.log('Fetching profile for user ID:', userId);
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Only log if not silent and not a "not found" error
        if (!silent || error.code !== 'PGRST116') {
          console.error('Profile fetch error:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          });
        }
        
        // PGRST116 = Row not found
        if (error.code === 'PGRST116') {
          if (!silent) {
            console.warn('Profile does not exist yet for user:', userId);
            setError('Perfil no encontrado. Por favor contacta al administrador.');
          }
        } else {
          setError(error.message);
          throw error;
        }
      } else {
        console.log('Profile fetched successfully:', data);
        setProfile(data);
        setError(null);
      }
    } catch (error: any) {
      if (!silent) {
        console.error('Unexpected error in fetchProfile:', error);
        setError(error?.message || 'Error desconocido al cargar perfil');
      }
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Signing in:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }

      console.log('Sign in successful');

      // Wait for profile to be fetched
      if (data.user) {
        await fetchProfile(data.user.id);
        
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching role for redirect:', profileError);
          throw new Error('No se pudo determinar el rol del usuario');
        }

        console.log('Redirecting to:', profileData.role);

        if (profileData?.role === 'student') {
          router.push('/student');
        } else if (profileData?.role === 'mentor') {
          router.push('/mentor');
        } else {
          router.push('/');
        }
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function signUp(
    email: string,
    password: string,
    fullName: string,
    role: string,
    gradeLevel?: string
  ) {
    try {
      setLoading(true);
      setError(null);
      setIsSigningUp(true); // NEW: Mark that we're signing up
      
      console.log('Starting signup for:', email, 'as', role);

      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Auth signup error:', error);
        throw error;
      }
      
      if (!data.user) {
        throw new Error('No user returned from signup');
      }

      console.log('User created:', data.user.id);

      // Wait longer for auth.users to be fully created
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log('Creating profile...');

      // Create profile - retry if it fails
      let profileCreated = false;
      let retries = 0;
      const maxRetries = 3;

      while (!profileCreated && retries < maxRetries) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email,
            full_name: fullName,
            role,
            grade_level: gradeLevel || null,
          });

        if (!profileError) {
          profileCreated = true;
          console.log('Profile created successfully');
        } else if (profileError.code === '23505') {
          // Duplicate key - profile already exists
          console.log('Profile already exists');
          profileCreated = true;
        } else {
          console.warn(`Profile creation attempt ${retries + 1} failed:`, profileError.message);
          retries++;
          if (retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            console.error('Profile creation error:', {
              message: profileError.message,
              code: profileError.code,
              details: profileError.details,
              hint: profileError.hint,
            });
            throw new Error(`Error al crear perfil: ${profileError.message}`);
          }
        }
      }

      // Check if email confirmation is required
      if (data.session === null) {
        alert('Por favor verifica tu correo electrónico para completar el registro.');
        setIsSigningUp(false);
        router.push('/login');
      } else {
        // Wait a bit more before signing in to ensure profile is fully committed
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setIsSigningUp(false); // NEW: End signup state before sign in
        
        // Auto sign-in if no confirmation needed
        console.log('Auto-signing in...');
        await signIn(email, password);
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message);
      setIsSigningUp(false); // NEW: Reset on error
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setProfile(null);
      setUser(null);
      setSession(null);
      setError(null);
      
      router.push('/');
    } catch (error: any) {
      console.error('Sign out error:', error);
      setError(error.message);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        error,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}