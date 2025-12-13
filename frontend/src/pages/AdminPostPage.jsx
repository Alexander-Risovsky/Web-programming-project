import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../context/AuthContext";
import {API_BASE_URL} from "../config"

export default function AdminPostPage() {
  const { user } = useAuth();
  const isOrg = user?.role === "org";

  const [type, setType] = useState("info"); // info | event
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null); // {type, message}

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isOrg) {
      showToast("error", "Создавать посты может только организация");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        type,
        title,
        content,
        image_url: imageUrl || "",
        is_form: type === "event",
        club: user?.orgId || user?.id,
        form: null,
      };

      const res = await fetch(`${API_BASE_URL}/api/posts/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.detail || "Не удалось создать пост");
      }

      showToast("success", "Пост опубликован");
      setTitle("");
      setContent("");
      setImageUrl("");
      setType("info");
    } catch (err) {
      showToast("error", err.message || "Ошибка публикации");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="max-w-3xl mx-auto space-y-4 animate-slide-up">
      {toast &&
        createPortal(
          <div className="fixed inset-x-0 top-2 z-[40000] flex justify-center pointer-events-none animate-slide-up">
            <div
              className={`px-5 py-3 rounded-xl shadow-lg text-white pointer-events-auto ${
                toast.type === "success" ? "bg-emerald-400" : "bg-rose-400"
              }`}
            >
              {toast.message}
            </div>
          </div>,
          document.body
        )}

      <div className="p-6 glass-card lg:p-8">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <p className="text-sm font-semibold text-primary">Панель организации</p>
            <h1 className="text-2xl font-bold lg:text-3xl text-slate-900">Создание поста</h1>
          </div>
          <div className="flex items-center gap-2 bg-slate-100/70 border border-slate-200 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setType("info")}
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                type === "info"
                  ? "bg-gradient-to-r from-primary via-purple-600 to-indigo-600 text-white shadow-md"
                  : "text-slate-700 hover:bg-white"
              }`}
            >
              Информационный
            </button>
            <button
              type="button"
              onClick={() => setType("event")}
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                type === "event"
                  ? "bg-gradient-to-r from-primary via-purple-600 to-indigo-600 text-white shadow-md"
                  : "text-slate-700 hover:bg-white"
              }`}
            >
              Мероприятие
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Заголовок</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Новая встреча клуба"
              className="w-full px-4 py-3 transition-all duration-300 bg-white border-2 shadow-sm rounded-xl border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary hover:shadow-md"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Описание</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Добавьте подробности поста или мероприятия..."
              className="w-full px-4 py-3 transition-all duration-300 bg-white border-2 shadow-sm resize-none h-36 rounded-xl border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary hover:shadow-md"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Картинка (URL)</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-3 transition-all duration-300 bg-white border-2 shadow-sm rounded-xl border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary hover:shadow-md"
            />
          </div>

          {type === "event" && (
            <div className="space-y-3 border rounded-xl border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Форма регистрации</p>
                  <p className="text-xs text-slate-500">Вопросы добавим позже</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-3 bg-gradient-to-r from-primary via-purple-600 to-indigo-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Публикуем..." : "Опубликовать"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
