import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { organizations, posts } from "../data/mockOrgsAndPosts";

export default function OrganizationPage() {
  const { orgId } = useParams();
  const org = organizations.find((o) => o.id === Number(orgId));
  const orgPosts = posts.filter((p) => p.orgId === Number(orgId));

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [notifyOn, setNotifyOn] = useState(false);
  const currentUser = {
    name: "Иван Петров",
    group: "ПИ-23-1",
    course: "3 курс",
    email: "user@edu.hse.ru",
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
    // здесь будет запрос на регистрацию
    closeModal();
  };

  if (!org) {
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
          src={`/OrganizationLogo/${org.logo || "DefaultLogo.jpg"}`}
          alt={org.name}
          className="object-cover w-24 h-24 border shadow-md rounded-2xl border-slate-200"
        />
        <div className="flex-1 space-y-2">
          <p className="text-sm font-semibold text-primary">Организация</p>
          <h1 className="text-3xl font-bold text-slate-900">{org.name}</h1>
          <p className="text-slate-600">
            Сообщество студентов и выпускников. Следите за событиями и
            новостями, присоединяйтесь к активности.
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2.5 bg-gradient-to-r from-primary via-purple-600 to-indigo-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]">
              Подписаться
            </button>
            <button
              onClick={() => setNotifyOn((v) => !v)}
              className={`px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                notifyOn
                  ? "bg-white/90 border-2 border-primary/40 text-primary hover:bg-primary/5"
                  : " border-2 text-slate-600 bg-slate-100 border-slate-200 hover:bg-slate-200"
              }`}
            >
              {notifyOn ? "Включить уведомления" : "Выключить уведомления"}
            </button>
          </div>
        </div>
      </div>

      {orgPosts.length > 0 ? (
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
                  {new Date(post.date).toLocaleDateString("ru-RU")}
                </span>
              </div>
              <p className="mb-3 text-slate-700">{post.content}</p>
              {post.image && (
                <img
                  src={post.image}
                  alt="Изображение поста"
                  className="object-cover w-full mb-3 h-60 rounded-xl"
                />
              )}
              {post.type === "event" && (
                <div className="flex justify-end">
                  <button
                    onClick={() => openModal(post)}
                    className="px-4 py-2 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-primary via-purple-600 to-indigo-600 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
                  >
                    Зарегистрироваться
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="p-5 border rounded-xl bg-slate-50">
          <h2 className="font-semibold">Постов пока нет</h2>
          <p className="mt-2 text-sm text-slate-600">
            Следите за обновлениями — скоро появятся новости и события.
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
              Регистрация на событие
            </h3>
            <p className="mb-4 text-sm text-slate-600">{selectedPost.title}</p>

            <form className="space-y-3" onSubmit={handleRegister}>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">
                  ФИО
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
                  Комментарий (опционально)
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border-2 rounded-lg border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Ваши пожелания..."
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
