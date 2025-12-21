import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL, buildMediaUrl } from "../config";
import { dedupFetch } from "../utils/dedupFetch";
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
  const { user, authFetch } = useAuth();
  const isOrg = user?.role === "org";
  const isStudent = user?.role === "student";
  const [clubs, setClubs] = useState([]);
  const [clubsLoading, setClubsLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [subsVersion, setSubsVersion] = useState(0);
  const [registrationsVersion, setRegistrationsVersion] = useState(0);
  const [loadingSub, setLoadingSub] = useState(false);
  const [orgEvents, setOrgEvents] = useState([]);
  const [orgEventsLoading, setOrgEventsLoading] = useState(false);
  const [studentEvents, setStudentEvents] = useState([]);
  const [studentEventsLoading, setStudentEventsLoading] = useState(false);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const loadClubs = async () => {
      setClubsLoading(true);
      try {
        const res = await dedupFetch(`${API_BASE_URL}/api/clubs/`);
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
      if (!isStudent || !user?.access) {
        setSubscriptions([]);
        return;
      }
      try {
        const res = await authFetch(`${API_BASE_URL}/api/subscriptions/`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setSubscriptions(Array.isArray(data) ? data : []);
      } catch {
        setSubscriptions([]);
      }
    };
    loadSubs();
  }, [isStudent, user?.access, subsVersion, authFetch]);

  useEffect(() => {
    const handler = () => setSubsVersion((v) => v + 1);
    window.addEventListener("subscriptions-updated", handler);
    return () => window.removeEventListener("subscriptions-updated", handler);
  }, []);

  useEffect(() => {
    const handler = () => setRegistrationsVersion((v) => v + 1);
    window.addEventListener("registrations-updated", handler);
    return () =>
      window.removeEventListener("registrations-updated", handler);
  }, []);

  useEffect(() => {
    const loadStudentEvents = async () => {
      const authUserId = user?.userId ?? user?.id;
      if (!isStudent || !authUserId) {
        setStudentEvents([]);
        return;
      }
      setStudentEventsLoading(true);
      try {
        const subsRes = await authFetch(
          `${API_BASE_URL}/api/registration-submissions/`,
          { credentials: "include" }
        );
        const submissions = await subsRes.json().catch(() => []);
        const userSubs = Array.isArray(submissions)
          ? submissions.filter((s) => s.user === authUserId)
          : [];
        if (userSubs.length === 0) {
          setStudentEvents([]);
          return;
        }

        const formsRes = await authFetch(`${API_BASE_URL}/api/registration-forms/`, {
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

        const postsRes = await authFetch(`${API_BASE_URL}/api/posts/`, {
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
  }, [isStudent, user?.userId, user?.id, user?.access, registrationsVersion, authFetch]);

  useEffect(() => {
    const loadOrgEvents = async () => {
      if (!isOrg || !(user?.orgId || user?.id)) {
        setOrgEvents([]);
        return;
      }
      setOrgEventsLoading(true);
      try {
        const clubId = user?.orgId || user?.id;
        const res = await dedupFetch(
          `${API_BASE_URL}/api/posts/?club=${clubId}&event_like=1&limit=2`
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        setOrgEvents(Array.isArray(data) ? data : []);
      } catch {
        setOrgEvents([]);
      } finally {
        setOrgEventsLoading(false);
      }
    };
    loadOrgEvents();
  }, [isOrg, user?.orgId, user?.id]);

  const subscribedIds = subscriptions.map((s) => s.club);
  const recommendations = clubs.filter((c) => !subscribedIds.includes(c.id));

  const clubById = useMemo(
    () => new Map((Array.isArray(clubs) ? clubs : []).map((c) => [c.id, c])),
    [clubs]
  );

  const openEventModal = (event) => {
    setSelectedEvent(event);
    setEventModalOpen(true);
  };

  const closeEventModal = () => {
    setSelectedEvent(null);
    setEventModalOpen(false);
  };

  const formatEventDate = (event) => {
    const raw = event?.published_at || event?.date;
    if (!raw) return "";
    if (typeof raw === "string") {
      const parsed = Date.parse(raw);
      if (Number.isNaN(parsed)) return raw;
      return new Date(parsed).toLocaleDateString("ru-RU");
    }
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("ru-RU");
  };

  const handleSubscribe = async (clubId) => {
    if (!isStudent || !user?.access || loadingSub) return;
    setLoadingSub(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/subscriptions/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ club: clubId }),
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
          : { id: Date.now(), club: clubId };
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
      {eventModalOpen &&
        selectedEvent &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 w-screen h-screen"
            onClick={closeEventModal}
          >
            <div
              className="relative flex flex-col w-full max-w-lg bg-white shadow-2xl rounded-2xl animate-slide-up overflow-hidden max-h-[calc(100vh-2rem)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 p-5 border-b border-slate-100">
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-slate-900 break-words">
                    {selectedEvent.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatEventDate(selectedEvent)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeEventModal}
                  className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                  aria-label="Закрыть"
                  title="Закрыть"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 min-h-0 p-5 pt-4 overflow-y-auto">
              {selectedEvent.club ? (
                <div className="flex items-center gap-2 mb-3">
                  <Link
                    to={`/organization/${selectedEvent.club}`}
                    className="flex items-center justify-center w-8 h-8 overflow-hidden bg-white border rounded-full border-slate-200 hover:border-primary transition"
                    aria-label={
                      selectedEvent.club_name ||
                      clubById.get(selectedEvent.club)?.name ||
                      "Организация"
                    }
                    title={
                      selectedEvent.club_name ||
                      clubById.get(selectedEvent.club)?.name ||
                      "Организация"
                    }
                  >
                    <img
                      src={
                        buildMediaUrl(selectedEvent.club_avatar_url) ||
                        buildMediaUrl(
                          clubById.get(selectedEvent.club)?.avatar_url
                        ) ||
                        "/OrganizationLogo/DefaultLogo.jpg"
                      }
                      alt={
                        selectedEvent.club_name ||
                        clubById.get(selectedEvent.club)?.name ||
                        "Организация"
                      }
                      className="object-cover w-full h-full"
                      loading="lazy"
                    />
                  </Link>
                  <Link
                    to={`/organization/${selectedEvent.club}`}
                    className="text-sm font-semibold text-primary hover:underline truncate"
                  >
                    {selectedEvent.club_name ||
                      clubById.get(selectedEvent.club)?.name ||
                      "Организация"}
                  </Link>
                </div>
              ) : null}

              <p className="mb-4 text-slate-700 whitespace-pre-wrap break-words">
                {selectedEvent.content || ""}
              </p>

              {(selectedEvent.image_url || selectedEvent.image || selectedEvent.img) && (
                <img
                  src={
                    buildMediaUrl(selectedEvent.image_url) ||
                    buildMediaUrl(selectedEvent.image) ||
                    selectedEvent.img ||
                    selectedEvent.image_url ||
                    selectedEvent.image
                  }
                  alt={selectedEvent.title}
                  className="object-cover w-full h-56 rounded-xl"
                />
              )}
              </div>
            </div>
          </div>,
          document.body
        )}

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
                return (
                  <button
                    type="button"
                    key={event.id}
                    onClick={() => openEventModal(event)}
                    className="overflow-hidden text-left border shadow-sm bg-white/90 rounded-xl border-slate-200 animate-slide-up hover:shadow-md transition"
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    {(event.image_url || event.image) && (
                      <img
                        src={
                          buildMediaUrl(event.image_url) ||
                          buildMediaUrl(event.image) ||
                          event.image_url ||
                          event.image
                        }
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
                  </button>
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
                <button
                  type="button"
                  key={event.id}
                  onClick={() => openEventModal(event)}
                  className="overflow-hidden text-left border shadow-sm bg-white/90 rounded-xl border-slate-200 animate-slide-up hover:shadow-md transition"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  {(event.image_url || event.image) && (
                    <img
                      src={
                        buildMediaUrl(event.image_url) ||
                        buildMediaUrl(event.image) ||
                        event.image_url ||
                        event.image
                      }
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
                </button>
              ))
            )
          ) : (
            events.map((event, idx) => (
              <button
                type="button"
                key={event.id}
                onClick={() => openEventModal(event)}
                className="overflow-hidden text-left border shadow-sm bg-white/90 rounded-xl border-slate-200 animate-slide-up"
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
              </button>
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
