import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {API_BASE_URL} from "../config"
export default function OrganizationPage() {
  const { orgId } = useParams();
  const { user } = useAuth();

  const [club, setClub] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingClub, setLoadingClub] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [subsLoading, setSubsLoading] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [notifyOn, setNotifyOn] = useState(false);

  // загрузка клуба
  useEffect(() => {
    const loadClub = async () => {
      setLoadingClub(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/clubs/${orgId}/`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setClub(data);
      } catch {
        setClub(null);
      } finally {
        setLoadingClub(false);
      }
    };
    if (orgId) loadClub();
  }, [orgId]);

  // загрузка постов клуба
  useEffect(() => {
    const loadPosts = async () => {
      setLoadingPosts(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/posts/`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        const filtered = Array.isArray(data)
          ? data.filter((p) => p.club === Number(orgId))
          : [];
        setPosts(filtered);
      } catch {
        setPosts([]);
      } finally {
        setLoadingPosts(false);
      }
    };
    if (orgId) loadPosts();
  }, [orgId]);

  // загрузка подписки на клуб для текущего студента
  useEffect(() => {
    const loadSub = async () => {
      if (user?.role !== "student" || !user?.id) {
        setSubscriptionId(null);
        return;
      }
      setSubsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/subscriptions/`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        const found = Array.isArray(data)
          ? data.find(
              (s) => s.user === user.id && s.club === Number(orgId)
            )
          : null;
        setSubscriptionId(found ? found.id : null);
      } catch {
        setSubscriptionId(null);
      } finally {
        setSubsLoading(false);
      }
    };
    if (orgId) loadSub();
  }, [orgId, user]);

  const orgPosts = useMemo(
    () =>
      posts
        .slice()
        .sort(
          (a, b) =>
            new Date(b.published_at || b.date || 0) -
            new Date(a.published_at || a.date || 0)
        ),
    [posts]
  );

  const currentUser = {
    name:
      user?.studentProfile?.name && user?.studentProfile?.surname
        ? `${user.studentProfile.name} ${user.studentProfile.surname}`
        : user?.username || "",
    group: user?.studentProfile?.group || "",
    course: user?.studentProfile?.course || "",
    email: user?.email || "",
  };

  const openModal = (post) => {
    setSelectedPost(post);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedPost(null);
    setModalOpen(false);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    // TODO: отправить регистрацию на мероприятие
    closeModal();
  };

  const handleSubscribeToggle = async () => {
    if (user?.role !== "student" || !user?.id || !club) return;
    try {
      setSubsLoading(true);
      if (!subscriptionId) {
        // subscribe
        const res = await fetch(`${API_BASE_URL}/api/subscriptions/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: user.id, club: Number(orgId) }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.detail || "Ошибка подписки");
        setSubscriptionId(data?.id || Date.now());
      } else {
        // unsubscribe
        await fetch(`${API_BASE_URL}/api/subscriptions/${subscriptionId}/`, {
          method: "DELETE",
        });
        setSubscriptionId(null);
      }
      window.dispatchEvent(new Event("subscriptions-updated"));
    } catch (err) {
      console.error(err);
    } finally {
      setSubsLoading(false);
    }
  };

  if (loadingClub) {
    return (
      <section className="max-w-4xl mx-auto">
        <div className="p-6 glass-card">Загрузка организации...</div>
      </section>
    );
  }

  if (!club) {
    return (
      <section className="max-w-4xl mx-auto">
        <div className="p-6 glass-card">
          <h1 className="mb-4 text-2xl font-bold">Организация не найдена</h1>
          <p className="text-slate-600">
            Проверьте ссылку или выберите другую организацию.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-5xl mx-auto space-y-5">
      <div className="flex flex-col items-center gap-5 p-6 glass-card lg:p-8 sm:flex-row sm:items-start">
        <img
          src={club.avatar_url || "/OrganizationLogo/DefaultLogo.jpg"}
          alt={club.name}
          className="object-cover w-24 h-24 border shadow-md rounded-2xl border-slate-200"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/OrganizationLogo/DefaultLogo.jpg";
          }}
        />
        <div className="flex-1 space-y-2">
          <p className="text-sm font-semibold text-primary">Организация</p>
          <h1 className="text-3xl font-bold text-slate-900">{club.name}</h1>
          <p className="text-slate-600">{club.description}</p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSubscribeToggle}
              disabled={subsLoading || user?.role !== "student"}
              className={`px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg ${
                subscriptionId
                  ? "border-2 border-primary text-primary bg-white hover:bg-primary/5"
                  : "bg-gradient-to-r from-primary via-purple-600 to-indigo-600 text-white hover:shadow-xl hover:scale-[1.02]"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {subscriptionId ? "Отписаться" : "Подписаться"}
            </button>
            <button
              onClick={() => setNotifyOn((v) => !v)}
              className={`px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                notifyOn
                  ? "bg-white/90 border-2 border-primary/40 text-primary hover:bg-primary/5"
                  : " border-2 text-slate-600 bg-slate-100 border-slate-200 hover:bg-slate-200"
              }`}
            >
              {notifyOn
                ? "Уведомления включены"
                : "Включить уведомления"}
            </button>
          </div>
        </div>
      </div>

      {loadingPosts ? (
        <div className="p-5 border rounded-xl bg-slate-50 text-slate-600">
          Загрузка постов...
        </div>
      ) : orgPosts.length > 0 ? (
        <div className="space-y-4">
          {orgPosts.map((post, idx) => (
            <article
              key={post.id}
              className="p-5 transition-shadow border shadow-sm lg:p-6 bg-white/90 border-slate-200 rounded-2xl hover:shadow-md animate-slide-up"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-slate-900">
                  {post.title}
                </h2>
                <span className="text-xs text-slate-500">
                  {new Date(post.published_at || post.date).toLocaleDateString(
                    "ru-RU"
                  )}
                </span>
              </div>
              <p className="mb-3 text-slate-700">{post.content}</p>
              {post.image_url && (
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="object-cover w-full mb-3 h-60 rounded-xl"
                />
              )}
              {post.type === "event" || post.is_form ? (
                <div className="flex justify-end">
                  <button
                    onClick={() => openModal(post)}
                    className="px-4 py-2 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-primary via-purple-600 to-indigo-600 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
                  >
                    Зарегистрироваться
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="p-5 border rounded-xl bg-slate-50">
          <h2 className="font-semibold">Постов пока нет</h2>
          <p className="mt-2 text-sm text-slate-600">
            Здесь появятся публикации организации.
          </p>
        </div>
      )}

      {modalOpen && selectedPost && (
        <div
          className="fixed inset-0 -inset-6 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-md p-6 bg-white shadow-2xl rounded-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-2 text-xl font-bold text-slate-900">
              Регистрация на мероприятие
            </h3>
            <p className="mb-4 text-sm text-slate-600">{selectedPost.title}</p>

            <form className="space-y-3" onSubmit={handleRegister}>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">
                  Имя
                </label>
                <input
                  type="text"
                  value={currentUser.name}
                  readOnly
                  className="w-full px-3 py-2 border-2 rounded-lg border-slate-200 bg-slate-50 text-slate-800"
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Группа
                  </label>
                  <input
                    type="text"
                    value={currentUser.group}
                    readOnly
                    className="w-full px-3 py-2 border-2 rounded-lg border-slate-200 bg-slate-50 text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Курс
                  </label>
                  <input
                    type="text"
                    value={currentUser.course}
                    readOnly
                    className="w-full px-3 py-2 border-2 rounded-lg border-slate-200 bg-slate-50 text-slate-800"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">
                  E-mail
                </label>
                <input
                  type="email"
                  value={currentUser.email}
                  readOnly
                  className="w-full px-3 py-2 border-2 rounded-lg border-slate-200 bg-slate-50 text-slate-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">
                  Комментарий (по желанию)
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border-2 rounded-lg border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Напишите, если есть пожелания..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-semibold transition border text-slate-600 rounded-xl bg-slate-100 border-slate-200 hover:bg-slate-200"
                >
                  Закрыть
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-primary via-purple-600 to-indigo-600 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
                >
                  Зарегистрироваться
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
