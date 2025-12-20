import React, { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import LeftSidebar from "./LeftSideBar";
import RightSidebar from "./RightSideBar";
import { buildMediaUrl, API_BASE_URL } from "../config";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const { user, isOrg, logout, authFetch } = useAuth();
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = async () => {
    if (!user?.access) {
      setNotifications([]);
      return;
    }
    try {
      const res = await authFetch(`${API_BASE_URL}/api/notifications/`, {
        credentials: "include",
      });
      const data = await res.json().catch(() => []);
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.access]);

  useEffect(() => {
    if (notifOpen) loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifOpen]);

  const markNotificationRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_new: false } : n))
    );
    try {
      await authFetch(`${API_BASE_URL}/api/notifications/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_new: false }),
        credentials: "include",
      });
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex min-h-screen text-slate-900 bg-slate-50">
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 transition-opacity duration-300 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <LeftSidebar
        currentPath={location.pathname}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className="relative flex flex-col flex-1 lg:ml-64">
        {/* Градиентный фон единый для header и контента */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-tl from-[rgba(98,90,228,0.15)] via-[rgba(139,92,246,0.1)] to-[rgba(255,255,255,1)] animate-gradient" />
          <div className="absolute hidden bg-purple-300 rounded-full pointer-events-none lg:block top-20 right-20 w-72 h-72 mix-blend-multiply filter blur-xl opacity-20 animate-float" />
          <div
            className="absolute hidden bg-blue-300 rounded-full pointer-events-none lg:block bottom-20 left-20 w-96 h-96 mix-blend-multiply filter blur-xl opacity-20 animate-float"
            style={{ animationDelay: "2s" }}
          />
          <div
            className="absolute hidden bg-indigo-300 rounded-full pointer-events-none lg:block top-1/2 left-1/2 w-80 h-80 mix-blend-multiply filter blur-xl opacity-10 animate-float"
            style={{ animationDelay: "4s" }}
          />
        </div>

        <header className="relative z-20 flex items-center justify-between h-16 p-4 mb-0 bg-transparent border-b border-slate-200/30">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="relative z-10 flex items-center justify-center w-10 h-10 transition-all duration-300 bg-white border-2 rounded-lg shadow-md lg:hidden hover:bg-slate-100 border-slate-200"
            aria-label="Открыть меню"
          >
            <svg
              className={`w-6 h-6 text-slate-700 transition-transform duration-300 ${
                mobileMenuOpen ? "rotate-90" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          <div className="relative z-10 flex items-center justify-end w-full gap-3 lg:gap-4">
            {isOrg && (
              <Link
                to="/admin/post"
                className="relative flex items-center justify-center px-3 h-10 lg:h-12 text-sm font-semibold text-white bg-gradient-to-r from-primary via-purple-600 to-indigo-600 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
                title="Создать пост"
              >
                <span className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 lg:w-5 lg:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span className="hidden sm:inline">Создать пост</span>
                  <span className="sm:hidden">Пост</span>
                </span>
              </Link>
            )}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="relative flex items-center justify-center w-10 h-10 overflow-hidden transition-all bg-white border-2 rounded-full shadow-md lg:w-12 lg:h-12 border-slate-200 hover:bg-slate-100 hover:border-primary group hover:shadow-lg"
                title="Уведомления"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/10 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />

                <img
                  src="/NotificationIcon.svg"
                  alt="Уведомления"
                  className="relative z-10 w-3 h-3 transition-transform duration-300 lg:w-5 lg:h-5 group-hover:scale-110 group-hover:rotate-12"
                />
                {notifications.some((n) => n.is_new) && (
                  <span className="absolute w-3 h-3 bg-red-500 border-2 border-white rounded-full top-1 right-1" />
                )}
              </button>

              {notifOpen && (
                <div className="fixed right-4 top-16 z-[100000] overflow-hidden bg-white border shadow-xl w-72 border-slate-200 rounded-2xl animate-slide-up">
                  <div className="flex items-center justify-between p-3 border-b border-slate-200">
                    <span className="text-sm font-semibold text-slate-800">
                      Уведомления
                    </span>
                    <span className="text-xs text-slate-500">
                      Новых: {notifications.filter((n) => n.is_new).length}
                    </span>
                  </div>
                  <div className="overflow-y-auto max-h-80">
                    {notifications.map((notif) => {
                      return (
                        <Link
                          to={`/organization/${notif.club}`}
                          key={notif.id}
                          onClick={() => {
                            markNotificationRead(notif.id);
                            setNotifOpen(false);
                          }}
                          className={`flex items-center gap-3 px-3 py-3 border-b last:border-0 transition-colors ${
                            notif.is_new
                              ? "bg-primary/10 hover:bg-primary/20"
                              : "bg-white hover:bg-slate-50"
                          }`}
                        >
                          <img
                            src={buildMediaUrl(notif.club_avatar_url) || "/OrganizationLogo/DefaultLogo.jpg"}
                            alt={notif.club_name || "Организация"}
                            className="object-cover w-10 h-10 border rounded-xl border-slate-200"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate text-slate-800">
                              {notif.club_name || "Организация"}
                            </p>
                            <p className="text-xs truncate text-slate-600">
                              {notif.text || notif.post_title || "Новый пост"}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/profile"
              className="relative flex items-center justify-center w-10 h-10 overflow-hidden transition-all bg-white border-2 rounded-full shadow-md lg:w-12 lg:h-12 hover:bg-slate-100 border-slate-200 hover:border-primary group hover:shadow-lg"
              title="Профиль"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/10 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
              <img
                src="/SettingsIcon.svg"
                alt="Профиль"
                className="relative z-10 w-3 h-3 transition-transform duration-300 lg:w-5 lg:h-5 group-hover:scale-110 group-hover:rotate-12"
              />
            </Link>

            <Link
              to="/login"
              onClick={() => logout()}
              className="relative flex items-center justify-center w-10 h-10 overflow-hidden transition-all bg-white border-2 rounded-full shadow-md lg:w-12 lg:h-12 hover:bg-red-500 border-slate-200 hover:border-red-500 group hover:shadow-lg hover:shadow-red-200"
              title="Выйти"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-400/0 via-red-400/10 to-red-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
              <img
                src="/LogoutIcon.svg"
                alt="Выйти"
                className="relative z-10 w-5 h-5 transition-all duration-300 lg:w-7 lg:h-7 group-hover:scale-110 group-hover:rotate-12 group-hover:brightness-0 group-hover:invert"
              />
            </Link>
          </div>
        </header>

        <main className="relative flex-1 overflow-y-auto">
          <div className="relative flex gap-6 px-4 py-6 lg:px-6">
            <div className="flex-1">
              <Outlet />
            </div>
            <div className="hidden xl:block w-[300px] shrink-0">
              <RightSidebar currentPath={location.pathname} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
