import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config";

export default function AdminPostPage() {
  const { user, authFetch } = useAuth();
  const isOrg = user?.role === "org";

  const [type, setType] = useState("info"); // info | event
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageSource, setImageSource] = useState("file"); // file | url
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null); // {type, message}
  const [formTitle, setFormTitle] = useState("");
  const [formFields, setFormFields] = useState([]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const addFormField = () => {
    setFormFields((prev) => [
      ...prev,
      {
        id: Date.now(),
        label: "",
        field_type: "text",
        is_required: false,
        options: "",
      },
    ]);
  };

  const updateFormField = (id, key, value) => {
    setFormFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [key]: value } : f))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isOrg) {
      showToast("error", "Создавать посты может только организация");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("type", type);
      formData.append("title", title);
      formData.append("content", content);
      if (imageSource === "url") formData.append("image_url", imageUrl?.trim() || "");
      formData.append("is_form", type === "event" ? "true" : "false");
      formData.append("club", (user?.orgId || user?.id || "").toString());
      if (imageSource === "file" && imageFile) formData.append("image_file", imageFile);

      const res = await authFetch(`${API_BASE_URL}/api/posts/`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.detail || "Не удалось создать пост");
      }

      if (type === "event" && formFields.length > 0 && data?.id) {
        const baseHeaders = {
          "Content-Type": "application/json",
        };

        const formRes = await authFetch(`${API_BASE_URL}/api/registration-forms/`, {
          method: "POST",
          headers: baseHeaders,
          body: JSON.stringify({
            title: formTitle?.trim() || title,
            post: data.id,
          }),
        });
        const formData = await formRes.json().catch(() => null);
        if (!formRes.ok) {
          throw new Error(
            formData?.detail || "Не удалось сохранить форму регистрации"
          );
        }

        for (let i = 0; i < formFields.length; i += 1) {
          const field = formFields[i];
          const fieldRes = await authFetch(
            `${API_BASE_URL}/api/registration-fields/`,
            {
              method: "POST",
              headers: baseHeaders,
              body: JSON.stringify({
                label: field.label?.trim() || `Вопрос ${i + 1}`,
                field_type: field.field_type || "text",
                is_required: !!field.is_required,
                sort_order: i,
                options: field.options?.trim() || "",
                form: formData?.id,
              }),
            }
          );
          const fieldData = await fieldRes.json().catch(() => null);
          if (!fieldRes.ok) {
            throw new Error(
              fieldData?.detail || "Не удалось сохранить поля формы"
            );
          }
        }
      }

      showToast("success", "Пост опубликован");
      setTitle("");
      setContent("");
      setImageUrl("");
      setImageFile(null);
      setImageSource("file");
      setType("info");
      setFormTitle("");
      setFormFields([]);
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
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-sm font-semibold text-primary">
              Панель организации
            </p>
            <h1 className="text-2xl font-bold lg:text-3xl text-slate-900">
              Создание поста
            </h1>
          </div>
          <div className="flex items-center gap-2 p-1 border bg-slate-100/70 border-slate-200 rounded-xl">
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
            <label className="text-sm font-semibold text-slate-700">
              Заголовок
            </label>
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
            <label className="text-sm font-semibold text-slate-700">
              Описание
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Добавьте подробности поста или мероприятия..."
              className="w-full px-4 py-3 transition-all duration-300 bg-white border-2 shadow-sm resize-none h-36 rounded-xl border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary hover:shadow-md"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Картинка
            </label>
            <div className="inline-flex items-center gap-2 p-1 ml-2 border bg-slate-100/70 border-slate-200 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setImageSource("file");
                  setImageUrl("");
                }}
                className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  imageSource === "file"
                    ? "bg-gradient-to-r from-primary via-purple-600 to-indigo-600 text-white shadow-md"
                    : "text-slate-700 hover:bg-white"
                }`}
              >
                Файлом
              </button>
              <button
                type="button"
                onClick={() => {
                  setImageSource("url");
                  setImageFile(null);
                }}
                className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  imageSource === "url"
                    ? "bg-gradient-to-r from-primary via-purple-600 to-indigo-600 text-white shadow-md"
                    : "text-slate-700 hover:bg-white"
                }`}
              >
                По ссылке
              </button>
            </div>
          </div>

          {imageSource === "url" && (
            <div className="space-y-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full h-[52px] px-4 py-3 transition-all duration-300 bg-white border-2 shadow-sm rounded-xl border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary hover:shadow-md"
              />
              <p className="text-xs text-slate-500 min-h-[1rem]">{"\u00A0"}</p>
            </div>
          )}

          {imageSource === "file" && (
            <div className="space-y-2">
              <input
                id="post-image-file"
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (!file.type?.startsWith("image/")) {
                    showToast("error", "Выбери изображение (png/jpg/webp и т.п.)");
                    e.target.value = "";
                    return;
                  }
                  setImageUrl("");
                  setImageFile(file);
                }}
                className="hidden"
              />
              <label
                htmlFor="post-image-file"
                className="w-full h-[52px] inline-flex items-center justify-center px-4 py-3 font-semibold text-white rounded-xl border-2 border-transparent bg-gradient-to-r from-primary via-purple-600 to-indigo-600 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all cursor-pointer select-none"
              >
                Выбрать файл
              </label>
              <p className="text-xs text-slate-500 min-h-[1rem]">
                {imageFile ? `Выбрано: ${imageFile.name}` : "\u00A0"}
              </p>
            </div>
          )}

          {type === "event" && (
            <div className="p-4 space-y-3 border rounded-xl border-slate-200 bg-slate-50/70">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Форма регистрации
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addFormField}
                  className="px-3 py-1.5 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-primary via-purple-600 to-indigo-600 shadow-md hover:shadow-lg transition"
                >
                  Добавить вопрос
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Заголовок формы (опционально)
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Регистрация на мероприятие"
                    className="w-full px-3 py-2 bg-white border-2 rounded-lg border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                {formFields.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Вопросы пока не добавлены. Нажмите «Добавить вопрос».
                  </p>
                ) : (
                  formFields.map((field, idx) => (
                    <div
                      key={field.id}
                      className="p-3 bg-white border shadow-sm rounded-xl border-slate-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-slate-800">
                          Вопрос {idx + 1}
                        </span>
                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <input
                            type="checkbox"
                            checked={field.is_required}
                            onChange={(e) =>
                              updateFormField(
                                field.id,
                                "is_required",
                                e.target.checked
                              )
                            }
                            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                          />
                          Обязательный
                        </label>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700">
                            Текст вопроса
                          </label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) =>
                              updateFormField(field.id, "label", e.target.value)
                            }
                            placeholder="Например: ФИО"
                            className="w-full px-3 py-2 bg-white border-2 rounded-lg border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700">
                            Тип поля
                          </label>
                          <select
                            value={field.field_type}
                            onChange={(e) =>
                              updateFormField(
                                field.id,
                                "field_type",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 bg-white border-2 rounded-lg border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                          >
                            <option value="text">Текст</option>
                            <option value="number">Число</option>
                            <option value="date">Дата</option>
                            <option value="email">E-mail</option>
                            <option value="phone">Телефон</option>
                            <option value="select">Список</option>
                          </select>
                        </div>
                      </div>

                      {field.field_type === "select" && (
                        <div className="mt-3 space-y-1">
                          <label className="text-xs font-semibold text-slate-700">
                            Варианты ответа (через запятую или JSON массив)
                          </label>
                          <input
                            type="text"
                            value={field.options}
                            onChange={(e) =>
                              updateFormField(
                                field.id,
                                "options",
                                e.target.value
                              )
                            }
                            placeholder="Например: Да,Нет,Не знаю"
                            className="w-full px-3 py-2 bg-white border-2 rounded-lg border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                        </div>
                      )}
                    </div>
                  ))
                )}
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
