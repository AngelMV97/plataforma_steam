import { supabase } from './supabase';

export async function debugAuth() {
  console.log('=== AUTH DEBUG ===');
  
  // Check session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  console.log('Session:', session);
  console.log('Session Error:', sessionError);
  
  if (session) {
    console.log('User ID:', session.user.id);
    console.log('User Email:', session.user.email);
    
    // Try to fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    console.log('Profile Data:', profile);
    console.log('Profile Error:', profileError);
    
    if (profileError) {
      console.log('Profile Error Details:', {
        message: profileError.message,
        code: profileError.code,
        details: profileError.details,
        hint: profileError.hint,
      });
    }
  }
  
  console.log('=== END DEBUG ===');
}

export async function clearAuthData() {
  await supabase.auth.signOut();
  localStorage.clear();
  sessionStorage.clear();
  console.log('Auth data cleared. Please refresh the page.');
}