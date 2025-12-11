import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { posts, organizations } from "../data/mockOrgsAndPosts";

export default function ProfilePage() {
  const { user } = useAuth();
  const [selectedPost, setSelectedPost] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    date: "",
    type: "info",
    image: "",
  });

  const displayUser = {
    name: user?.username || "Студент",
    email: user?.email || "user@edu.hse.ru",
    group: user?.group || "ИБ-23-1",
    course: user?.course || "3 курс",
    role: user?.role === "org" ? "Организация" : "Студент",
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
    if (user?.role !== "org") return [];
    return posts
      .filter((p) => p.orgId === (user.orgId || 0))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [user]);

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
      date: post.date || "",
      type: post.type || "info",
      image: post.image || "",
    });
    setEditModalOpen(true);
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
    // Здесь будет запрос на сохранение
    closeModals();
  };

  const handleDeleteConfirm = () => {
    // Здесь будет запрос на удаление
    closeModals();
  };

  return (
    <>
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
            {user?.role === "org" ? (
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

        {user?.role !== "org" && (
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

        {user?.role === "org" && (
          <div className="p-6 space-y-4 glass-card lg:p-8">
            <h2 className="text-xl font-bold text-slate-900 lg:text-2xl">
              Посты организации
            </h2>
            {orgPosts.length === 0 ? (
              <p className="text-slate-600">Пока нет постов.</p>
            ) : (
              <div className="space-y-4">
                {orgPosts.map((post, idx) => {
                  const org = getOrg(post.orgId);
                  return (
                    <article
                      key={post.id}
                      className="relative p-4 transition-shadow border shadow-sm lg:p-5 bg-white/90 border-slate-200 rounded-2xl hover:shadow-md animate-slide-up group"
                      style={{ animationDelay: `${idx * 80}ms` }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-primary">
                            {org?.name || "Организация"}
                          </p>
                          <h3 className="text-lg font-bold text-slate-900 lg:text-xl">
                            {post.title}
                          </h3>
                          <span className="text-xs text-slate-500">
                            {new Date(post.date).toLocaleDateString("ru-RU")}
                          </span>
                        </div>
                        <div className="relative post-menu-actions">
                          <button
                            className="flex items-center justify-center transition-colors bg-white border-2 w-9 h-9 rounded-xl border-slate-200 hover:border-primary hover:bg-primary/5"
                            aria-label="Меню поста"
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
                            className={`absolute right-0 z-40 w-48 py-2 mt-2 text-sm bg-white border rounded-xl shadow-lg border-slate-200 origin-top-right ${
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
                  className="px-4 py-2 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
                >
                  Удалить
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
