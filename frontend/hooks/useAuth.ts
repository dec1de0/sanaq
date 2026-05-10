"use client";
import { useState, useEffect, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import {
  supabase, isConfigured,
  getProfile, upsertProfile,
  Profile,
} from "@/lib/supabase";

export type { Profile };

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
}

export function useAuth() {
  const [user,    setUser]    = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (uid: string) => {
    const p = await getProfile(uid);
    setProfile(p);
  }, []);

  useEffect(() => {
    if (!isConfigured) { setLoading(false); return; }

    // Restore existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) loadProfile(u.id);
      setLoading(false);
    });

    // React to sign-in / sign-out
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        if (u) loadProfile(u.id); else setProfile(null);
      }
    );

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  // ── Sign up ─────────────────────────────────────────────────────────────
  const signUp = useCallback(async (
    email: string, password: string, username: string
  ) => {
    if (!isConfigured) throw new Error("Supabase not configured");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    if (error) throw error;

    // Create the profile row immediately (trigger also does this as fallback)
    if (data.user) {
      await upsertProfile(data.user.id, { username });
      await loadProfile(data.user.id);
    }
    return data.user;
  }, [loadProfile]);

  // ── Sign in ─────────────────────────────────────────────────────────────
  const signIn = useCallback(async (email: string, password: string) => {
    if (!isConfigured) throw new Error("Supabase not configured");

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  }, []);

  // ── Sign out ─────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  // ── Refresh profile from DB ───────────────────────────────────────────────
  const refreshProfile = useCallback(() => {
    if (user) loadProfile(user.id);
  }, [user, loadProfile]);

  return { user, profile, loading, signUp, signIn, signOut, refreshProfile };
}
