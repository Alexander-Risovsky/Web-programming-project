import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";
import { API_BASE_URL } from "../config";
import { dedupFetch } from "../utils/dedupFetch";
const AuthContext = createContext(null);

const base64UrlDecode = (value) => {
  const normalized = (value || "")
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil((value || "").length / 4) * 4, "=");
  try {
    return atob(normalized);
  } catch {
    return "";
  }
};

const getJwtExpSeconds = (token) => {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payloadJson = base64UrlDecode(parts[1]);
    const payload = JSON.parse(payloadJson);
    return typeof payload?.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
};

const getJwtUserId = (token) => {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payloadJson = base64UrlDecode(parts[1]);
    const payload = JSON.parse(payloadJson);
    return typeof payload?.user_id === "number" ? payload.user_id : null;
  } catch {
    return null;
  }
};

const isJwtExpired = (token, skewSeconds = 30) => {
  const exp = getJwtExpSeconds(token);
  if (!exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return exp <= now + skewSeconds;
};

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

  const userRef = useRef(user);
  const refreshInFlightRef = useRef(null);
  const hydratedKeyRef = useRef(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

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

  // Backfill `userId` (CustomUser id) for older sessions using JWT payload.
  useEffect(() => {
    if (!user || user.role !== "student") return;
    if (user.userId) return;
    const decoded = getJwtUserId(user.access);
    if (!decoded) return;
    setUser((prev) => (prev ? { ...prev, userId: decoded } : prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role, user?.access]);

  const refreshAccessToken = useCallback(async () => {
    const current = userRef.current;
    if (!current?.refresh) return null;

    if (refreshInFlightRef.current) return refreshInFlightRef.current;

    refreshInFlightRef.current = (async () => {
      const res = await fetch(`${API_BASE_URL}/api/auth/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ refresh: current.refresh }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.access) {
        setUser(null);
        return null;
      }

      setUser((prev) => (prev ? { ...prev, access: data.access } : prev));
      return data.access;
    })().finally(() => {
      refreshInFlightRef.current = null;
    });

    return refreshInFlightRef.current;
  }, []);

  const ensureValidAccessToken = useCallback(async ({ forceRefresh = false } = {}) => {
    const current = userRef.current;
    const access = current?.access;
    if (!current) return null;

    if (!forceRefresh && access && !isJwtExpired(access)) return access;
    return await refreshAccessToken();
  }, [refreshAccessToken]);

  const authFetch = useCallback(async (url, options = {}) => {
    const opts = { ...options };
    const headers = new Headers(opts.headers || {});

    const access = await ensureValidAccessToken();
    if (access) headers.set("Authorization", `Bearer ${access}`);

    opts.headers = headers;

    const method = (opts.method || "GET").toUpperCase();
    let res = method === "GET" ? await dedupFetch(url, opts) : await fetch(url, opts);

    if (res.status === 401 && userRef.current?.refresh) {
      const cloned = res.clone();
      const data = await cloned.json().catch(() => null);
      if (data?.code === "token_not_valid") {
        const refreshed = await ensureValidAccessToken({ forceRefresh: true });
        if (refreshed) {
          const retryHeaders = new Headers(opts.headers || {});
          retryHeaders.set("Authorization", `Bearer ${refreshed}`);
          res =
            method === "GET"
              ? await dedupFetch(url, { ...opts, headers: retryHeaders })
              : await fetch(url, { ...opts, headers: retryHeaders });
        }
      }
    }

    return res;
  }, [ensureValidAccessToken]);

  useEffect(() => {
    const current = userRef.current;
    if (!current?.role) return;

    const key = JSON.stringify([
      current.role,
      current.id || null,
      current.orgId || null,
      current.refresh || null,
    ]);
    if (hydratedKeyRef.current === key) return;
    hydratedKeyRef.current = key;

    const hydrate = async () => {
      try {
        if (current.role === "student" && current.id) {
          const res = await authFetch(`${API_BASE_URL}/api/students/${current.id}/`, {
            credentials: "include",
          });
          const data = await res.json().catch(() => null);
          if (!res.ok || !data) return;

          setUser((prev) => {
            if (!prev || prev.role !== "student") return prev;
            const next = {
              name: data?.name ?? prev.name,
              surname: data?.surname ?? prev.surname,
              course: data?.course ?? prev.course,
              group: data?.group ?? prev.group,
              major: data?.major ?? prev.major,
              avatarUrl: data?.avatar_url ?? prev.avatarUrl,
            };
            const changed = Object.keys(next).some((k) => next[k] !== prev[k]);
            return changed ? { ...prev, ...next } : prev;
          });
        }

        if (current.role === "org" && (current.orgId || current.id)) {
          if (
            current.orgName &&
            Object.prototype.hasOwnProperty.call(current, "description") &&
            Object.prototype.hasOwnProperty.call(current, "avatarUrl")
          ) {
            return;
          }
          const clubId = current.orgId || current.id;
          const res = await dedupFetch(`${API_BASE_URL}/api/clubs/${clubId}/`);
          const data = await res.json().catch(() => null);
          if (!res.ok || !data) return;

          setUser((prev) => {
            if (!prev || prev.role !== "org") return prev;
            const next = {
              orgName: data?.name ?? prev.orgName,
              description: data?.description ?? prev.description,
              avatarUrl: data?.avatar_url ?? prev.avatarUrl,
            };
            const changed = Object.keys(next).some((k) => next[k] !== prev[k]);
            return changed ? { ...prev, ...next } : prev;
          });
        }
      } catch {
        // ignore
      }
    };

    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.orgId, user?.role, user?.refresh]);

  const loginStudent = useCallback(async (username, password) => {
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
        console.log(data);
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
      // console.log("Logged in student:", userData, data);

      setUser({
        id: userData.id,
        userId: userData.user_id ?? getJwtUserId(data?.access),
        username: userData.user_username,
        name: userData.name,
        surname: userData.surname,
        course: userData.course,
        group: userData.group,
        major: userData.major,
        email: userData.user_email,
        avatarUrl: userData.avatar_url,
        role: "student",
        orgId: null,
        // studentProfile: userData.student_profile,
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
  }, []);

  const loginOrg = useCallback(async ({ username, password }) => {
    try {
      const payload = {
        username: (username || "").trim(),
        password: password || "",
      };

      const res = await fetch(`${API_BASE_URL}/api/auth/login-club/`, {
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

      const orgData = data?.club || data || {};
      console.log("orgData: ");
      console.log(orgData);

      setUser({
        id: orgData.id,
        username: orgData.username,
        name: orgData.name,
        email: orgData.email,
        description: orgData.description,
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
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      isOrg: user?.role === "org",
      isStudent: user?.role === "student",
      loginStudent,
      loginOrg,
      logout,
      authFetch,
    }),
    [user, loginStudent, loginOrg, logout, authFetch]
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
