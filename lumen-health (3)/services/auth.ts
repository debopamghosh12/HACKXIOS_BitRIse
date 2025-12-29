import { supabase, UserProfile } from './supabase';
import { AuthError, User } from '@supabase/supabase-js';

export interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
  phoneNumber?: string;
  address?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User | null;
  error: AuthError | null;
}

/**
 * Sign up a new user with email and password
 */
export const signUp = async (data: SignUpData): Promise<AuthResponse> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          phone_number: data.phoneNumber,
          address: data.address,
        }
      }
    });

    if (authError) {
      return { user: null, error: authError };
    }

    // If sign up successful and user is confirmed, create profile
    if (authData.user) {
      // Create user profile in the patients table
      const { error: profileError } = await supabase
        .from('patients')
        .insert({
          id: authData.user.id,
          full_name: data.fullName,
          phone: data.phoneNumber,
          address: data.address,
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }
    }

    return { user: authData.user, error: null };
  } catch (error) {
    return { user: null, error: error as AuthError };
  }
};

/**
 * Sign in an existing user
 */
export const signIn = async (data: SignInData): Promise<AuthResponse> => {
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      return { user: null, error };
    }

    return { user: authData.user, error: null };
  } catch (error) {
    return { user: null, error: error as AuthError };
  }
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    return { error: error as AuthError };
  }
};

/**
 * Get the current user session
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  } catch (error) {
    return { user: null, error: error as AuthError };
  }
};

/**
 * Get user profile data
 */
export const getUserProfile = async (userId: string): Promise<{ profile: UserProfile | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', userId)
      .single();

    return { profile: data, error };
  } catch (error) {
    return { profile: null, error };
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  updates: Partial<UserProfile>
): Promise<{ error: any }> => {
  try {
    const { error } = await supabase
      .from('patients')
      .update(updates)
      .eq('id', userId);

    return { error };
  } catch (error) {
    return { error };
  }
};

/**
 * Reset password
 */
export const resetPassword = async (email: string): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  } catch (error) {
    return { error: error as AuthError };
  }
};
