import React from "react";
import { Link } from "react-router-dom";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-center gap-3 p-6 border-b border-slate-200 bg-slate-100">
        <div className="flex items-center gap-3">
          <img
            src="/Logo.svg"
            alt="Логотип"
            className="w-10 h-10 object-cover"
          />
          <span className="text-2xl font-bold text-slate-800 italic">
            HSE Flow
          </span>
        </div>

        <span className="text-2xl font-medium text-slate-800 italic">-</span>
        <span className="text-2xl font-medium text-slate-800 italic">
          Все любимые мероприятия Вышки в одном месте!
        </span>
      </header>

      {/* Центрированная форма */}
      <div className="flex items-center justify-center mt-28 px-4">
        <div className="bg-slate-100 p-8 rounded-3xl shadow-lg w-full max-w-md border-2 border-slate-200">
          <h1 className="text-2xl font-bold mb-6 text-center text-accent">
            Вход
          </h1>

          <form className="flex flex-col space-y-4">
            <input
              type="email"
              placeholder="E-mail"
              className="p-3 rounded-full pl-4 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300 shadow-md hover:shadow-lg"
            />
            <input
              type="password"
              placeholder="Пароль"
              className="p-3 rounded-full pl-4 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300 shadow-md hover:shadow-lg"
            />
            <Link to="/" className="w-full block">
              <button
                type="submit"
                className="w-full py-3 bg-primary text-white hover:bg-primaryHover rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Войти
              </button>
            </Link>
          </form>

          <p className="mt-4 text-sm text-center text-slate-400">
            Нет аккаунта?{" "}
            <Link
              to="/register"
              className="text-primary hover:underline transition-all"
            >
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
