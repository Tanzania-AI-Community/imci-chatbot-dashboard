import NextAuth from "next-auth";

/**
 * Authentication and context related types
 */

export interface User {
  id: string;
  username: string;
  email: string;
  role: "admin" | "editor" | "viewer";
}

export interface CustomUser {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  role: "admin" | "editor" | "viewer";
  created_at: Date;
  updated_at: Date;
  image: string | null;
  provider: string | null;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (credentials: { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
}

export interface AuthProviderProps {
  children: React.ReactNode;
  session?: User | null;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      customUser?: CustomUser;
      provider?: string;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    customUser?: CustomUser;
    provider?: string;
  }
}
