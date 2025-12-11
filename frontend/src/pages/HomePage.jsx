import React, { useEffect, useMemo, useState } from "react";

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      setError("");
      try {
        // В dev проксируется через vite.config.js на бекенд http://localhost:8000
        const res = await fetch("/api/posts/");
        if (!res.ok) {
          throw new Error(`Ошибка загрузки: ${res.status}`);
        }
        const contentType = res.headers.get("content-type") || "";
        if (!contentType.toLowerCase().includes("application/json")) {
          const text = await res.text();
          throw new Error("Ответ не JSON: " + text.slice(0, 200));
        }
        const data = await res.json();
        setPosts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Не удалось загрузить посты");
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  const feed = useMemo(
    () =>
      [...posts].sort(
        (a, b) =>
          new Date(b.published_at || b.date || 0).getTime() -
          new Date(a.published_at || a.date || 0).getTime()
      ),
    [posts]
  );

  return (
    <section className="max-w-5xl mx-auto space-y-5">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-transparent lg:text-4xl bg-gradient-to-r from-primary via-purple-600 to-indigo-600 bg-clip-text">
          Лента событий и постов
        </h1>
        <p className="mt-2 text-slate-600">
          Все публикации со всех организаций в хронологическом порядке
        </p>
      </div>

      {loading ? (
        <div className="p-5 border rounded-xl bg-slate-50 text-slate-600">
          Загружаем посты...
        </div>
      ) : error ? (
        <div className="p-5 text-red-700 border rounded-xl bg-red-50">
          {error}
        </div>
      ) : feed.length === 0 ? (
        <div className="p-5 border rounded-xl bg-slate-50 text-slate-600">
          Постов пока нет.
        </div>
      ) : (
        <div className="space-y-4">
          {feed.map((post, idx) => {
            const date = post.published_at || post.date;
            return (
              <article
                key={post.id}
                className="p-5 transition-shadow border shadow-sm bg-white/90 border-slate-200 rounded-2xl hover:shadow-md animate-slide-up"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-semibold text-slate-900">
                    {post.title}
                  </h2>
                  <span className="text-xs text-slate-500">
                    {date ? new Date(date).toLocaleDateString("ru-RU") : ""}
                  </span>
                </div>

                <p className="mb-1 text-sm font-semibold text-primary">
                  Организация: {post.club ?? "—"}
                </p>

                <p className="mb-3 whitespace-pre-wrap text-slate-700">
                  {post.content}
                </p>

                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="object-cover w-full mb-3 h-60 rounded-xl"
                  />
                )}

                {post.is_form && (
                  <span className="inline-block px-3 py-1 text-xs font-semibold text-white rounded-full bg-gradient-to-r from-primary via-purple-600 to-indigo-600">
                    Есть регистрация
                  </span>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
