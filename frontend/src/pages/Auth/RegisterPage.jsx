import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {API_BASE_URL} from "../../config"
export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // { type, message }
  const navigate = useNavigate();

  const handleChange = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToast(null);

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const username = form.username.trim();
    const email = form.email.trim();
    const password = form.password;

    if (!firstName || !lastName || !username || !email || !password) {
      showToast("error", "Заполните все обязательные поля.");
      return;
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      showToast("error", "Введите корректный e-mail.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        username,
        email,
        password,
        student_name: firstName,
        student_surname: lastName,
      };

      const res = await fetch(`${API_BASE_URL}/api/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type") || "";
      const isJson = contentType.toLowerCase().includes("application/json");
      const data = isJson ? await res.json() : null;

      if (!res.ok) {
        const message =
          data?.detail ||
          data?.error ||
          data?.username?.[0] ||
          data?.email?.[0] ||
          data?.password?.[0] ||
          "Не удалось зарегистрироваться";
        throw new Error(message);
      }

      navigate("/login");
    } catch (err) {
      showToast("error", err.message || "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen overflow-hidden flex flex-col">
      {toast && (
        <div className="fixed inset-x-0 top-3 z-[50000] flex justify-center pointer-events-none animate-slide-up">
          <div
            className={`px-5 py-3 rounded-xl shadow-lg text-white pointer-events-auto ${
              toast.type === "success" ? "bg-emerald-500" : "bg-rose-500"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
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

      <div className="relative z-10 flex-1 min-h-0 flex items-center justify-center px-4 py-6">
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
              noValidate
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
