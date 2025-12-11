import React from "react";
import { useParams, Link } from "react-router-dom";
import { posts, organizations } from "../data/mockOrgsAndPosts";

export default function EventPage() {
  const { eventId } = useParams();
  const event = posts.find((p) => p.id === Number(eventId));
  const org = event ? organizations.find((o) => o.id === event.orgId) : null;

  return (
    <section className="max-w-4xl mx-auto space-y-6">
      <div className="glass-card p-6 lg:p-8 relative overflow-hidden animate-slide-up">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {event ? (
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-primary/10 border border-primary/30 text-primary font-semibold">
                Событие #{event.id}
              </div>
              {org && (
                <Link
                  to={`/organization/${org.id}`}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  {org.name}
                </Link>
              )}
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 bg-gradient-to-r from-primary via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {event.title}
            </h1>
            <p className="text-slate-700 text-base leading-relaxed">{event.content}</p>
            <div className="text-sm text-slate-600">
              Дата публикации: {new Date(event.date).toLocaleDateString("ru-RU")}
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-3 bg-gradient-to-r from-primary via-purple-600 to-indigo-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]">
                Записаться
              </button>
              <button className="px-4 py-3 bg-white text-primary border-2 border-primary/40 rounded-xl font-semibold transition-all duration-300 hover:border-primary hover:shadow-md">
                Поделиться
              </button>
            </div>
          </div>
        ) : (
          <div className="relative z-10 space-y-3">
            <h1 className="text-3xl font-bold text-slate-900">Событие не найдено</h1>
            <p className="text-slate-600">Проверьте ссылку или вернитесь на главную страницу.</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primaryHover transition"
            >
              На главную
            </Link>
          </div>
        )}
      </div>

      {event?.image && (
        <div className="glass-card overflow-hidden animate-fade-in">
          <img src={event.image} alt={event.title} className="w-full h-72 object-cover" />
        </div>
      )}
    </section>
  );
}
