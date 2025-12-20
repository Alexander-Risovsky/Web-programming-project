import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL, buildMediaUrl } from "../config";
import { dedupFetch } from "../utils/dedupFetch";

export default function LeftSidebar({
  currentPath,
  mobileMenuOpen,
  setMobileMenuOpen,
}) {
  const location = useLocation();
  const { user, isOrg, authFetch } = useAuth();

  const [orgInfo, setOrgInfo] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [subsVersion, setSubsVersion] = useState(0);
  const [subsLoading, setSubsLoading] = useState(false);
  const [subsStatus, setSubsStatus] = useState("loading"); // loading | refreshing | null

  // закрываем меню при смене маршрута
  useEffect(() => {
    if (mobileMenuOpen) setMobileMenuOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleLinkClick = () => {
    if (setMobileMenuOpen) setMobileMenuOpen(false);
  };

  // загрузка инфо организации
  useEffect(() => {
    const loadOrg = async () => {
      if (user?.role !== "org") {
        setOrgInfo(null);
        return;
      }
      const clubId = user?.orgId || user?.id;
      if (!clubId) return;
      try {
        const res = await dedupFetch(`${API_BASE_URL}/api/clubs/${clubId}/`);
        if (!res.ok) return;
        const data = await res.json();
        setOrgInfo(data);
      } catch {
        setOrgInfo(null);
      }
    };
    loadOrg();
  }, [user?.role, user?.orgId, user?.id]);

  // загрузка клубов
  useEffect(() => {
    const loadClubs = async () => {
      try {
        const res = await dedupFetch(`${API_BASE_URL}/api/clubs/`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setClubs(Array.isArray(data) ? data : []);
      } catch {
        setClubs([]);
      }
    };
    loadClubs();
  }, []);

  // слушаем событие обновления подписок
  useEffect(() => {
    const handler = () => setSubsVersion((v) => v + 1);
    window.addEventListener("subscriptions-updated", handler);
    return () => window.removeEventListener("subscriptions-updated", handler);
  }, []);

  // загрузка подписок студента
  useEffect(() => {
    const loadSubs = async () => {
      if (user?.role !== "student") {
        setSubscriptions([]);
        setSubsStatus(null);
        return;
      }
      const status = subsVersion > 0 ? "refreshing" : "loading";
      setSubsStatus(status);
      setSubsLoading(true);
      try {
        const res = await authFetch(`${API_BASE_URL}/api/subscriptions/`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setSubscriptions(Array.isArray(data) ? data : []);
        setSubsStatus(null);
      } catch {
        setSubscriptions([]);
        setSubsStatus(null);
      } finally {
        setSubsLoading(false);
      }
    };
    loadSubs();
  }, [user?.role, user?.access, subsVersion, authFetch]);

  const orgName =
    user?.role === "org"
      ? orgInfo?.name || user?.orgName || user?.username || "Организация"
      : null;

  const sections = [{ id: "home", name: "Главная", to: "/" }];

  const getIcon = (id, active) => {
    const cls = `w-7 h-7 ${
      active ? "text-white" : "text-slate-600 group-hover:text-primary"
    }`;
    switch (id) {
      case "home":
        return (
          <svg
            className={cls}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9.75L12 4l9 5.75V20a1 1 0 01-1 1h-5.5a.5.5 0 01-.5-.5V15a2 2 0 00-4 0v5.5a.5.5 0 01-.5.5H4a1 1 0 01-1-1V9.75z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const followedOrgIds =
    user?.role === "student" ? subscriptions.map((s) => s.club) : [];
  const followedOrgs =
    user?.role === "student"
      ? clubs.filter((o) => followedOrgIds.includes(o.id))
      : [];

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen w-64 bg-white/95 backdrop-blur-sm border-r-2 border-slate-200 shadow-xl z-50
        flex flex-col transition-transform duration-300 ease-in-out
        lg:fixed lg:h-screen lg:translate-x-0 lg:z-auto
        ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }
      `}
    >
      <div className="absolute top-0 left-0 w-full h-32 pointer-events-none bg-gradient-to-b from-primary/5 to-transparent" />

      <div className="flex-1 p-4 overflow-y-auto lg:p-6">
        <Link
          to="/welcome"
          onClick={handleLinkClick}
          className="relative z-10 block group"
        >
          <div className="flex items-center px-1 py-1 pb-2 mb-4 space-x-3 rounded-lg border-slate-200">
            <div className="relative">
              <img
                src="/Logo.svg"
                alt="Логотип"
                className="relative z-10 w-10 h-10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
              />
              <div className="absolute inset-0 transition-opacity duration-300 rounded-full opacity-0 bg-primary/20 blur-md group-hover:opacity-100" />
            </div>
            <div className="text-lg font-black text-transparent transition-all duration-300 lg:text-xl bg-gradient-to-r from-slate-800 via-primary to-purple-600 bg-clip-text group-hover:scale-105">
              HSE Flow
            </div>
          </div>
        </Link>

        <div className="mt-3">
          <h3 className="mb-2 text-sm font-semibold tracking-wider uppercase text-slate-600">
            Меню
          </h3>
          <ul className="space-y-2">
            {sections.map((section, index) => {
              const isActive = location.pathname === section.to;
              return (
                <li
                  key={section.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <NavLink
                    to={section.to}
                    onClick={handleLinkClick}
                    className={`
                      flex items-center px-2 lg:px-3 py-1.5 lg:py-2 text-sm lg:text-base font-medium rounded-xl
                      transition-all duration-300 ease-in-out group relative overflow-hidden
                      ${
                        isActive
                          ? "bg-gradient-to-r from-primary via-purple-600 to-indigo-600 text-white shadow-md shadow-primary/30 scale-105 font-semibold"
                          : "bg-white text-slate-700 border-2 border-slate-200 hover:border-primary/50 hover:bg-slate-50 hover:shadow-md hover:scale-[1.02]"
                      }
                    `}
                  >
                    <div
                      className={`
                        flex items-center justify-center mr-3 rounded-lg p-0 relative transition-all duration-300
                        ${
                          isActive
                            ? "bg-white/20 shadow-lg"
                            : "bg-slate-100 group-hover:bg-gradient-to-br group-hover:from-primary/10 group-hover:to-purple-500/10"
                        }
                      `}
                    >
                      <div
                        className={`
                          absolute inset-0 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm ${
                            isActive ? "opacity-100" : ""
                          }`}
                      />
                      <div
                        className={`transition-all duration-300 relative z-10 ${
                          isActive
                            ? "scale-110"
                            : "group-hover:scale-110 group-hover:rotate-3"
                        }`}
                      >
                        {getIcon(section.id, isActive)}
                      </div>
                    </div>
                    <span className="flex-1 transition-all duration-300">
                      {section.name}
                    </span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>

        {!isOrg && (
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-semibold tracking-wider uppercase text-slate-600">
              Подписки
            </h3>
            {subsStatus && (
              <div className="mb-2 text-xs text-slate-500">
                {subsStatus === "loading"
                  ? "Загрузка подписок..."
                  : "Обновление подписок..."}
              </div>
            )}
            <ul className="space-y-2">
              {followedOrgs.map((org, index) => {
                const to = `/organization/${org.id}`;
                const isActive = location.pathname === to;
                return (
                  <li
                    key={org.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <NavLink
                      to={to}
                      onClick={handleLinkClick}
                      className={`
                        flex items-center px-2 lg:px-3 py-1.5 lg:py-2 text-sm lg:text-base font-medium rounded-xl
                        transition-all duration-300 ease-in-out group relative overflow-hidden
                        ${
                          isActive
                            ? "bg-gradient-to-r from-primary via-purple-600 to-indigo-600 text-white shadow-md shadow-primary/30 scale-105 font-semibold"
                            : "bg-white text-slate-700 border-2 border-slate-200 hover:border-primary/50 hover:bg-slate-50 hover:shadow-md hover:scale-[1.02]"
                        }
                      `}
                    >
                      <div
                        className={`
                          flex items-center justify-center mr-3 rounded-full p-0 relative transition-all duration-300
                          ${
                            isActive
                              ? "bg-white/20 shadow-lg"
                              : "bg-slate-100 group-hover:bg-gradient-to-br group-hover:from-primary/10 group-hover:to-purple-500/10"
                          }
                        `}
                      >
                        <div
                          className={`
                            absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm ${
                              isActive ? "opacity-100" : ""
                            }`}
                        />
                        <img
                          src={
                            buildMediaUrl(org.avatar_url) ||
                            "/OrganizationLogo/DefaultLogo.jpg"
                          }
                          alt={org.name}
                          className="relative z-10 object-cover rounded-full w-7 h-7"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/OrganizationLogo/DefaultLogo.jpg";
                          }}
                        />
                      </div>
                      <span className="flex-1 truncate transition-all duration-300">
                        {org.name}
                      </span>
                    </NavLink>
                  </li>
                );
              })}
              {!subsLoading && followedOrgs.length === 0 && (
                <li className="text-sm text-slate-500">Нет подписок</li>
              )}
            </ul>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 p-3 pt-3 border-t-2 lg:p-5 border-slate-200 bg-white/95 backdrop-blur-sm">
        <NavLink
          to="/profile"
          onClick={handleLinkClick}
          className="flex items-center p-2.5 transition-all duration-300 border-2 border-transparent rounded-xl bg-slate-50 group animate-scale-in hover:border-primary/40 hover:shadow-md hover:scale-[1.01]"
        >
          <div className="relative flex-shrink-0">
            <div className="flex items-center justify-center overflow-hidden transition-all duration-300 rounded-full w-11 h-11 ring-2 ring-slate-200 group-hover:ring-primary/50 group-hover:scale-105 bg-gradient-to-br from-primary to-purple-600">
              {buildMediaUrl(user?.avatarUrl) ? (
                <img
                  src={buildMediaUrl(user?.avatarUrl)}
                  alt=""
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "";
                  }}
                />
              ) : (
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              )}
            </div>
          </div>

          <div className="flex flex-col flex-1 min-w-0 ml-2">
            <span className="text-sm font-semibold leading-tight truncate transition-colors duration-300 text-slate-800 group-hover:text-primary">
              {isOrg
                ? orgName
                : `${user?.name || ""} ${user?.surname || ""}`.trim() ||
                  user?.username ||
                  "Пользователь"}
            </span>
            <span className="text-xs leading-tight truncate text-slate-500">
              {isOrg ? "Организация" : "Студент"}
            </span>
          </div>
        </NavLink>
      </div>
    </aside>
  );
}
