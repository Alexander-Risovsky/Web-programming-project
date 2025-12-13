import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginStudent } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await loginStudent(username, password);
      if (!result?.success) {
        throw new Error(result?.error || "Не удалось войти. Проверьте данные.");
      }
      navigate("/");
    } catch (err) {
      setError(err.message || "Не удалось войти. Проверьте данные.");
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
          Вход в систему HSE Flow. Используйте свой логин и пароль.
        </span>
      </header>

      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] sm:min-h-[calc(100vh-80px)] px-4 py-8 sm:py-12">
        <div className="relative w-full max-w-md p-6 overflow-hidden border-2 shadow-xl bg-white/90 backdrop-blur-sm sm:p-8 lg:p-10 rounded-2xl lg:rounded-3xl border-slate-200/50 animate-scale-in group">
          <div className="absolute top-0 right-0 hidden w-64 h-64 rounded-full pointer-events-none lg:block bg-gradient-to-br from-primary/10 to-purple-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 hidden w-64 h-64 rounded-full pointer-events-none lg:block bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-6 text-center sm:mb-8">
              <h1 className="mb-2 text-2xl font-bold text-transparent sm:text-3xl bg-gradient-to-r from-primary via-purple-600 to-indigo-600 bg-clip-text">
                Вход
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                Введите логин и пароль, чтобы продолжить
              </p>
            </div>

            {error && (
              <div className="p-4 mb-6 text-red-700 border-2 border-red-200 bg-red-50 rounded-xl animate-slide-up">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="flex flex-col space-y-4 sm:space-y-5"
            >
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Логин
                </label>
                <div className="relative">
                  <div className="absolute -translate-y-1/2 left-3 sm:left-4 top-1/2">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Введите логин"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 text-base rounded-xl bg-white border-2 border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Пароль
                </label>
                <div className="relative">
                  <div className="absolute -translate-y-1/2 left-3 sm:left-4 top-1/2">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    type="password"
                    placeholder="Введите пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 text-base rounded-xl bg-white border-2 border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-primary via-purple-600 to-indigo-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group text-base"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-120%] opacity-0 group-hover:translate-x-[120%] group-hover:opacity-100 transition-all duration-700 will-change-transform" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-b-2 border-white rounded-full animate-spin" />
                      <span>Входим...</span>
                    </>
                  ) : (
                    <>
                      <span>Войти</span>
                      <svg
                        className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </>
                  )}
                </span>
              </button>
            </form>

            <p className="mt-4 text-sm text-center text-slate-600">
              Нет аккаунта?{" "}
              <Link
                to="/register"
                className="font-semibold text-primary hover:underline"
              >
                Зарегистрироваться
              </Link>
            </p>
            <p className="mt-2 text-xs text-center text-slate-400">
              <Link
                to="/org/login"
                className="transition-colors hover:text-primary"
              >
                Вход для организации
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
