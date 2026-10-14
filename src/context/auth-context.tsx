import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (identifier: string, pass: string) => Promise<{ error: Error | null }>;
  signUp: (
    username: string,
    email: string,
    pass: string,
    phone?: string
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  sendResetOtp: (identifier: string) => Promise<{ email: string; error: Error | null }>;
  verifyResetOtp: (email: string, otpToken: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  validateRecovery: (
    identifier: string,
    email: string
  ) => Promise<{ valid: boolean; error: Error | null }>;
  resetPasswordDirect: (
    identifier: string,
    email: string,
    newPassword: string
  ) => Promise<{ success: boolean; error: Error | null }>;
  refreshProfile: () => Promise<void>;
  isRecoveryMode: boolean;
  setIsRecoveryMode: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  resetPassword: async () => ({ error: null }),
  sendResetOtp: async () => ({ email: '', error: null }),
  verifyResetOtp: async () => ({ error: null }),
  updatePassword: async () => ({ error: null }),
  validateRecovery: async () => ({ valid: false, error: null }),
  resetPasswordDirect: async () => ({ success: false, error: null }),
  refreshProfile: async () => {},
  isRecoveryMode: false,
  setIsRecoveryMode: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data);
      }
    } catch (e) {
      console.warn('Error fetching profile:', e);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
      }
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    const currentId = user?.id || session?.user?.id;
    if (currentId) {
      await fetchProfile(currentId);
    }
  };

  const signIn = async (identifier: string, pass: string) => {
    try {
      const cleanIdentifier = identifier.trim();
      let emailToUse = cleanIdentifier;

      // If user provided username without @, look up email via RPC
      if (!cleanIdentifier.includes('@')) {
        const { data: emailFound, error: rpcError } = await supabase.rpc(
          'get_user_email_for_recovery',
          { p_identifier: cleanIdentifier }
        );

        if (rpcError || !emailFound) {
          return {
            error: new Error(
              `No se encontró ninguna cuenta con el usuario "${cleanIdentifier}".`
            ),
          };
        }
        emailToUse = emailFound as string;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: pass,
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        await fetchProfile(data.user.id);
      }
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signUp = async (
    username: string,
    email: string,
    pass: string,
    phone?: string
  ) => {
    try {
      const cleanUsername = username.trim();
      const cleanEmail = email.trim();

      // Check if username is already taken
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .ilike('username', cleanUsername)
        .maybeSingle();

      if (existingUser) {
        return {
          error: new Error('Este nombre de usuario ya está registrado.'),
        };
      }

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: pass,
        options: {
          data: {
            username: cleanUsername,
            phone: phone?.trim() || null,
          },
        },
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        await fetchProfile(data.user.id);
      }
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    setIsRecoveryMode(false);
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const validateRecovery = async (identifier: string, email: string) => {
    try {
      const { data, error } = await supabase.rpc('validate_user_recovery', {
        p_identifier: identifier.trim(),
        p_email: email.trim(),
      });

      if (error) {
        return { valid: false, error };
      }
      return { valid: !!data, error: null };
    } catch (err: any) {
      return { valid: false, error: err };
    }
  };

  const resetPasswordDirect = async (
    identifier: string,
    email: string,
    newPassword: string
  ) => {
    try {
      const { data, error } = await supabase.rpc('reset_user_password_direct', {
        p_identifier: identifier.trim(),
        p_email: email.trim(),
        p_new_password: newPassword,
      });

      if (error) {
        return { success: false, error };
      }
      return { success: !!data, error: null };
    } catch (err: any) {
      return { success: false, error: err };
    }
  };

  const sendResetOtp = async (identifier: string) => {
    try {
      const clean = identifier.trim();

      // Check if user/email exists in Gucci Games
      const { data: registeredEmail, error: rpcError } = await supabase.rpc(
        'get_user_email_for_recovery',
        { p_identifier: clean }
      );

      if (rpcError || !registeredEmail) {
        return {
          email: '',
          error: new Error(
            'No se encontró ninguna cuenta registrada con este usuario o correo.'
          ),
        };
      }

      const emailToUse = registeredEmail as string;
      const { error } = await supabase.auth.resetPasswordForEmail(emailToUse);
      if (error) {
        return { email: emailToUse, error };
      }
      return { email: emailToUse, error: null };
    } catch (err: any) {
      return { email: '', error: err };
    }
  };

  const verifyResetOtp = async (email: string, otpToken: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otpToken.trim(),
        type: 'recovery',
      });
      if (error) {
        return { error };
      }
      setIsRecoveryMode(true);
      if (data.session) {
        setSession(data.session);
        setUser(data.user);
      }
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      if (newPassword.length < 6) {
        return {
          error: new Error('La contraseña debe tener al menos 6 caracteres.'),
        };
      }
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (!error) {
        setIsRecoveryMode(false);
      }
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        sendResetOtp,
        verifyResetOtp,
        updatePassword,
        validateRecovery,
        resetPasswordDirect,
        refreshProfile,
        isRecoveryMode,
        setIsRecoveryMode,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
