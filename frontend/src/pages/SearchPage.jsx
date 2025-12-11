import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import { posts, organizations } from "../data/mockOrgsAndPosts";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const filteredPosts = posts.filter((p) =>
    (p.title + p.content).toLowerCase().includes(query.toLowerCase())
  );
  const filteredOrgs = organizations.filter((o) =>
    o.name.toLowerCase().includes(query.toLowerCase())
  );

  function handleSearchChange(e) {
    const value = e.target.value;
    setSearchParams({ q: value });
  }

  return (
    <section className="max-w-6xl mx-auto space-y-5 animate-slide-up">
      <div className="glass-card p-6 lg:p-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-4">Поиск по платформе</h1>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7 7 0 104.22 4.22a7 7 0 0012.43 12.43z" />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={handleSearchChange}
            placeholder="Введите ключевое слово..."
            className="border-2 border-slate-200 rounded-xl px-10 py-3 w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
          />
        </div>
        <p className="text-sm text-slate-500 mt-2">Найдите события, посты или клубы по названию.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">События и посты</h2>
            <span className="text-sm text-slate-500">{filteredPosts.length}</span>
          </div>
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post, idx) => (
              <div
                key={post.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:shadow-md transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-slate-800">{post.title}</h3>
                  <span className="text-xs text-slate-500">
                    {new Date(post.date).toLocaleDateString("ru-RU")}
                  </span>
                </div>
                <p className="text-sm text-slate-600 overflow-hidden text-ellipsis">{post.content}</p>
                <Link to={`/event/${post.id}`} className="text-sm text-primary font-semibold hover:underline mt-2 inline-block">
                  Открыть
                </Link>
              </div>
            ))
          ) : (
            <p className="text-slate-500">Ничего не найдено. Попробуйте изменить запрос.</p>
          )}
        </div>

        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Организации</h2>
            <span className="text-sm text-slate-500">{filteredOrgs.length}</span>
          </div>
          {filteredOrgs.length > 0 ? (
            filteredOrgs.map((org, idx) => (
              <div
                key={org.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:shadow-md transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={`/OrganizationLogo/${org.logo || "DefaultLogo.jpg"}`}
                    alt={org.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <p className="font-semibold text-slate-800">{org.name}</p>
                    <p className="text-xs text-slate-500">Клуб • события • новости</p>
                  </div>
                </div>
                <Link
                  to={`/organization/${org.id}`}
                  className="px-3 py-1.5 text-sm font-semibold text-primary rounded-lg bg-primary/10 border border-primary/30 hover:bg-primary hover:text-white transition-all duration-300"
                >
                  Открыть
                </Link>
              </div>
            ))
          ) : (
            <p className="text-slate-500">Клубы не найдены. Попробуйте другое слово.</p>
          )}
        </div>
      </div>
    </section>
  );
}
