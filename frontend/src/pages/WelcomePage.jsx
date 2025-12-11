import React, { useMemo } from "react";
import { organizations, posts } from "../data/mockOrgsAndPosts";

export default function WelcomePage() {
  const stats = useMemo(() => {
    return {
      orgs: organizations.length,
      posts: posts.length,
      events: posts.length + 3,
      users: 1280,
    };
  }, []);

  return (
    <section className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
      <div className="text-center mb-4 lg:mb-6 animate-slide-up">
        <h1 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3 lg:mb-4 animate-fade-in">
          Добро пожаловать в HSE Flow
        </h1>
        <div className="w-16 lg:w-24 h-1 bg-gradient-to-r from-primary to-purple-600 mx-auto mb-3 lg:mb-4 rounded-full animate-scale-in"></div>
        <p
          className="text-base lg:text-lg text-slate-600 max-w-2xl mx-auto px-2 animate-slide-up"
          style={{ animationDelay: "200ms" }}
        >
          Система событий и студенческих сообществ. Подписывайтесь на клубы, следите за мероприятиями и не пропускайте важные даты.
        </p>
      </div>

      <div className="mb-6 lg:mb-10 animate-fade-in" style={{ animationDelay: "120ms" }}>
        <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 text-center mb-6 lg:mb-8">
          Возможности платформы
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {[
            {
              title: "События",
              text: "Все актуальные встречи и митапы студентов в одном месте.",
              color: "from-blue-50 via-blue-100 to-indigo-50",
              border: "border-blue-200 hover:border-blue-400 hover:shadow-blue-200/50",
              iconColor: "from-blue-500 to-blue-600",
              iconPath: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              ),
            },
            {
              title: "Подписки",
              text: "Следите за клубами и получайте уведомления.",
              color: "from-emerald-50 via-green-100 to-teal-50",
              border: "border-green-200 hover:border-green-400 hover:shadow-green-200/50",
              iconColor: "from-green-500 to-emerald-600",
              iconPath: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              ),
            },
            {
              title: "Медиа",
              text: "Фото и видео внутри постов и событий.",
              color: "from-purple-50 via-purple-100 to-indigo-50",
              border: "border-purple-200 hover:border-purple-400 hover:shadow-purple-200/50",
              iconColor: "from-purple-500 to-indigo-600",
              iconPath: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              ),
            },
          ].map((card, idx) => (
            <div
              key={card.title}
              className={`bg-gradient-to-br ${card.color} rounded-2xl p-4 lg:p-6 border-2 ${card.border} hover:shadow-xl transition-all duration-500 group relative overflow-hidden animate-slide-up`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <div className={`w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br ${card.iconColor} rounded-xl flex items-center justify-center mb-3 lg:mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 animate-glow`}>
                <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {card.iconPath}
                </svg>
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-slate-800 mb-2 group-hover:text-primary transition-colors duration-300">
                {card.title}
              </h3>
              <p className="text-slate-600 text-sm">{card.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div
        className="bg-gradient-to-br from-slate-50 via-white to-blue-50/30 rounded-2xl lg:rounded-3xl shadow-xl border-2 border-slate-200 p-4 lg:p-8 animate-slide-up relative overflow-hidden"
        style={{ animationDelay: "200ms" }}
      >
        <div className="hidden lg:block absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="hidden lg:block absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-4 lg:mb-6 text-center relative z-10">
          Что уже на платформе
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 lg:gap-6 relative z-10">
          {[
            {
              label: "Сообщества",
              value: stats.orgs,
              color: "from-blue-600 to-indigo-600",
              border: "border-blue-200/50 hover:shadow-blue-200/50 hover:border-blue-400",
              bg: "from-blue-50/50 to-transparent",
            },
            {
              label: "Посты",
              value: stats.posts,
              color: "from-green-600 to-emerald-600",
              border: "border-green-200/50 hover:shadow-green-200/50 hover:border-green-400",
              bg: "from-green-50/50 to-transparent",
            },
            {
              label: "События",
              value: stats.events,
              color: "from-purple-600 to-indigo-600",
              border: "border-purple-200/50 hover:shadow-purple-200/50 hover:border-purple-400",
              bg: "from-purple-50/50 to-transparent",
            },
            {
              label: "Пользователи",
              value: stats.users,
              color: "from-indigo-600 to-blue-600",
              border: "border-indigo-200/50 hover:shadow-indigo-200/50 hover:border-indigo-400",
              bg: "from-indigo-50/50 to-transparent",
            },
          ].map((item, idx) => (
            <div
              key={item.label}
              className={`bg-white/90 backdrop-blur-sm rounded-xl lg:rounded-2xl shadow-md border-2 ${item.border} p-4 lg:p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden animate-scale-in`}
              style={{ animationDelay: `${idx * 120}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${item.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative z-10 mb-3 lg:mb-4">
                <span className="text-base font-semibold text-slate-800 lg:text-lg">
                  {item.label}
                </span>
              </div>
              <h3 className={`text-3xl lg:text-4xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent mb-2 animate-count-up relative z-10`}>
                {item.value}
              </h3>
              <p className="relative z-10 text-xs lg:text-sm text-slate-600">
                Обновлено сегодня
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
