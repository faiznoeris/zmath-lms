import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { User } from "@supabase/supabase-js";

export interface IuseAuthStore {
  user: User | null;
  isLoggedIn: boolean;
  setUser: (userObj: User | null) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

// Helper to get the appropriate storage based on 'remember me' preference
const getStorage = () => {
  if (typeof window === "undefined") return sessionStorage;
  
  try {
    const rememberMe = localStorage.getItem("zmath-remember-me");
    return rememberMe === "true" ? localStorage : sessionStorage;
  } catch {
    return sessionStorage;
  }
};

export const useAuthStore = create<IuseAuthStore>()(
  persist(
    devtools(set => ({
      user: null,
      isLoggedIn: false,
      setUser: userObj => set(state => ({ user: (state.user = userObj) })),
      setIsLoggedIn: isLoggedIn => set({ isLoggedIn }),
    })),
    {
      name: "zmath-auth",
      storage: createJSONStorage(() => getStorage()), 
    },
  )
);
