import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { User } from "@supabase/supabase-js";

export interface IuseAuthStore {
  user: User | null;
  isLoggedIn: boolean;
  setUser: (userObj: User | null) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

export const useAuthStore = create<IuseAuthStore>()(
  devtools(set => ({
    user: null,
    isLoggedIn: false,
    setUser: userObj => set(state => ({ user: (state.user = userObj) })),
    setIsLoggedIn: isLoggedIn => set({ isLoggedIn }),
  }))
);
