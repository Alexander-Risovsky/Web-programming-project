import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        student_name: form.firstName.trim(),
        student_surname: form.lastName.trim(),
      };

      const res = await fetch("/api/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type") || "";
      const isJson = contentType.toLowerCase().includes("application/json");
      const data = isJson ? await res.json() : null;

      if (!res.ok) {
        throw new Error(
          data?.detail || data?.error || "Не удалось зарегистрироваться"
        );
      }

      navigate("/login");
    } catch (err) {
      alert(err.message || "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tl from-[rgba(98,90,228,0.15)] via-[rgba(139,92,246,0.1)] to-[rgba(255,255,255,1)] animate-gradient pointer-events-none" />
      <div className="absolute hidden bg-purple-300 rounded-full pointer-events-none lg:block top-20 right-20 w-72 h-72 mix-blend-multiply filter blur-xl opacity-20 animate-float" />
      <div
        className="absolute hidden bg-blue-300 rounded-full pointer-events-none lg:block bottom-20 left-20 w-96 h-96 mix-blend-multiply filter blur-xl opacity-20 animate-float"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute hidden bg-indigo-300 rounded-full pointer-events-none lg:block top-1/2 left-1/2 w-80 h-80 mix-blend-multiply filter blur-xl opacity-10 animate-float"
        style={{ animationDelay: "4s" }}
      />

      <header className="relative z-10 flex flex-col items-center justify-center w-full gap-2 p-4 border-b sm:flex-row sm:gap-3 sm:p-6 border-slate-200/30 bg-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <img
              src="/Logo.svg"
              alt="Логотип"
              className="object-cover w-8 h-8 sm:w-10 sm:h-10"
            />
            <div className="absolute inset-0 transition-opacity duration-300 rounded-full opacity-0 bg-primary/20 blur-md hover:opacity-100" />
          </div>
          <span className="text-xl font-black text-transparent sm:text-2xl bg-gradient-to-r from-slate-800 via-primary to-purple-600 bg-clip-text">
            HSE Flow
          </span>
        </div>
        <span className="hidden text-2xl font-medium sm:inline text-slate-400">
          -
        </span>
        <span className="text-sm font-medium text-center sm:text-lg text-slate-600 sm:text-left">
          Создайте аккаунт в системе HSE Flow
        </span>
      </header>

      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] sm:min-h-[calc(100vh-80px)] px-4 py-8 sm:py-12">
        <div className="relative w-full max-w-md p-6 overflow-hidden border-2 shadow-xl bg-white/90 backdrop-blur-sm sm:p-8 lg:p-10 rounded-2xl lg:rounded-3xl border-slate-200/50 animate-scale-in group">
          <div className="absolute top-0 right-0 hidden w-64 h-64 rounded-full pointer-events-none lg:block bg-gradient-to-br from-primary/10 to-purple-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 hidden w-64 h-64 rounded-full pointer-events-none lg:block bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-6 text-center sm:mb-8">
              <h1 className="mb-2 text-2xl font-bold text-transparent sm:text-3xl bg-gradient-to-r from-primary via-purple-600 to-indigo-600 bg-clip-text">
                Регистрация
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                Заполните поля, чтобы создать аккаунт
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col space-y-4 sm:space-y-5"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Имя
                  </label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={handleChange("firstName")}
                    placeholder="Имя"
                    className="w-full px-4 py-3 transition-all duration-300 bg-white border-2 shadow-sm rounded-xl border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary hover:shadow-md"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Фамилия
                  </label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={handleChange("lastName")}
                    placeholder="Фамилия"
                    className="w-full px-4 py-3 transition-all duration-300 bg-white border-2 shadow-sm rounded-xl border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary hover:shadow-md"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Логин
                  </label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={handleChange("username")}
                    placeholder="Введите логин"
                    className="w-full px-4 py-3 transition-all duration-300 bg-white border-2 shadow-sm rounded-xl border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary hover:shadow-md"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Пароль
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={handleChange("password")}
                    placeholder="Введите пароль"
                    className="w-full px-4 py-3 transition-all duration-300 bg-white border-2 shadow-sm rounded-xl border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary hover:shadow-md"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  E-mail
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  placeholder="Введите e-mail"
                  className="w-full px-4 py-3 transition-all duration-300 bg-white border-2 shadow-sm rounded-xl border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary hover:shadow-md"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="relative w-full py-3.5 sm:py-4 bg-gradient-to-r from-primary via-purple-600 to-indigo-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] opacity-0 group-hover:translate-x-[100%] group-hover:opacity-100 transition-all duration-700" />
                <span className="relative z-10">
                  {loading ? "Создаем аккаунт..." : "Зарегистрироваться"}
                </span>
              </button>
            </form>

            <p className="mt-4 text-sm text-center text-slate-600">
              Уже есть аккаунт?{" "}
              <Link
                to="/login"
                className="font-semibold text-primary hover:underline"
              >
                Войти
              </Link>
            </p>
            <p className="mt-2 text-xs text-center text-slate-400">
              <Link
                to="/org/register"
                className="transition-colors hover:text-primary"
              >
                Регистрация для организации
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
