import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { posts, organizations } from "../data/mockOrgsAndPosts";

export default function ProfilePage() {
  const { user } = useAuth();
  const isOrg = user?.role === "org" || (!!user?.orgId && !user?.studentProfile);
  const [orgInfo, setOrgInfo] = useState(null);
  const [orgPostsRemote, setOrgPostsRemote] = useState([]);
  const [orgPostsLoading, setOrgPostsLoading] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);

  const [selectedPost, setSelectedPost] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    date: "",
    type: "info",
    image: "",
  });
  const [toast, setToast] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Загрузка инфо об организации
  useEffect(() => {
    const loadOrg = async () => {
      if (!isOrg) {
        setOrgInfo(null);
        return;
      }
      const clubId = user?.orgId || user?.id;
      if (!clubId) return;
      try {
        const res = await fetch(`/api/clubs/${clubId}/`);
        if (!res.ok) return;
        const data = await res.json();
        setOrgInfo(data);
      } catch {
        // молча
      }
    };
    loadOrg();
  }, [user]);

  // Загрузка постов организации
  useEffect(() => {
    const loadOrgPosts = async () => {
      if (!isOrg) {
        setOrgPostsRemote([]);
        return;
      }
      setOrgPostsLoading(true);
      try {
        const res = await fetch("/api/posts/");
        if (!res.ok) throw new Error();
        const data = await res.json();
        const filtered = Array.isArray(data)
          ? data.filter((p) => p.club === (user.orgId || user.id))
          : [];
        setOrgPostsRemote(filtered);
      } catch {
        setOrgPostsRemote([]);
      } finally {
        setOrgPostsLoading(false);
      }
    };
    loadOrgPosts();
  }, [user]);

  const orgDisplayName =
    isOrg
      ? orgInfo?.name ||
        user?.orgName ||
        organizations.find((o) => o.id === user.orgId)?.name ||
        user?.username ||
        "Организация"
      : null;

  const displayUser = {
    name:
      isOrg
        ? orgDisplayName
        : `${user?.studentProfile?.name || ""} ${
            user?.studentProfile?.surname || ""
          }`.trim() ||
          user?.username ||
          "Пользователь",
    email: user?.email || "user@edu.hse.ru",
    group: user?.studentProfile?.group || "Группа",
    course: user?.studentProfile?.course || "Курс",
    role: isOrg ? "Организация" : "Студент",
    followers: user?.followers ?? 1240,
  };

  const registeredEvents = useMemo(
    () =>
      posts
        .filter((p) => p.type === "event")
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
    []
  );

  const orgPosts = useMemo(() => {
    if (!isOrg) return [];
    return orgPostsRemote
      .slice()
      .sort(
        (a, b) =>
          new Date(b.published_at || b.date || 0) -
          new Date(a.published_at || a.date || 0)
      );
  }, [user, orgPostsRemote]);

  const formatDate = (value) => {
    if (!value) return "--";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "--";
    const dd = parsed.getDate().toString().padStart(2, "0");
    const mm = (parsed.getMonth() + 1).toString().padStart(2, "0");
    const yyyy = parsed.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const getOrg = (orgId) => organizations.find((o) => o.id === orgId);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuOpenId &&
        !(e.target.closest && e.target.closest(".post-menu-actions"))
      ) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpenId]);

  const openEdit = (post) => {
    setSelectedPost(post);
    setEditForm({
      title: post.title || "",
      content: post.content || "",
      date:
        (post.published_at || post.date || "").toString().slice(0, 10) || "",
      type: post.type || "info",
      image: post.image_url || post.image || "",
    });
    setEditModalOpen(true);
    setMenuOpenId(null);
  };

  const openDelete = (post) => {
    setSelectedPost(post);
    setDeleteModalOpen(true);
  };

  const openStats = (post) => {
    setSelectedPost(post);
    setStatsModalOpen(true);
  };

  const closeModals = () => {
    setEditModalOpen(false);
    setDeleteModalOpen(false);
    setStatsModalOpen(false);
    setSelectedPost(null);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!selectedPost) return;
    const payload = {
      title: editForm.title,
      content: editForm.content,
      type: editForm.type,
      image_url: editForm.image || null,
      published_at: editForm.date || null,
      club: selectedPost.club ?? user?.orgId ?? user?.id ?? null,
      is_form: editForm.type === "event",
    };
    fetch(`/api/posts/${selectedPost.id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(user?.access ? { Authorization: `Bearer ${user.access}` } : {}),
      },
      body: JSON.stringify(payload),
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed");
        const updated = await res.json();
        setOrgPostsRemote((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
        closeModals();
      })
      .catch(() => closeModals());
  };

  const handleDeleteConfirm = () => {
    if (!selectedPost) return;
    setDeleteLoading(true);
    fetch(`/api/posts/${selectedPost.id}/`, {
      method: "DELETE",
      headers: {
        ...(user?.access ? { Authorization: `Bearer ${user.access}` } : {}),
      },
      credentials: "include",
    })
      .then(() => {
        setOrgPostsRemote((prev) =>
          prev.filter((p) => p.id !== selectedPost.id)
        );
        setToast({ type: "error", message: "Пост удалён" });
        setTimeout(() => setToast(null), 4000);
        closeModals();
      })
      .catch(() => {
        setToast({ type: "error", message: "Не удалось удалить пост" });
        setTimeout(() => setToast(null), 4000);
        closeModals();
      })
      .finally(() => setDeleteLoading(false));
  };

  return (
    <>
      {toast && (
        <div
          className="fixed top-4 left-1/2 z-[40000] -translate-x-1/2 px-4 py-3 rounded-xl shadow-2xl text-sm font-semibold text-white animate-slide-up transition-all duration-500"
          style={{
            background: "linear-gradient(135deg, #ef4444, #b91c1c)",
          }}
        >
          {toast.message}
        </div>
      )}
      <section className="max-w-5xl mx-auto space-y-5 animate-slide-up">
        <div className="flex flex-col gap-5 p-6 glass-card lg:p-8 md:flex-row md:items-center">
          <div className="relative">
            <div className="flex items-center justify-center w-20 h-20 text-2xl font-bold text-white shadow-lg rounded-2xl bg-gradient-to-br from-primary to-purple-600">
              <svg
                className="w-10 h-10 text-white"
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
            </div>
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-semibold text-primary">
              {displayUser.role}
            </p>
            <h1 className="text-2xl font-bold lg:text-3xl text-slate-900">
              {displayUser.name}
            </h1>
            <p className="text-slate-600">{displayUser.email}</p>
            {isOrg ? (
              <p className="text-slate-600">
                Подписчики: {displayUser.followers}
              </p>
            ) : (
              <>
                <p className="text-slate-600">Группа: {displayUser.group}</p>
                <p className="text-slate-600">Курс: {displayUser.course}</p>
              </>
            )}
          </div>
          <button className="px-4 py-2.5 bg-gradient-to-r from-primary via-purple-600 to-indigo-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl">
            Редактировать
          </button>
        </div>

        {!isOrg && (
          <div className="p-6 space-y-4 glass-card lg:p-8">
            <h2 className="text-xl font-bold text-slate-900 lg:text-2xl">
              Мои регистрации на мероприятия
            </h2>
            {registeredEvents.length === 0 ? (
              <p className="text-slate-600">
                Пока нет зарегистрированных мероприятий.
              </p>
            ) : (
              <div className="space-y-4">
                {registeredEvents.map((event, idx) => {
                  const org = getOrg(event.orgId);
                  return (
                    <article
                      key={event.id}
                      className="p-4 transition-shadow border shadow-sm lg:p-5 bg-white/90 border-slate-200 rounded-2xl hover:shadow-md animate-slide-up"
                      style={{ animationDelay: `${idx * 80}ms` }}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-primary">
                            {org?.name || "Организация"}
                          </p>
                          <h3 className="text-lg font-bold text-slate-900 lg:text-xl">
                            {event.title}
                          </h3>
                        </div>
                        <span className="text-xs text-slate-500">
                          {new Date(event.date).toLocaleDateString("ru-RU")}
                        </span>
                      </div>
                      <p className="mb-3 text-slate-700">{event.content}</p>
                      {event.image && (
                        <img
                          src={event.image}
                          alt={event.title}
                          className="object-cover w-full mb-3 rounded-xl max-h-60"
                        />
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {isOrg && (
          <div className="p-6 space-y-4 glass-card lg:p-8">
            <h2 className="text-xl font-bold text-slate-900 lg:text-2xl">
              Посты организации
            </h2>
            {orgPostsLoading ? (
              <p className="text-slate-600">Загрузка постов...</p>
            ) : orgPosts.length === 0 ? (
              <p className="text-slate-600">Постов пока нет.</p>
            ) : (
              <div className="space-y-4">
                {orgPosts.map((post, idx) => {
                  const org = getOrg(post.orgId);
                  const dateValue = post.published_at || post.date;
                  const isOpen = menuOpenId === post.id;
                  return (
                    <article
                      key={post.id}
                      className={`relative p-4 transition-shadow border shadow-sm lg:p-5 bg-white/90 border-slate-200 rounded-2xl hover:shadow-md animate-slide-up group ${
                        isOpen ? "z-50" : "z-0"
                      }`}
                      style={{ animationDelay: `${idx * 80}ms` }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-primary">
                            {org?.name || orgDisplayName || "Организация"}
                          </p>
                          <h3 className="text-lg font-bold text-slate-900 lg:text-xl">
                            {post.title}
                          </h3>
                          <span className="text-xs text-slate-500">
                            {formatDate(dateValue)}
                          </span>
                        </div>
                        <div className="relative post-menu-actions">
                          <button
                            className="flex items-center justify-center transition-colors bg-white border-2 w-9 h-9 rounded-xl border-slate-200 hover:border-primary hover:bg-primary/5"
                            aria-label="Открыть меню"
                            type="button"
                            onClick={() =>
                              setMenuOpenId((prev) =>
                                prev === post.id ? null : post.id
                              )
                            }
                          >
                            <span className="flex flex-col items-center justify-center gap-1">
                              <span className="block w-4 h-0.5 bg-slate-600"></span>
                              <span className="block w-4 h-0.5 bg-slate-600"></span>
                              <span className="block w-4 h-0.5 bg-slate-600"></span>
                            </span>
                          </button>
                          <div
                            className={`absolute right-0 z-50000 w-48 py-2 mt-2 text-sm bg-white border rounded-xl shadow-2xl border-slate-200 origin-top-right ${
                              menuOpenId === post.id
                                ? "block animate-slide-up"
                                : "hidden"
                            }`}
                          >
                            <button
                              onClick={() => openEdit(post)}
                              className="w-full px-3 py-2 text-left hover:bg-slate-50"
                            >
                              Редактировать пост
                            </button>
                            <button
                              onClick={() => openDelete(post)}
                              className="w-full px-3 py-2 text-left text-red-600 hover:bg-slate-50"
                            >
                              Удалить пост
                            </button>
                            {post.type === "event" && (
                              <button
                                onClick={() => openStats(post)}
                                className="w-full px-3 py-2 text-left hover:bg-slate-50"
                              >
                                Статистика регистраций
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="mb-3 text-slate-700">{post.content}</p>
                      {post.image && (
                        <img
                          src={post.image}
                          alt={post.title}
                          className="object-cover w-full mb-3 rounded-xl max-h-60"
                        />
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>

      {(editModalOpen || deleteModalOpen || statsModalOpen) && (
        <div
          className="fixed inset-0 w-screen h-screen z-[10001] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={closeModals}
        >
          {editModalOpen && selectedPost && (
            <div
              className="relative w-full max-w-lg p-6 bg-white shadow-2xl rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-4 text-lg font-bold text-slate-900">
                Редактирование поста
              </h3>
              <form className="space-y-3" onSubmit={handleEditSubmit}>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">
                    Заголовок
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, title: e.target.value }))
                    }
                    className="w-full px-3 py-2 border-2 rounded-lg border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">
                    Контент
                  </label>
                  <textarea
                    rows={4}
                    value={editForm.content}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, content: e.target.value }))
                    }
                    className="w-full px-3 py-2 border-2 rounded-lg border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">
                      Дата
                    </label>
                    <input
                      type="date"
                      value={editForm.date}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, date: e.target.value }))
                      }
                      className="w-full px-3 py-2 border-2 rounded-lg border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">
                      Тип
                    </label>
                    <select
                      value={editForm.type}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, type: e.target.value }))
                      }
                      className="w-full px-3 py-2 border-2 rounded-lg border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="info">Информационный</option>
                      <option value="event">Мероприятие</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">
                    Ссылка на изображение
                  </label>
                  <input
                    type="text"
                    value={editForm.image}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, image: e.target.value }))
                    }
                    className="w-full px-3 py-2 border-2 rounded-lg border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeModals}
                    className="px-4 py-2 text-sm font-semibold transition border rounded-xl text-slate-600 bg-slate-100 border-slate-200 hover:bg-slate-200"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-primary via-purple-600 to-indigo-600 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
                  >
                    Сохранить
                  </button>
                </div>
              </form>
            </div>
          )}

          {deleteModalOpen && selectedPost && (
            <div
              className="relative w-full max-w-md p-6 bg-white shadow-2xl rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-3 text-lg font-bold text-slate-900">
                Удалить пост?
              </h3>
              <p className="mb-4 text-sm text-slate-600">
                Вы точно хотите удалить пост «{selectedPost.title}»? Это
                действие нельзя отменить.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={closeModals}
                  className="px-4 py-2 text-sm font-semibold transition border rounded-xl text-slate-600 bg-slate-100 border-slate-200 hover:bg-slate-200"
                >
                  Отмена
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className={`px-4 py-2 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all ${
                    deleteLoading ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Удаляем..." : "Удалить"}
                </button>
              </div>
            </div>
          )}

          {statsModalOpen && selectedPost && (
            <div
              className="relative w-full max-w-md p-6 bg-white shadow-2xl rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-3 text-lg font-bold text-slate-900">
                Статистика регистраций
              </h3>
              <p className="mb-2 text-sm text-slate-600">
                Пост: {selectedPost.title}
              </p>
              <p className="text-sm text-slate-500">
                Здесь появятся данные о количестве регистраций, подтверждений и
                посещений после интеграции с API.
              </p>
              <div className="flex justify-end pt-4">
                <button
                  onClick={closeModals}
                  className="px-4 py-2 text-sm font-semibold transition border rounded-xl text-slate-600 bg-slate-100 border-slate-200 hover:bg-slate-200"
                >
                  Закрыть
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
