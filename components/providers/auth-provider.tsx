"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createClient } from "@/utils/supabase/client";
import { Session, User } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  profile_image?: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  error: null,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching user profile:", error);
        setError("Failed to load user profile");
        return null;
      }

      return data;
    } catch (err) {
      console.error("Error in fetchProfile:", err);
      return null;
    }
  }

  async function refreshProfile() {
    if (!user) return;
    
    setIsLoading(true);
    const profileData = await fetchProfile(user.id);
    
    if (profileData) {
      setProfile({
        id: user.id,
        ...profileData,
      });
    } else {
      // If no profile exists yet, just use basic user info
      setProfile({
        id: user.id,
        email: user.email,
      });
    }
    setIsLoading(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
  }

  useEffect(() => {
    async function loadSession() {
      setIsLoading(true);
      setError(null);

      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        setSession(session);
        
        if (session?.user) {
          setUser(session.user);
          const profileData = await fetchProfile(session.user.id);
          
          if (profileData) {
            setProfile({
              id: session.user.id,
              ...profileData,
            });
          } else {
            // If no profile exists yet, just use basic user info
            setProfile({
              id: session.user.id,
              email: session.user.email,
            });
          }
        }
      } catch (err) {
        console.error("Auth provider error:", err);
        setError("Authentication error");
      } finally {
        setIsLoading(false);
      }
    }

    loadSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          const profileData = await fetchProfile(session.user.id);
          
          if (profileData) {
            setProfile({
              id: session.user.id,
              ...profileData,
            });
          } else {
            // If no profile exists yet, just use basic user info
            setProfile({
              id: session.user.id,
              email: session.user.email,
            });
          }
        } else {
          setProfile(null);
        }
      }
    );

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const value = {
    session,
    user,
    profile,
    isLoading,
    error,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
