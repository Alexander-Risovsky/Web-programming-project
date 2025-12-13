import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import {API_BASE_URL} from "../config"
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // user: null | { id, username, role: "student" | "org", orgId?, email?, avatarUrl?, studentProfile? }
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("authUser");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem("authUser", JSON.stringify(user));
      } else {
        localStorage.removeItem("authUser");
      }
    } catch {
      // ignore storage errors
    }
  }, [user]);

  const loginStudent = async (username, password) => {
    try {
      const payload = {
        username: (username || "").trim(),
        password: password || "",
      };

      const res = await fetch(`${API_BASE_URL}/api/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type") || "";
      let data = null;
      if (contentType.toLowerCase().includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || "Сервер вернул ответ в неизвестном формате");
      }

      if (!res.ok) {
        throw new Error(
          data?.detail || "Не удалось войти. Проверьте логин и пароль"
        );
      }

      const userData = data?.student || data || {};
      console.log("Logged in student:", userData,data);

      setUser({
        id: userData.id,
        username: userData.username,
        email: userData.email,
        avatarUrl: userData.avatar_url,
        role: "student",
        orgId: null,
        studentProfile: userData.student_profile,
        access: data?.access,
        refresh: data?.refresh,
      });

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.message || "Не удалось войти. Попробуйте снова",
      };
    }
  };

  const loginOrg = async ({ username, password }) => {
    try {
      const payload = {
        username: (username || "").trim(),
        password: password || "",
      };

      const res = await fetch(`${API_BASE_URL}/api/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type") || "";
      const isJson = contentType.toLowerCase().includes("application/json");
      const data = isJson ? await res.json() : null;

      if (!res.ok) {
        throw new Error(
          data?.detail || "Не удалось войти. Проверьте логин и пароль"
        );
      }

      const orgData = data?.user || data || {};

      setUser({
        id: orgData.id,
        username: orgData.username,
        email: orgData.email,
        avatarUrl: orgData.avatar_url,
        role: "org",
        orgId: orgData.id,
        orgName: orgData.name, // сохраняем название организации
        access: data?.access,
        refresh: data?.refresh,
      });

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.message || "Не удалось войти. Попробуйте снова",
      };
    }
  };

  const logout = () => {
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      isOrg: user?.role === "org",
      isStudent: user?.role === "student",
      loginStudent,
      loginOrg,
      logout,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
