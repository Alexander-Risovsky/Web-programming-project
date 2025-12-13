import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {API_BASE_URL, buildMediaUrl} from "../config"
const events = [
  {
    id: 1,
    title: "Встреча клуба Strike",
    org: "Strike Club",
    date: "30 декабря 2025",
    time: "18:00",
    img: "/OrganizationLogo/StrikeClubMeeting.jpg",
  },
  {
    id: 2,
    title: "HSE Face",
    org: "HSE Crew",
    date: "28 января 2026",
    time: "18:30",
    img: "/OrganizationLogo/hseface logo.jpg",
  },
];

export default function RightSidebar() {
  const { user } = useAuth();
  const isOrg = user?.role === "org";
  const isStudent = user?.role === "student";
  const [clubs, setClubs] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [subsVersion, setSubsVersion] = useState(0);
  const [loadingSub, setLoadingSub] = useState(false);

  useEffect(() => {
    const loadClubs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/clubs/`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setClubs(Array.isArray(data) ? data : []);
      } catch {
        setClubs([]);
      }
    };
    loadClubs();
  }, []);

  useEffect(() => {
    const loadSubs = async () => {
      if (!isStudent || !user?.id) {
        setSubscriptions([]);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/subscriptions/`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        const subs = Array.isArray(data)
          ? data.filter((s) => s.user === user.id)
          : [];
        setSubscriptions(subs);
      } catch {
        setSubscriptions([]);
      }
    };
    loadSubs();
  }, [isStudent, user, subsVersion]);

  useEffect(() => {
    const handler = () => setSubsVersion((v) => v + 1);
    window.addEventListener("subscriptions-updated", handler);
    return () => window.removeEventListener("subscriptions-updated", handler);
  }, []);

  const subscribedIds = subscriptions.map((s) => s.club);
  const recommendations = clubs.filter(
    (c) => !subscribedIds.includes(c.id)
  );

  const handleSubscribe = async (clubId) => {
    if (!isStudent || !user?.id || loadingSub) return;
    setLoadingSub(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/subscriptions/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: user.id, club: clubId }),
      });
      let data = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }
      if (!res.ok) throw new Error(data?.detail || "Ошибка подписки");

      const newSub =
        data && data.id
          ? data
          : { id: Date.now(), user: user.id, club: clubId };
      setSubscriptions((prev) => [...prev, newSub]);
      window.dispatchEvent(new Event("subscriptions-updated"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSub(false);
    }
  };

  return (
    <aside className="h-full space-y-5">
      <div className="p-4 glass-card">
        <h3 className="mb-3 font-semibold text-slate-800">
          {isOrg
            ? "Ближайшие мероприятия организации"
            : "Ближайшие мероприятия"}
        </h3>
        <div className="flex flex-col gap-3">
          {events.map((event, idx) => (
            <div
              key={event.id}
              className="overflow-hidden border shadow-sm bg-white/90 rounded-xl border-slate-200 animate-slide-up"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <img
                src={event.img}
                alt={event.title}
                className="object-cover w-full h-28"
              />
              <div className="p-3">
                <h4 className="text-sm font-semibold text-slate-800">
                  {event.title}
                </h4>
                <p className="text-xs text-slate-500">{event.org}</p>
                <p className="mt-1 text-xs text-slate-600">
                  {event.date}, {event.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 glass-card">
        <h3 className="mb-3 font-semibold text-slate-800">
          Другие организации
        </h3>
        <div className="flex flex-col gap-2">
          {recommendations.map((org, idx) => (
            <div
              key={org.id || idx}
              className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-sm hover:shadow-md transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${idx * 70}ms` }}
            >
              <a
                href={`/organization/${org.id}`}
                className="flex items-center gap-3 flex-1"
              >
                <img
                  src={buildMediaUrl(org.avatar_url) || "/OrganizationLogo/DefaultLogo.jpg"}
                  alt={org.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/OrganizationLogo/DefaultLogo.jpg";
                  }}
                  className="object-cover rounded-full w-9 h-9"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-800">
                    {org.name}
                  </span>
                  {org.description && (
                    <span className="text-xs text-slate-500 truncate max-w-[180px]">
                      {org.description}
                    </span>
                  )}
                </div>
              </a>
              <button
                onClick={() => handleSubscribe(org.id)}
                disabled={!isStudent || loadingSub}
                className="flex items-center justify-center w-8 h-8 transition-all duration-300 border shadow-sm rounded-xl border-primary/30 bg-primary/10 text-primary hover:bg-primary hover:text-white hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                title={isStudent ? "Подписаться" : "Только для студентов"}
              >
                <svg
                  className="w-5 h-5"
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
              </button>
            </div>
          ))}
          {!recommendations.length && (
            <p className="text-sm text-slate-500">Нет организаций</p>
          )}
        </div>
      </div>
    </aside>
  );
}
