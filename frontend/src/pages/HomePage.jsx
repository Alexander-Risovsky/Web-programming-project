import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { API_BASE_URL, buildMediaUrl } from "../config";
import { useAuth } from "../context/AuthContext";
import { dedupFetch } from "../utils/dedupFetch";

export default function HomePage() {
  const { user, authFetch } = useAuth();
  const authUserId = user?.role === "student" ? (user?.userId ?? user?.id) : user?.id;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [formFields, setFormFields] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [answers, setAnswers] = useState({});
  const [formId, setFormId] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [registeredPostIds, setRegisteredPostIds] = useState(new Set());
  const [registrationMetaByPostId, setRegistrationMetaByPostId] = useState(new Map());
  const [registrationsVersion, setRegistrationsVersion] = useState(0);
  const [modalMode, setModalMode] = useState("create"); // create | view
  const [viewSubmissionId, setViewSubmissionId] = useState(null);

  useEffect(() => {
    const handler = () => setRegistrationsVersion((v) => v + 1);
    window.addEventListener("registrations-updated", handler);
    return () =>
      window.removeEventListener("registrations-updated", handler);
  }, []);

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      setError("");
      try {
        // В dev проксируется через vite.config.js на бекенд http://localhost:8000
        const res = await dedupFetch(`${API_BASE_URL}/api/posts/`);
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

  useEffect(() => {
    const loadRegistrations = async () => {
      if (user?.role !== "student" || !authUserId) {
        setRegisteredPostIds(new Set());
        setRegistrationMetaByPostId(new Map());
        return;
      }
      try {
        const subsRes = await authFetch(
          `${API_BASE_URL}/api/registration-submissions/`,
          { credentials: "include" }
        );
        const submissions = await subsRes.json().catch(() => []);
        const userSubs = Array.isArray(submissions)
          ? submissions.filter((s) => s.user === authUserId)
          : [];
        if (userSubs.length === 0) {
          setRegisteredPostIds(new Set());
          setRegistrationMetaByPostId(new Map());
          return;
        }

        const formsRes = await authFetch(`${API_BASE_URL}/api/registration-forms/`, {
          credentials: "include",
        });
        const forms = await formsRes.json().catch(() => []);
        const formIdSet = new Set(userSubs.map((s) => s.form));

        const formsById = new Map(
          (Array.isArray(forms) ? forms : []).map((f) => [f.id, f])
        );
        const postIds = [];
        const meta = new Map();
        userSubs.forEach((s) => {
          const form = formsById.get(s.form);
          if (!form?.post) return;
          postIds.push(form.post);
          if (!meta.has(form.post)) {
            meta.set(form.post, { submissionId: s.id, formId: s.form });
          }
        });

        setRegisteredPostIds(new Set(postIds));
        setRegistrationMetaByPostId(meta);
      } catch {
        setRegisteredPostIds(new Set());
        setRegistrationMetaByPostId(new Map());
      }
    };
    loadRegistrations();
  }, [user?.role, user?.access, authUserId, registrationsVersion, authFetch]);

  const feed = useMemo(
    () =>
      [...posts].sort(
        (a, b) =>
          new Date(b.published_at || b.date || 0).getTime() -
          new Date(a.published_at || a.date || 0).getTime()
      ),
    [posts]
  );

  const getFieldOptions = (field) => {
    if (!field?.options) return [];
    try {
      const parsed = JSON.parse(field.options);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      // ignore
    }
    return field.options
      .split(",")
      .map((opt) => opt.trim())
      .filter(Boolean);
  };

  const loadFormForPost = async (post, nextMode, submissionId) => {
    if (!post?.id) return;
    setFormLoading(true);
    setFormError("");
    setFormFields([]);
    setFormId(null);
    setAnswers({});
    try {
      const formsRes = await authFetch(`${API_BASE_URL}/api/registration-forms/?post=${post.id}`, {
        credentials: "include",
      });
      const formsData = await formsRes.json().catch(() => null);
      const form = Array.isArray(formsData) ? formsData[0] : formsData;

      if (!form?.id) {
        setFormError("Для этого поста форма регистрации не настроена");
        return;
      }

      setFormId(form.id);

      const fieldsPromise = authFetch(
        `${API_BASE_URL}/api/registration-fields/?form=${form.id}${
          nextMode === "create" ? "&active=1" : ""
        }`,
        { credentials: "include" }
      )
        .then((r) => r.json().catch(() => null))
        .catch(() => null);

      const answersPromise =
        nextMode === "view" && submissionId
          ? authFetch(
              `${API_BASE_URL}/api/registration-answers/?submission=${submissionId}`,
              { credentials: "include" }
            )
              .then((r) => r.json().catch(() => []))
              .catch(() => [])
          : Promise.resolve([]);

      const [fieldsData, answersData] = await Promise.all([
        fieldsPromise,
        answersPromise,
      ]);

      const sortedFields = Array.isArray(fieldsData)
        ? fieldsData
            .slice()
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        : [];
      const fields =
        nextMode === "create"
          ? sortedFields.filter((f) => f?.is_active !== false)
          : sortedFields;

      setFormFields(fields);
      const initialAnswers = Object.fromEntries(fields.map((f) => [f.id, ""]));

      (Array.isArray(answersData) ? answersData : []).forEach((ans) => {
        if (ans?.field) initialAnswers[ans.field] = ans.value_text || "";
      });

      setAnswers(initialAnswers);
    } catch (err) {
      setFormError("Не удалось загрузить форму регистрации");
    } finally {
      setFormLoading(false);
    }
  };

  const handleAnswerChange = (fieldId, value) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  };

  const openRegisterModal = (post) => {
    setSelectedPost(post);
    setModalMode("create");
    setViewSubmissionId(null);
    setModalOpen(true);
    loadFormForPost(post, "create", null);
  };

  const openViewModal = (post) => {
    const meta = registrationMetaByPostId.get(post.id);
    const submissionId = meta?.submissionId ?? null;
    setSelectedPost(post);
    setModalMode("view");
    setViewSubmissionId(submissionId);
    setModalOpen(true);
    loadFormForPost(post, "view", submissionId);
  };

  const closeModal = () => {
    setSelectedPost(null);
    setModalOpen(false);
    setFormFields([]);
    setAnswers({});
    setFormId(null);
    setFormError("");
    setSubmitLoading(false);
    setModalMode("create");
    setViewSubmissionId(null);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (modalMode !== "create") return;
    if (!selectedPost || !formId || !authUserId) {
      setFormError("Форма недоступна для отправки");
      return;
    }
    setSubmitLoading(true);
    setFormError("");
    try {
      const baseHeaders = {
        "Content-Type": "application/json",
      };

      const submissionRes = await authFetch(
        `${API_BASE_URL}/api/registration-submissions/`,
        {
          method: "POST",
          headers: baseHeaders,
          credentials: "include",
          body: JSON.stringify({ user: authUserId, form: formId }),
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
        const answerRes = await authFetch(
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

      if (selectedPost?.id) {
        setRegisteredPostIds((prev) => new Set([...prev, selectedPost.id]));
        setRegistrationMetaByPostId((prev) => {
          const next = new Map(prev);
          next.set(selectedPost.id, { submissionId, formId });
          return next;
        });
        window.dispatchEvent(new Event("registrations-updated"));
      }

      closeModal();
      setToast({
        type: "success",
        message: "Регистрация на мероприятие успешна",
      });
      setTimeout(() => setToast(null), 3500);
    } catch (err) {
      setFormError(err.message || "Не удалось отправить заявку");
      setToast({
        type: "error",
        message: "Не удалось зарегистрироваться на мероприятие",
      });
      setTimeout(() => setToast(null), 3500);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (modalMode !== "view" || !selectedPost?.id) return;
    if (!viewSubmissionId) {
      setFormError("Не удалось найти вашу заявку");
      return;
    }
    setSubmitLoading(true);
    setFormError("");
    try {
      const res = await authFetch(
        `${API_BASE_URL}/api/registration-submissions/${viewSubmissionId}/`,
        { method: "DELETE", credentials: "include" }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || `Ошибка удаления: ${res.status}`);
      }

      setRegisteredPostIds((prev) => {
        const next = new Set(prev);
        next.delete(selectedPost.id);
        return next;
      });
      setRegistrationMetaByPostId((prev) => {
        const next = new Map(prev);
        next.delete(selectedPost.id);
        return next;
      });
      window.dispatchEvent(new Event("registrations-updated"));

      closeModal();
      setToast({ type: "success", message: "Регистрация отменена" });
      setTimeout(() => setToast(null), 3500);
    } catch (err) {
      setFormError(err.message || "Не удалось отменить регистрацию");
    } finally {
      setSubmitLoading(false);
    }
  };

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

                  {post.club ? (
                    <div className="flex items-center gap-2 mb-2">
                      <Link
                        to={`/organization/${post.club}`}
                        className="flex items-center justify-center w-8 h-8 overflow-hidden bg-white border rounded-full border-slate-200 hover:border-primary transition"
                        aria-label={post.club_name || "Организация"}
                        title={post.club_name || "Организация"}
                      >
                        <img
                          src={
                            buildMediaUrl(post.club_avatar_url) ||
                            "/OrganizationLogo/DefaultLogo.jpg"
                          }
                          alt={post.club_name || "Организация"}
                          className="object-cover w-full h-full"
                          loading="lazy"
                        />
                      </Link>
                      <Link
                        to={`/organization/${post.club}`}
                        className="text-sm font-semibold text-primary hover:underline"
                      >
                        {post.club_name}
                      </Link>
                    </div>
                  ) : null}

                  <p className="mb-3 whitespace-pre-wrap text-slate-700">
                    {post.content}
                  </p>

                  {(post.image_url || post.image) && (
                    <img
                      src={
                        buildMediaUrl(post.image_url) ||
                        buildMediaUrl(post.image) ||
                        post.image_url ||
                        post.image
                      }
                      alt={post.title}
                      className="object-cover w-full mb-3 h-60 rounded-xl"
                    />
                  )}

	                  {(post.type === "event" || post.is_form) &&
	                    user?.role === "student" && (
	                      <div className="flex justify-end mt-3">
	                        {registeredPostIds.has(post.id) ? (
	                          <button
	                            type="button"
	                            onClick={() => openViewModal(post)}
	                            className="px-4 py-2 text-sm font-semibold text-white rounded-xl bg-emerald-500 shadow-md hover:shadow-lg transition-all"
	                          >
	                            Вы зарегистрированы
	                          </button>
	                        ) : (
	                          <button
	                            type="button"
	                            onClick={() => openRegisterModal(post)}
	                            className="px-4 py-2 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-primary via-purple-600 to-indigo-600 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
	                          >
	                            Зарегистрироваться
	                          </button>
                        )}
                      </div>
                    )}
                </article>
              );
            })}
          </div>
        )}
        {modalOpen &&
          selectedPost &&
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
	                  {modalMode === "view"
	                    ? "Ваша регистрация"
	                    : "Регистрация на мероприятие"}
	                </h3>
                <p className="mb-4 text-sm text-slate-600">
                  {selectedPost.title}
                </p>

	                <form
	                  className="space-y-3"
	                  onSubmit={
	                    modalMode === "create"
	                      ? handleRegister
	                      : (e) => e.preventDefault()
	                  }
	                >
                  {formLoading ? (
                    <p className="text-sm text-slate-600">
                      Загружаем вопросы формы...
                    </p>
                  ) : formError ? (
                    <div className="p-3 text-sm border rounded-lg text-rose-600 bg-rose-50 border-rose-200">
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
	                              required={modalMode === "create" && !!field.is_required}
	                              disabled={modalMode === "view"}
	                              className="w-full px-3 py-2 bg-white border-2 rounded-lg border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
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
	                              required={modalMode === "create" && !!field.is_required}
	                              disabled={modalMode === "view"}
	                              className="w-full px-3 py-2 bg-white border-2 rounded-lg border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
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
	                    {modalMode === "create" ? (
	                      <button
	                        type="submit"
	                        disabled={
	                          submitLoading || formLoading || !!formError || !formId
	                        }
	                        className="px-4 py-2 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-primary via-purple-600 to-indigo-600 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
	                      >
	                        {submitLoading ? "Отправляем..." : "Зарегистрироваться"}
	                      </button>
	                    ) : (
	                      <button
	                        type="button"
	                        onClick={handleCancelRegistration}
	                        disabled={submitLoading || formLoading}
	                        className="px-4 py-2 text-sm font-semibold text-white rounded-xl bg-rose-500 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
	                      >
	                        {submitLoading ? "Отменяем..." : "Отменить регистрацию"}
	                      </button>
	                    )}
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
