import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL, buildMediaUrl } from "../config";
export default function OrganizationPage() {
  const { orgId } = useParams();
  const { user } = useAuth();

  const [club, setClub] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingClub, setLoadingClub] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [subsLoading, setSubsLoading] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [notifyOn, setNotifyOn] = useState(false);
  const [formFields, setFormFields] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [answers, setAnswers] = useState({});
  const [formId, setFormId] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // загрузка клуба
  useEffect(() => {
    const loadClub = async () => {
      setLoadingClub(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/clubs/${orgId}/`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setClub(data);
      } catch {
        setClub(null);
      } finally {
        setLoadingClub(false);
      }
    };
    if (orgId) loadClub();
  }, [orgId]);

  // загрузка постов клуба
  useEffect(() => {
    const loadPosts = async () => {
      setLoadingPosts(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/posts/`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        const filtered = Array.isArray(data)
          ? data.filter((p) => p.club === Number(orgId))
          : [];
        setPosts(filtered);
      } catch {
        setPosts([]);
      } finally {
        setLoadingPosts(false);
      }
    };
    if (orgId) loadPosts();
  }, [orgId]);

  // загрузка подписки на клуб для текущего студента
  useEffect(() => {
    const loadSub = async () => {
      if (user?.role !== "student" || !user?.id) {
        setSubscriptionId(null);
        return;
      }
      setSubsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/subscriptions/`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        const found = Array.isArray(data)
          ? data.find(
              (s) => s.user === user.id && s.club === Number(orgId)
            )
          : null;
        setSubscriptionId(found ? found.id : null);
      } catch {
        setSubscriptionId(null);
      } finally {
        setSubsLoading(false);
      }
    };
    if (orgId) loadSub();
  }, [orgId, user]);

  const orgPosts = useMemo(
    () =>
      posts
        .slice()
        .sort(
          (a, b) =>
            new Date(b.published_at || b.date || 0) -
            new Date(a.published_at || a.date || 0)
        ),
    [posts]
  );

  const currentUser = {
    name:
      user?.studentProfile?.name && user?.studentProfile?.surname
        ? `${user.studentProfile.name} ${user.studentProfile.surname}`
        : user?.username || "",
    group: user?.studentProfile?.group || "",
    course: user?.studentProfile?.course || "",
    email: user?.email || "",
  };

  const getFieldOptions = (field) => {
    if (!field?.options) return [];
    try {
      const parsed = JSON.parse(field.options);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      // ignore parse errors, fall back to comma split
    }
    return field.options
      .split(",")
      .map((opt) => opt.trim())
      .filter(Boolean);
  };

  const loadFormForPost = async (postId) => {
    setFormLoading(true);
    setFormError("");
    try {
      const formsRes = await fetch(`${API_BASE_URL}/api/registration-forms/`);
      const formsData = await formsRes.json().catch(() => null);
      const form = Array.isArray(formsData)
        ? formsData.find((f) => f.post === postId)
        : null;

      if (!form?.id) {
        setFormId(null);
        setFormFields([]);
        setFormError("Для этого поста форма регистрации не настроена");
      } else {
        setFormId(form.id);

        const fieldsRes = await fetch(`${API_BASE_URL}/api/registration-fields/`);
        const fieldsData = await fieldsRes.json().catch(() => null);
        const fields = Array.isArray(fieldsData)
          ? fieldsData
              .filter((f) => f.form === form.id)
              .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
          : [];

        setFormFields(fields);
        const initialAnswers = {};
        fields.forEach((f) => {
          initialAnswers[f.id] = "";
        });
        setAnswers(initialAnswers);
      }
    } catch (err) {
      console.error(err);
      setFormId(null);
      setFormFields([]);
      setFormError("Не удалось загрузить форму регистрации");
    } finally {
      setFormLoading(false);
    }
  };

  const handleAnswerChange = (fieldId, value) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  };

  const openModal = (post) => {
    setSelectedPost(post);
    setFormFields([]);
    setAnswers({});
    setFormError("");
    setFormId(null);
    setModalOpen(true);
    if (post?.id) {
      loadFormForPost(post.id);
    }
  };

  const closeModal = () => {
    setSelectedPost(null);
    setModalOpen(false);
    setFormFields([]);
    setAnswers({});
    setFormError("");
    setFormId(null);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!selectedPost || !formId || !user?.id) {
      setFormError("Форма недоступна для отправки");
      return;
    }

    setSubmitLoading(true);
    setFormError("");

    try {
      const baseHeaders = {
        "Content-Type": "application/json",
        ...(user?.access ? { Authorization: `Bearer ${user.access}` } : {}),
      };

      const submissionRes = await fetch(
        `${API_BASE_URL}/api/registration-submissions/`,
        {
          method: "POST",
          headers: baseHeaders,
          credentials: "include",
          body: JSON.stringify({ user: user.id, form: formId }),
        }
      );
      const submissionData = await submissionRes.json().catch(() => null);
      if (!submissionRes.ok) {
        throw new Error(
          submissionData?.detail || "Не удалось отправить заявку"
        );
      }

      const submissionId = submissionData?.id;

      for (const field of formFields) {
        const value = answers[field.id] ?? "";
        const answerRes = await fetch(
          `${API_BASE_URL}/api/registration-answers/`,
          {
            method: "POST",
            headers: baseHeaders,
            credentials: "include",
            body: JSON.stringify({
              value_text: value?.toString() ?? "",
              submission: submissionId,
              field: field.id,
            }),
          }
        );
        const answerData = await answerRes.json().catch(() => null);
        if (!answerRes.ok) {
          throw new Error(
            answerData?.detail || "Не удалось сохранить ответы формы"
          );
        }
      }

      closeModal();
      setToast({ type: "success", message: "Регистрация на мероприятие успешна" });
      setTimeout(() => setToast(null), 3500);
    } catch (err) {
      setFormError(err.message || "Не удалось отправить заявку");
      setToast({
        type: "error",
        message: "Не удалось подписаться на организацию",
      });
      setTimeout(() => setToast(null), 3500);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSubscribeToggle = async () => {
    if (user?.role !== "student" || !user?.id || !club) return;
    try {
      setSubsLoading(true);
      if (!subscriptionId) {
        // subscribe
        const res = await fetch(`${API_BASE_URL}/api/subscriptions/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: user.id, club: Number(orgId) }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.detail || "Ошибка подписки");
        setSubscriptionId(data?.id || Date.now());
      } else {
        // unsubscribe
        await fetch(`${API_BASE_URL}/api/subscriptions/${subscriptionId}/`, {
          method: "DELETE",
        });
        setSubscriptionId(null);
      }
      window.dispatchEvent(new Event("subscriptions-updated"));
    } catch (err) {
      console.error(err);
    } finally {
      setSubsLoading(false);
    }
  };

  if (loadingClub) {
    return (
      <section className="max-w-4xl mx-auto">
        <div className="p-6 glass-card">Загрузка организации...</div>
      </section>
    );
  }

  if (!club) {
    return (
      <section className="max-w-4xl mx-auto">
        <div className="p-6 glass-card">
          <h1 className="mb-4 text-2xl font-bold">Организация не найдена</h1>
          <p className="text-slate-600">
            Проверьте ссылку или выберите другую организацию.
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      {toast &&
        createPortal(
          <div className="fixed inset-x-0 top-3 z-[12000] flex justify-center pointer-events-none animate-slide-up">
            <div
              className={`px-5 py-3 rounded-xl shadow-lg text-white pointer-events-auto ${
                toast.type === "success" ? "bg-emerald-500" : "bg-rose-500"
              }`}
            >
              {toast.message}
            </div>
          </div>,
          document.body
        )}

      <section className="max-w-5xl mx-auto space-y-5">
      <div className="flex flex-col items-center gap-5 p-6 glass-card lg:p-8 sm:flex-row sm:items-start">
        <img
          src={buildMediaUrl(club.avatar_url) || "/OrganizationLogo/DefaultLogo.jpg"}
          alt={club.name}
          className="object-cover w-24 h-24 border shadow-md rounded-2xl border-slate-200"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/OrganizationLogo/DefaultLogo.jpg";
          }}
        />
        <div className="flex-1 space-y-2">
          <p className="text-sm font-semibold text-primary">Организация</p>
          <h1 className="text-3xl font-bold text-slate-900">{club.name}</h1>
          <p className="text-slate-600">{club.description}</p>
          {user?.role !== "org" && (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSubscribeToggle}
                disabled={subsLoading || user?.role !== "student"}
                className={`px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg ${
                  subscriptionId
                    ? "border-2 border-primary text-primary bg-white hover:bg-primary/5"
                    : "bg-gradient-to-r from-primary via-purple-600 to-indigo-600 text-white hover:shadow-xl hover:scale-[1.02]"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {subscriptionId ? "Отписаться" : "Подписаться"}
              </button>
              <button
                onClick={() => setNotifyOn((v) => !v)}
                className={`px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                  notifyOn
                    ? "bg-white/90 border-2 border-primary/40 text-primary hover:bg-primary/5"
                    : " border-2 text-slate-600 bg-slate-100 border-slate-200 hover:bg-slate-200"
                }`}
              >
                {notifyOn ? "Уведомления включены" : "Включить уведомления"}
              </button>
            </div>
          )}
        </div>
      </div>

      {loadingPosts ? (
        <div className="p-5 border rounded-xl bg-slate-50 text-slate-600">
          Загрузка постов...
        </div>
      ) : orgPosts.length > 0 ? (
        <div className="space-y-4">
          {orgPosts.map((post, idx) => (
            <article
              key={post.id}
              className="p-5 transition-shadow border shadow-sm lg:p-6 bg-white/90 border-slate-200 rounded-2xl hover:shadow-md animate-slide-up"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-slate-900">
                  {post.title}
                </h2>
                <span className="text-xs text-slate-500">
                  {new Date(post.published_at || post.date).toLocaleDateString(
                    "ru-RU"
                  )}
                </span>
              </div>
              <p className="mb-3 text-slate-700">{post.content}</p>
              {post.image_url && (
                <img
                  src={buildMediaUrl(post.image_url) || post.image_url}
                  alt={post.title}
                  className="object-cover w-full mb-3 h-60 rounded-xl"
                />
              )}
              {post.type === "event" || post.is_form ? (
                <div className="flex justify-end">
                  <button
                    onClick={() => openModal(post)}
                    className="px-4 py-2 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-primary via-purple-600 to-indigo-600 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
                  >
                    Зарегистрироваться
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="p-5 border rounded-xl bg-slate-50">
          <h2 className="font-semibold">Постов пока нет</h2>
          <p className="mt-2 text-sm text-slate-600">
            Здесь появятся публикации организации.
          </p>
        </div>
      )}

      {modalOpen && selectedPost &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 w-screen h-screen"
            onClick={closeModal}
          >
            <div
              className="relative w-full max-w-md p-6 bg-white shadow-2xl rounded-2xl animate-slide-up"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-2 text-xl font-bold text-slate-900">
                Регистрация на мероприятие
              </h3>
              <p className="mb-4 text-sm text-slate-600">{selectedPost.title}</p>

              <form className="space-y-3" onSubmit={handleRegister}>
                {formLoading ? (
                  <p className="text-sm text-slate-600">Загружаем вопросы формы...</p>
                ) : formError ? (
                  <div className="p-3 text-sm text-rose-600 bg-rose-50 rounded-lg border border-rose-200">
                    {formError}
                  </div>
                ) : formFields.length === 0 ? (
                  <p className="text-sm text-slate-600">
                    Форма регистрации пока не заполнена.
                  </p>
                ) : (
                  formFields.map((field) => {
                    const options = getFieldOptions(field);
                    const inputType =
                      field.field_type === "number"
                        ? "number"
                        : field.field_type === "date"
                        ? "date"
                        : field.field_type === "email"
                        ? "email"
                        : field.field_type === "phone"
                        ? "tel"
                        : "text";
                    return (
                      <div key={field.id} className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600">
                          {field.label} {field.is_required ? "*" : ""}
                        </label>
                        {field.field_type === "select" ? (
                          <select
                            value={answers[field.id] ?? ""}
                            onChange={(e) =>
                              handleAnswerChange(field.id, e.target.value)
                            }
                            required={!!field.is_required}
                            className="w-full px-3 py-2 border-2 rounded-lg border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                          >
                            <option value="">Выберите вариант</option>
                            {options.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={inputType}
                            value={answers[field.id] ?? ""}
                            onChange={(e) =>
                              handleAnswerChange(field.id, e.target.value)
                            }
                            required={!!field.is_required}
                            className="w-full px-3 py-2 border-2 rounded-lg border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                        )}
                      </div>
                    );
                  })
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-semibold transition border text-slate-600 rounded-xl bg-slate-100 border-slate-200 hover:bg-slate-200"
                  >
                    Закрыть
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading || formLoading || !!formError || !formId}
                    className="px-4 py-2 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-primary via-purple-600 to-indigo-600 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitLoading ? "Отправляем..." : "Зарегистрироваться"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </section>
    </>
  );
}
