import React, { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // TODO: заменить на реальные данные после интеграции с API
  const [user, setUser] = useState({
    id: 1,
    username: "Студент",
    role: "student", // "student" | "org"
    orgId: null,
  });

  const loginStudent = async (username, password) => {
    try {
      const res = await fetch("/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const contentType = res.headers.get("content-type") || "";
      let data = null;
      if (contentType.toLowerCase().includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || "Некорректный ответ сервера");
      }

      if (!res.ok) {
        throw new Error(data?.detail || "Неверный логин или пароль");
      }

      setUser({
        id: data.id,
        username: data.username,
        email: data.email,
        avatarUrl: data.avatar_url,
        role: "student",
        orgId: null,
        studentProfile: data.student_profile,
      });

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || "Ошибка авторизации" };
    }
  };

  const loginOrg = async ({ login, orgId }) => {
    // мок: заменить валидацией на сервере
    setUser({
      id: orgId || 100,
      username: login || "Организация",
      role: "org",
      orgId: orgId || 100,
    });
    return { success: true };
  };

  const logout = () => {
    setUser({
      id: null,
      username: "",
      role: "guest",
      orgId: null,
    });
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
