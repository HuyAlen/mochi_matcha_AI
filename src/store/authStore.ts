"use client";

import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase/client";

type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  initAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,

  initAuth: async () => {
    if (get().initialized) return;

    const { data, error } = await supabase.auth.getSession();

    set({
      session: error ? null : data.session,
      user: error ? null : (data.session?.user ?? null),
      loading: false,
      initialized: true,
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        user: session?.user ?? null,
        loading: false,
        initialized: true,
      });
    });
  },

  login: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  },

  register: async (email, password) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
  },

  logout: async () => {
    set({
      user: null,
      session: null,
      loading: false,
      initialized: true,
    });

    const { error } = await supabase.auth.signOut({ scope: "local" });

    if (error) throw error;
  },
}));
