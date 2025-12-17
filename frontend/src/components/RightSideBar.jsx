import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL, buildMediaUrl } from "../config";
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
  const [clubsLoading, setClubsLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [subsVersion, setSubsVersion] = useState(0);
  const [loadingSub, setLoadingSub] = useState(false);
  const [orgEvents, setOrgEvents] = useState([]);
  const [orgEventsLoading, setOrgEventsLoading] = useState(false);
  const [studentEvents, setStudentEvents] = useState([]);
  const [studentEventsLoading, setStudentEventsLoading] = useState(false);

  useEffect(() => {
    const loadClubs = async () => {
      setClubsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/clubs/`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setClubs(Array.isArray(data) ? data : []);
      } catch {
        setClubs([]);
      } finally {
        setClubsLoading(false);
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

  useEffect(() => {
    const loadStudentEvents = async () => {
      if (!isStudent || !user?.id) {
        setStudentEvents([]);
        return;
      }
      setStudentEventsLoading(true);
      try {
        const baseHeaders = {
          ...(user?.access ? { Authorization: `Bearer ${user.access}` } : {}),
        };
        const subsRes = await fetch(
          `${API_BASE_URL}/api/registration-submissions/`,
          { headers: baseHeaders, credentials: "include" }
        );
        const submissions = await subsRes.json().catch(() => []);
        const userSubs = Array.isArray(submissions)
          ? submissions.filter((s) => s.user === user.id)
          : [];
        if (userSubs.length === 0) {
          setStudentEvents([]);
          return;
        }

        const formsRes = await fetch(`${API_BASE_URL}/api/registration-forms/`, {
          headers: baseHeaders,
          credentials: "include",
        });
        const forms = await formsRes.json().catch(() => []);
        const formIdSet = new Set(userSubs.map((s) => s.form));
        const postIds =
          Array.isArray(forms) && forms.length > 0
            ? forms
                .filter((f) => formIdSet.has(f.id) && f.post)
                .map((f) => f.post)
            : [];
        if (postIds.length === 0) {
          setStudentEvents([]);
          return;
        }

        const postsRes = await fetch(`${API_BASE_URL}/api/posts/`, {
          headers: baseHeaders,
          credentials: "include",
        });
        const postsData = await postsRes.json().catch(() => []);
        const filtered =
          Array.isArray(postsData) && postsData.length > 0
            ? postsData
                .filter((p) => postIds.includes(p.id))
                .sort(
                  (a, b) =>
                    new Date(b.published_at || b.date || 0) -
                    new Date(a.published_at || a.date || 0)
                )
                .slice(0, 2)
            : [];
        setStudentEvents(filtered);
      } catch {
        setStudentEvents([]);
      } finally {
        setStudentEventsLoading(false);
      }
    };
    loadStudentEvents();
  }, [isStudent, user]);

  useEffect(() => {
    const loadOrgEvents = async () => {
      if (!isOrg || !(user?.orgId || user?.id)) {
        setOrgEvents([]);
        return;
      }
      setOrgEventsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/posts/`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        const filtered = Array.isArray(data)
          ? data
              .filter(
                (p) =>
                  (p.club === (user.orgId || user.id)) &&
                  (p.type === "event" || p.is_form)
              )
              .sort(
                (a, b) =>
                  new Date(b.published_at || b.date || 0) -
                  new Date(a.published_at || a.date || 0)
              )
              .slice(0, 2)
          : [];
        setOrgEvents(filtered);
      } catch {
        setOrgEvents([]);
      } finally {
        setOrgEventsLoading(false);
      }
    };
    loadOrgEvents();
  }, [isOrg, user]);

  const subscribedIds = subscriptions.map((s) => s.club);
  const recommendations = clubs.filter((c) => !subscribedIds.includes(c.id));

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
          {isOrg ? (
            orgEventsLoading ? (
              <p className="text-sm text-slate-600">Загрузка мероприятий...</p>
            ) : orgEvents.length === 0 ? (
              <p className="text-sm text-slate-600">
                Пока нет мероприятий у организации.
              </p>
            ) : (
              orgEvents.map((event, idx) => {
                const orgId = event.club || user?.orgId || user?.id;
                return (
                  <a
                    key={event.id}
                    href={orgId ? `/organization/${orgId}` : "#"}
                    className="overflow-hidden border shadow-sm bg-white/90 rounded-xl border-slate-200 animate-slide-up hover:shadow-md transition"
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    {event.image_url && (
                      <img
                        src={buildMediaUrl(event.image_url) || event.image_url}
                        alt={event.title}
                        className="object-cover w-full h-28"
                      />
                    )}
                    <div className="p-3">
                      <h4 className="text-sm font-semibold text-slate-800">
                        {event.title}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {user?.orgName || user?.name || "Организация"}
                      </p>
                    </div>
                  </a>
                );
              })
            )
          ) : isStudent ? (
            studentEventsLoading ? (
              <p className="text-sm text-slate-600">Загружаем ваши мероприятия...</p>
            ) : studentEvents.length === 0 ? (
              <p className="text-sm text-slate-600">
                Пока нет зарегистрированных мероприятий.
              </p>
            ) : (
              studentEvents.map((event, idx) => (
                <a
                  key={event.id}
                  href={event.club ? `/organization/${event.club}` : "#"}
                  className="overflow-hidden border shadow-sm bg-white/90 rounded-xl border-slate-200 animate-slide-up hover:shadow-md transition"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  {event.image_url && (
                    <img
                      src={buildMediaUrl(event.image_url) || event.image_url}
                      alt={event.title}
                      className="object-cover w-full h-28"
                    />
                  )}
                  <div className="p-3">
                    <h4 className="text-sm font-semibold text-slate-800">
                      {event.title}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {clubs.find((c) => c.id === event.club)?.name || "Организация"}
                    </p>
                  </div>
                </a>
              ))
            )
          ) : (
            events.map((event, idx) => (
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
            ))
          )}
        </div>
      </div>

      <div className="p-4 glass-card">
        <h3 className="mb-3 font-semibold text-slate-800">
          Другие организации
        </h3>
        <div className="flex flex-col gap-2">
          {clubsLoading ? (
            <p className="text-sm text-slate-500">Загрузка организаций...</p>
          ) : (
            <>
              {recommendations.map((org, idx) => (
                <div
                  key={org.id || idx}
                  className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-sm hover:shadow-md transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${idx * 70}ms` }}
                >
                  <a
                    href={`/organization/${org.id}`}
                    className="flex items-center flex-1 gap-3"
                  >
                    <img
                      src={
                        buildMediaUrl(org.avatar_url) ||
                        "/OrganizationLogo/DefaultLogo.jpg"
                      }
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
                {isStudent && (
                  <button
                    onClick={() => handleSubscribe(org.id)}
                    disabled={!isStudent || loadingSub}
                    className="flex items-center justify-center w-8 h-8 transition-all duration-300 border shadow-sm rounded-xl border-primary/30 bg-primary/10 text-primary hover:bg-primary hover:text-white hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Подписаться"
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
                )}
                </div>
              ))}
              {!recommendations.length && (
                <p className="text-sm text-slate-500">Нет организаций</p>
              )}
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
