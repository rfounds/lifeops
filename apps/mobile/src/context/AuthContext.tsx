import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import apiClient from "../api/client";
import type { User } from "@lifeops/shared";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync("accessToken");
      if (token) {
        const response = await apiClient.get("/auth/me");
        setUser(response.data.user);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      await SecureStore.deleteItemAsync("accessToken");
      await SecureStore.deleteItemAsync("refreshToken");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    const response = await apiClient.post("/auth/login", { email, password });
    const { user: userData, accessToken, refreshToken } = response.data;

    await SecureStore.setItemAsync("accessToken", accessToken);
    await SecureStore.setItemAsync("refreshToken", refreshToken);
    setUser(userData);

    router.replace("/(tabs)");
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await apiClient.post("/auth/register", {
      name,
      email,
      password,
    });
    const { user: userData, accessToken, refreshToken } = response.data;

    await SecureStore.setItemAsync("accessToken", accessToken);
    await SecureStore.setItemAsync("refreshToken", refreshToken);
    setUser(userData);

    router.replace("/(tabs)");
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
    setUser(null);
    router.replace("/(auth)/login");
  };

  const refreshUser = async () => {
    try {
      const response = await apiClient.get("/auth/me");
      setUser(response.data.user);
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
