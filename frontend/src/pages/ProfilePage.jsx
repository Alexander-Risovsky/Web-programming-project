import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { posts, organizations } from "../data/mockOrgsAndPosts";
import { API_BASE_URL } from "../config";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const isOrg =
    user?.role === "org" || (!!user?.orgId && !user?.studentProfile);

  const [orgInfo, setOrgInfo] = useState(null);
  const [orgPostsRemote, setOrgPostsRemote] = useState([]);
  const [orgPostsLoading, setOrgPostsLoading] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);

  const [selectedPost, setSelectedPost] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [registeredEventsRemote, setRegisteredEventsRemote] = useState([]);
  const [registeredEventsLoading, setRegisteredEventsLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState("");
  const [statsData, setStatsData] = useState([]);

  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    date: "",
    type: "info",
    image: "",
  });

  const [toast, setToast] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [studentEditOpen, setStudentEditOpen] = useState(false);
  const [studentSaving, setStudentSaving] = useState(false);
  const [studentForm, setStudentForm] = useState({
    name: user?.name || "",
    surname: user?.surname || "",
    course: user?.course || "",
    group: user?.group || "",
    major: user?.major || "",
  });

  const [orgEditOpen, setOrgEditOpen] = useState(false);
  const [orgSaving, setOrgSaving] = useState(false);
  const [orgForm, setOrgForm] = useState({
    name: "",
    description: "",
  });

  // Синхронизируем формы при смене пользователя/роли
  useEffect(() => {
    if (!isOrg) {
      setStudentForm({
        name: user?.name || "",
        surname: user?.surname || "",
        course: user?.course || "",
        group: user?.group || "",
        major: user?.major || "",
      });
      setOrgForm({ name: "", description: "" });
    }
  }, [isOrg, user]);

  // Загрузка информации об организации
  useEffect(() => {
    const loadOrg = async () => {
      if (!isOrg) {
        setOrgInfo(null);
        return;
      }
      console.log("user:");

      console.log(user);

      const clubId = user?.orgId || user?.id;
      if (!clubId) return;

      try {
        const res = await fetch(`${API_BASE_URL}/api/clubs/${clubId}/`);
        if (!res.ok) return;
        const data = await res.json();
        setOrgInfo(data);
      } catch {
        // молча
      }
    };
    loadOrg();
  }, [user]);

  // Подготовка формы редактирования организации
  useEffect(() => {
    if (isOrg) {
      setOrgForm({
        name: orgInfo?.name || user?.orgName || user?.name || "",
        description: orgInfo?.description || user?.description || "",
      });
    }
  }, [isOrg, orgInfo, user]);

  // Загрузка постов организации
  useEffect(() => {
    const loadOrgPosts = async () => {
      if (!isOrg) {
        setOrgPostsRemote([]);
        return;
      }
      setOrgPostsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/posts/`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        const filtered = Array.isArray(data)
          ? data.filter((p) => p.club === (user.orgId || user.id))
          : [];
        setOrgPostsRemote(filtered);
      } catch {
        setOrgPostsRemote([]);
      } finally {
        setOrgPostsLoading(false);
      }
    };
    loadOrgPosts();
  }, [user]);

  const orgDisplayName = isOrg
    ? orgInfo?.name ||
      user?.orgName ||
      organizations.find((o) => o.id === user.orgId)?.name ||
      user?.username ||
      "Организация"
    : null;
  console.log("USER");

  console.log(user);

  const displayUser = {
    name: isOrg
      ? orgDisplayName
      : `${user?.name || ""} ${user?.surname || ""}`.trim() ||
        user?.username ||
        "Пользователь",
    email: user?.email || "user@edu.hse.ru",
    group: user?.group || "Группа",
    course: user?.course || "Курс",
    major: user?.major || "Направление",
    role: isOrg ? "Организация" : "Студент",
    followers: user?.followers ?? 1240,
    description: user?.description || "Описание пока не заполнено",
  };

  const registeredEvents = useMemo(() => {
    return registeredEventsRemote
      .filter((p) => p.type === "event" || p.is_form)
      .sort(
        (a, b) =>
          new Date(b.published_at || b.date || 0) -
          new Date(a.published_at || a.date || 0)
      );
  }, [registeredEventsRemote]);

  const orgPosts = useMemo(() => {
    if (!isOrg) return [];
    return orgPostsRemote
      .slice()
      .sort(
        (a, b) =>
          new Date(b.published_at || b.date || 0) -
          new Date(a.published_at || a.date || 0)
      );
  }, [user, orgPostsRemote]);

  const formatDate = (value) => {
    if (!value) return "--";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "--";
    const dd = parsed.getDate().toString().padStart(2, "0");
    const mm = (parsed.getMonth() + 1).toString().padStart(2, "0");
    const yyyy = parsed.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const getOrg = (orgId) => organizations.find((o) => o.id === orgId);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuOpenId &&
        !(e.target.closest && e.target.closest(".post-menu-actions"))
      ) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpenId]);

  // Загрузка зарегистрированных мероприятий студента
  useEffect(() => {
    const loadRegistrations = async () => {
      if (isOrg || !user?.id) {
        setRegisteredEventsRemote([]);
        return;
      }
      setRegisteredEventsLoading(true);
      try {
        const baseHeaders = {
          ...(user?.access ? { Authorization: `Bearer ${user.access}` } : {}),
        };

        const subsRes = await fetch(
          `${API_BASE_URL}/api/registration-submissions/`,
          { headers: baseHeaders, credentials: "include" }
        );
        const submissions = await subsRes.json().catch(() => []);
        const userSubs = Array.isArray(submissions)
          ? submissions.filter((s) => s.user === user.id)
          : [];
        if (userSubs.length === 0) {
          setRegisteredEventsRemote([]);
          return;
        }

        const formsRes = await fetch(
          `${API_BASE_URL}/api/registration-forms/`,
          {
            headers: baseHeaders,
            credentials: "include",
          }
        );
        const forms = await formsRes.json().catch(() => []);
        const formIdSet = new Set(userSubs.map((s) => s.form));
        const postIds = new Set(
          Array.isArray(forms)
            ? forms
                .filter((f) => formIdSet.has(f.id) && f.post)
                .map((f) => f.post)
            : []
        );
        if (postIds.size === 0) {
          setRegisteredEventsRemote([]);
          return;
        }

        const postsRes = await fetch(`${API_BASE_URL}/api/posts/`, {
          headers: baseHeaders,
          credentials: "include",
        });
        const postsData = await postsRes.json().catch(() => []);
        const filtered =
          Array.isArray(postsData) && postIds.size > 0
            ? postsData.filter((p) => postIds.has(p.id))
            : [];
        setRegisteredEventsRemote(filtered);
      } catch {
        setRegisteredEventsRemote([]);
      } finally {
        setRegisteredEventsLoading(false);
      }
    };

    loadRegistrations();
  }, [isOrg, user]);

  const openEdit = (post) => {
    setSelectedPost(post);
    setEditForm({
      title: post.title || "",
      content: post.content || "",
      date:
        (post.published_at || post.date || "").toString().slice(0, 10) || "",
      type: post.type || "info",
      image: post.image_url || post.image || "",
    });
    setEditModalOpen(true);
    setMenuOpenId(null);
  };

  const openDelete = (post) => {
    setSelectedPost(post);
    setDeleteModalOpen(true);
  };

  const loadStats = async (post) => {
    if (!post?.id) return;
    setStatsLoading(true);
    setStatsError("");
    setStatsData([]);
    try {
      const baseHeaders = {
        ...(user?.access ? { Authorization: `Bearer ${user.access}` } : {}),
      };

      const formsRes = await fetch(`${API_BASE_URL}/api/registration-forms/`, {
        headers: baseHeaders,
        credentials: "include",
      });
      const forms = await formsRes.json().catch(() => []);
      const form = Array.isArray(forms)
        ? forms.find((f) => f.post === post.id)
        : null;

      if (!form?.id) {
        setStatsError("Для этого поста форма регистрации не найдена");
        setStatsData([]);
        return;
      }

      const fieldsRes = await fetch(
        `${API_BASE_URL}/api/registration-fields/`,
        {
          headers: baseHeaders,
          credentials: "include",
        }
      );
      const fields = await fieldsRes.json().catch(() => []);
      const fieldsMap = new Map(
        (Array.isArray(fields) ? fields : [])
          .filter((f) => f.form === form.id)
          .map((f) => [f.id, f])
      );

      const subsRes = await fetch(
        `${API_BASE_URL}/api/registration-submissions/`,
        { headers: baseHeaders, credentials: "include" }
      );
      const subs = await subsRes.json().catch(() => []);
      const submissions = Array.isArray(subs)
        ? subs.filter((s) => s.form === form.id)
        : [];

      const answersRes = await fetch(
        `${API_BASE_URL}/api/registration-answers/`,
        { headers: baseHeaders, credentials: "include" }
      );
      const answers = await answersRes.json().catch(() => []);
      const answersBySubmission = new Map();
      (Array.isArray(answers) ? answers : []).forEach((ans) => {
        if (!answersBySubmission.has(ans.submission)) {
          answersBySubmission.set(ans.submission, []);
        }
        answersBySubmission.get(ans.submission).push(ans);
      });

      // Пытаемся загрузить студентов разом (если доступно)
      let studentsMap = new Map();
      try {
        const studentsRes = await fetch(`${API_BASE_URL}/api/students/`, {
          headers: baseHeaders,
          credentials: "include",
        });
        const students = await studentsRes.json().catch(() => []);
        if (Array.isArray(students)) {
          studentsMap = new Map(
            students.map((s) => [
              s.id,
              {
                name: s.name,
                surname: s.surname,
                username: s.username || s.email || s.user || s.id,
              },
            ])
          );
        }
      } catch (e) {
        // ignore
      }

      const stats = submissions.map((sub) => {
        const userInfo = studentsMap.get(sub.user) || {};
        const answersList = answersBySubmission.get(sub.id) || [];
        return {
          submissionId: sub.id,
          userId: sub.user,
          name:
            [userInfo.name, userInfo.surname].filter(Boolean).join(" ") ||
            `Пользователь #${sub.user}`,
          username: userInfo.username || `id:${sub.user}`,
          answers: answersList.map((ans) => ({
            question: fieldsMap.get(ans.field)?.label || "Вопрос",
            value: ans.value_text || "",
          })),
        };
      });

      setStatsData(stats);
    } catch (err) {
      setStatsError("Не удалось загрузить статистику");
      setStatsData([]);
    } finally {
      setStatsLoading(false);
    }
  };

  const openStats = (post) => {
    setSelectedPost(post);
    setStatsModalOpen(true);
    loadStats(post);
  };

  const closeModals = () => {
    setEditModalOpen(false);
    setDeleteModalOpen(false);
    setStatsModalOpen(false);
    setSelectedPost(null);
    setStatsData([]);
    setStatsError("");
    setStatsLoading(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPost) return;

    const payload = {
      type: editForm.type,
      title: editForm.title,
      content: editForm.content,
      image_url: editForm.image || null,
      is_form: editForm.type === "event",
      published_at: editForm.date || null,
      club: user?.orgId ?? user?.id ?? null,
      ...(selectedPost.form ? { form: selectedPost.form } : {}),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${selectedPost.id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(user?.access ? { Authorization: `Bearer ${user.access}` } : {}),
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const updated = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(updated?.detail || "Не удалось обновить пост");
      }

      setOrgPostsRemote((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      setToast({ type: "success", message: "Пост обновлён" });
      setTimeout(() => setToast(null), 3000);
      closeModals();
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Не удалось обновить пост",
      });
      setTimeout(() => setToast(null), 4000);
      closeModals();
    }
  };

  const handleDeleteConfirm = () => {
    if (!selectedPost) return;
    setDeleteLoading(true);

    fetch(`${API_BASE_URL}/api/posts/${selectedPost.id}/`, {
      method: "DELETE",
      headers: {
        ...(user?.access ? { Authorization: `Bearer ${user.access}` } : {}),
      },
      credentials: "include",
    })
      .then(() => {
        setOrgPostsRemote((prev) =>
          prev.filter((p) => p.id !== selectedPost.id)
        );
        setToast({ type: "error", message: "Пост удалён" });
        setTimeout(() => setToast(null), 4000);
        closeModals();
      })
      .catch(() => {
        setToast({ type: "error", message: "Не удалось удалить пост" });
        setTimeout(() => setToast(null), 4000);
        closeModals();
      })
      .finally(() => setDeleteLoading(false));
  };

  const handleStudentEditSubmit = async (e) => {
    e.preventDefault();
    if (isOrg || !user?.id) return;
    setStudentSaving(true);

    try {
      const payload = {
        name: studentForm.name?.trim() || "",
        surname: studentForm.surname?.trim() || "",
        course: studentForm.course?.trim() || "",
        group: studentForm.group?.trim() || "",
        major: studentForm.major?.trim() || "",
      };

      const res = await fetch(`${API_BASE_URL}/api/students/${user.id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(user?.access ? { Authorization: `Bearer ${user.access}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.detail || "Не удалось обновить профиль");
      }

      // обновляем user в контексте
      setUser((prev) =>
        prev
          ? {
              ...prev,
              name: data?.name ?? payload.name,
              surname: data?.surname ?? payload.surname,
              course: data?.course ?? payload.course,
              group: data?.group ?? payload.group,
              major: data?.major ?? payload.major,
            }
          : prev
      );

      setToast({ type: "success", message: "Профиль обновлён" });
      setTimeout(() => setToast(null), 4000);
      setStudentEditOpen(false);
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Не удалось обновить профиль",
      });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setStudentSaving(false);
    }
  };

  const handleOrgEditSubmit = async (e) => {
    e.preventDefault();
    if (!isOrg || !user?.orgId) return;
    setOrgSaving(true);

    try {
      const payload = {
        name: orgForm.name?.trim() || "",
        description: orgForm.description?.trim() || "",
      };

      const res = await fetch(`${API_BASE_URL}/api/clubs/${user.orgId}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(user?.access ? { Authorization: `Bearer ${user.access}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.detail || "Не удалось обновить профиль организации"
        );
      }

      setOrgInfo(data || payload);
      setUser((prev) =>
        prev
          ? {
              ...prev,
              orgName: data?.name ?? payload.name,
              description: data?.description ?? payload.description,
            }
          : prev
      );

      setToast({ type: "success", message: "Профиль организации обновлён" });
      setTimeout(() => setToast(null), 4000);
      setOrgEditOpen(false);
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Не удалось обновить профиль организации",
      });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setOrgSaving(false);
    }
  };

  return (
    <>
      {toast && (
        <div
          className="fixed top-4 left-1/2 z-[40000] -translate-x-1/2 px-4 py-3 rounded-xl shadow-2xl text-sm font-semibold text-white animate-slide-up transition-all duration-500"
          style={{
            background:
              toast.type === "success"
                ? "linear-gradient(135deg, #22c55e, #16a34a)"
                : "linear-gradient(135deg, #ef4444, #b91c1c)",
          }}
        >
          {toast.message}
        </div>
      )}

      <section className="max-w-5xl mx-auto space-y-5 animate-slide-up">
        <div className="flex flex-col gap-5 p-6 glass-card lg:p-8 md:flex-row md:items-center">
          <div className="relative">
            <div className="flex items-center justify-center w-20 h-20 text-2xl font-bold text-white shadow-lg rounded-2xl bg-gradient-to-br from-primary to-purple-600">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </div>

          <div className="flex-1 space-y-1">
            <p className="text-sm font-semibold text-primary">
              {displayUser.role}
            </p>

            <h1 className="text-2xl font-bold lg:text-3xl text-slate-900">
              {displayUser.name}
            </h1>

            {!isOrg ? (
              <p className="text-slate-600">{displayUser.email}</p>
            ) : (
              <p className="text-slate-600">{displayUser.description}</p>
            )}

            {!isOrg && (
              <>
                <p className="text-slate-600">Курс: {displayUser.course}</p>
                <p className="text-slate-600">Группа: {displayUser.group}</p>
                <p className="text-slate-600">
                  Направление: {displayUser.major}
                </p>
              </>
            )}
          </div>

          {!isOrg && (
            <button
              className="px-4 py-2.5 bg-gradient-to-r from-primary via-purple-600 to-indigo-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              onClick={() => setStudentEditOpen(true)}
            >
              Редактировать
            </button>
          )}

          {isOrg && (
            <button
              className="px-4 py-2.5 bg-gradient-to-r from-primary via-purple-600 to-indigo-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              onClick={() => setOrgEditOpen(true)}
            >
              Редактировать
            </button>
          )}
        </div>

        {!isOrg && (
          <div className="p-6 space-y-4 glass-card lg:p-8">
            <h2 className="text-xl font-bold text-slate-900 lg:text-2xl">
              Мои регистрации на мероприятия
            </h2>

            {registeredEventsLoading ? (
              <p className="text-slate-600">Загрузка ваших регистраций...</p>
            ) : registeredEvents.length === 0 ? (
              <p className="text-slate-600">
                Пока нет зарегистрированных мероприятий.
              </p>
            ) : (
              <div className="space-y-4">
                {registeredEvents.map((event, idx) => {
                  const org = getOrg(event.orgId) || getOrg(event.club);
                  return (
                    <article
                      key={event.id}
                      className="p-4 transition-shadow border shadow-sm lg:p-5 bg-white/90 border-slate-200 rounded-2xl hover:shadow-md animate-slide-up"
                      style={{ animationDelay: `${idx * 80}ms` }}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-primary">
                            {org?.name || "Организация"}
                          </p>
                          <h3 className="text-lg font-bold text-slate-900 lg:text-xl">
                            {event.title}
                          </h3>
                        </div>
                        <span className="text-xs text-slate-500">
                          {new Date(
                            event.published_at || event.date
                          ).toLocaleDateString("ru-RU")}
                        </span>
                      </div>

                      <p className="mb-3 text-slate-700">{event.content}</p>

                      {event.image_url || event.image ? (
                        <img
                          src={event.image_url || event.image}
                          alt={event.title}
                          className="object-cover w-full mb-3 rounded-xl max-h-60"
                        />
                      ) : null}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {isOrg && (
          <div className="p-6 space-y-4 glass-card lg:p-8">
            <h2 className="text-xl font-bold text-slate-900 lg:text-2xl">
              Посты организации
            </h2>
            {orgPostsLoading ? (
              <p className="text-slate-600">Загрузка постов организации... </p>
            ) : orgPosts.length === 0 ? (
              <p className="text-slate-600">Постов пока нет.</p>
            ) : (
              <div className="space-y-4">
                {orgPosts.map((post, idx) => {
                  const org = getOrg(post.orgId);
                  const dateValue = post.published_at || post.date;
                  const isOpen = menuOpenId === post.id;
                  return (
                    <article
                      key={post.id}
                      className={`relative p-4 transition-shadow border shadow-sm lg:p-5 bg-white/90 border-slate-200 rounded-2xl hover:shadow-md animate-slide-up group ${
                        isOpen ? "z-50" : "z-0"
                      }`}
                      style={{ animationDelay: `${idx * 80}ms` }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-primary">
                              {org?.name || orgDisplayName || "Организация"}
                            </p>
                            <span className="text-xs text-slate-500">
                              {formatDate(dateValue)}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 lg:text-xl">
                            {post.title}
                          </h3>
                        </div>
                        <div className="relative post-menu-actions">
                          <button
                            className="flex items-center justify-center transition-colors bg-white border-2 w-9 h-9 rounded-xl border-slate-200 hover:border-primary hover:bg-primary/5"
                            aria-label="Открыть меню"
                            type="button"
                            onClick={() =>
                              setMenuOpenId((prev) =>
                                prev === post.id ? null : post.id
                              )
                            }
                          >
                            <span className="flex flex-col items-center justify-center gap-1">
                              <span className="block w-4 h-0.5 bg-slate-600"></span>
                              <span className="block w-4 h-0.5 bg-slate-600"></span>
                              <span className="block w-4 h-0.5 bg-slate-600"></span>
                            </span>
                          </button>
                          <div
                            className={`absolute right-0 z-50000 w-48 py-2 mt-2 text-sm bg-white border rounded-xl shadow-2xl border-slate-200 origin-top-right ${
                              menuOpenId === post.id
                                ? "block animate-slide-up"
                                : "hidden"
                            }`}
                          >
                            <button
                              onClick={() => openEdit(post)}
                              className="w-full px-3 py-2 text-left hover:bg-slate-50"
                            >
                              Редактировать пост
                            </button>
                            <button
                              onClick={() => openDelete(post)}
                              className="w-full px-3 py-2 text-left text-red-600 hover:bg-slate-50"
                            >
                              Удалить пост
                            </button>
                            {post.type === "event" && (
                              <button
                                onClick={() => openStats(post)}
                                className="w-full px-3 py-2 text-left hover:bg-slate-50"
                              >
                                Статистика регистраций
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="mb-3 text-slate-700">{post.content}</p>
                      {post.image_url || post.image ? (
                        <img
                          src={post.image_url || post.image}
                          alt={post.title}
                          className="object-cover w-full mb-3 rounded-xl max-h-60"
                        />
                      ) : null}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>
      {orgEditOpen && isOrg && (
        <div
          className="fixed inset-0 z-[12000] flex items-center justify-center w-screen h-screen bg-black/60 backdrop-blur-sm px-4"
          onClick={() => setOrgEditOpen(false)}
        >
          <div
            className="relative w-full max-w-xl p-6 bg-white shadow-2xl rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-lg font-bold text-slate-900">
              Редактирование профиля организации{" "}
            </h3>
            <form className="space-y-3" onSubmit={handleOrgEditSubmit}>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">
                  Название
                </label>
                <input
                  type="text"
                  value={orgForm.name}
                  onChange={(e) =>
                    setOrgForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 border-2 rounded-lg border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">
                  Описание{" "}
                </label>
                <textarea
                  rows={3}
                  value={orgForm.description}
                  onChange={(e) =>
                    setOrgForm((f) => ({ ...f, description: e.target.value }))
                  }
                  className="w-full px-3 py-2 border-2 rounded-lg border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOrgEditOpen(false)}
                  className="px-4 py-2 text-sm font-semibold transition border rounded-xl text-slate-600 bg-slate-100 border-slate-200 hover:bg-slate-200"
                >
                  Назад{" "}
                </button>
                <button
                  type="submit"
                  disabled={orgSaving}
                  className="px-4 py-2 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-primary via-purple-600 to-indigo-600 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all "
                >
                  {orgSaving ? "Сохранение..." : "Сохранить"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {studentEditOpen && !isOrg && (
        <div
          className="fixed inset-0 z-[12000] flex items-center justify-center w-screen h-screen bg-black/60 backdrop-blur-sm px-4"
          onClick={() => setStudentEditOpen(false)}
        >
          <div
            className="relative w-full max-w-xl p-6 bg-white shadow-2xl rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-lg font-bold text-slate-900">
              Редактирование профиля студента{" "}
            </h3>
            <form className="space-y-3" onSubmit={handleStudentEditSubmit}>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">
                    Имя
                  </label>
                  <input
                    type="text"
                    value={studentForm.name}
                    onChange={(e) =>
                      setStudentForm((f) => ({ ...f, name: e.target.value }))
                    }
                    className="w-full px-3 py-2 border-2 rounded-lg border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">
                    Фамилия
                  </label>
                  <input
                    type="text"
                    value={studentForm.surname}
                    onChange={(e) =>
                      setStudentForm((f) => ({ ...f, surname: e.target.value }))
                    }
                    className="w-full px-3 py-2 border-2 rounded-lg border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">
                    Курс
                  </label>
                  <input
                    type="text"
                    value={studentForm.course}
                    onChange={(e) =>
                      setStudentForm((f) => ({ ...f, course: e.target.value }))
                    }
                    className="w-full px-3 py-2 border-2 rounded-lg border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">
                    Группа
                  </label>
                  <input
                    type="text"
                    value={studentForm.group}
                    onChange={(e) =>
                      setStudentForm((f) => ({ ...f, group: e.target.value }))
                    }
                    className="w-full px-3 py-2 border-2 rounded-lg border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">
                  Направление
                </label>
                <input
                  type="text"
                  value={studentForm.major}
                  onChange={(e) =>
                    setStudentForm((f) => ({ ...f, major: e.target.value }))
                  }
                  className="w-full px-3 py-2 border-2 rounded-lg border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStudentEditOpen(false)}
                  className="px-4 py-2 text-sm font-semibold transition border rounded-xl text-slate-600 bg-slate-100 border-slate-200 hover:bg-slate-200"
                >
                  Назад
                </button>
                <button
                  type="submit"
                  disabled={studentSaving}
                  className={`px-4 py-2 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-primary via-purple-600 to-indigo-600 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all ${
                    studentSaving ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  {studentSaving ? "Сохранение..." : "Сохранить"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {(editModalOpen || deleteModalOpen || statsModalOpen) && (
        <div
          className="fixed inset-0 w-screen h-screen z-[10001] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={closeModals}
        >
          {editModalOpen && selectedPost && (
            <div
              className="relative w-full max-w-lg p-6 bg-white shadow-2xl rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-4 text-lg font-bold text-slate-900">
                Редактирование поста
              </h3>
              <form className="space-y-3" onSubmit={handleEditSubmit}>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">
                    Заголовок
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, title: e.target.value }))
                    }
                    className="w-full px-3 py-2 border-2 rounded-lg border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">
                    Текст поста
                  </label>
                  <textarea
                    rows={4}
                    value={editForm.content}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, content: e.target.value }))
                    }
                    className="w-full px-3 py-2 border-2 rounded-lg border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">
                      Дата публикации
                    </label>
                    <input
                      type="date"
                      value={editForm.date}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, date: e.target.value }))
                      }
                      className="w-full px-3 py-2 border-2 rounded-lg border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">
                      Тип поста
                    </label>
                    <select
                      value={editForm.type}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, type: e.target.value }))
                      }
                      className="w-full px-3 py-2 border-2 rounded-lg border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="info">Новость / Информация </option>
                      <option value="event">Мероприятие </option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">
                    Ссылка на изображение (URL)
                  </label>
                  <input
                    type="text"
                    value={editForm.image}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, image: e.target.value }))
                    }
                    className="w-full px-3 py-2 border-2 rounded-lg border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeModals}
                    className="px-4 py-2 text-sm font-semibold transition border rounded-xl text-slate-600 bg-slate-100 border-slate-200 hover:bg-slate-200"
                  >
                    Отмена{" "}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-primary via-purple-600 to-indigo-600 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
                  >
                    Сохранить{" "}
                  </button>
                </div>
              </form>
            </div>
          )}

          {deleteModalOpen && selectedPost && (
            <div
              className="relative w-full max-w-md p-6 bg-white shadow-2xl rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-3 text-lg font-bold text-slate-900">
                Удалить пост?
              </h3>
              <p className="mb-4 text-sm text-slate-600">
                Вы уверены, что хотите удалить пост «{selectedPost.title}»? Это
                действие нельзя отменить.{" "}
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={closeModals}
                  className="px-4 py-2 text-sm font-semibold transition border rounded-xl text-slate-600 bg-slate-100 border-slate-200 hover:bg-slate-200"
                >
                  Отмена{" "}
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className={`px-4 py-2 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all ${
                    deleteLoading ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Удаление..." : "Удалить"}
                </button>
              </div>
            </div>
          )}

          {statsModalOpen && selectedPost && (
            <div
              className="relative w-full max-w-md p-6 bg-white shadow-2xl rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-3 text-lg font-bold text-slate-900">
                Статистика регистраций
              </h3>
              <p className="mb-2 text-sm text-slate-600">
                Пост: {selectedPost.title}
              </p>
              {statsLoading ? (
                <p className="text-sm text-slate-600">Загрузка...</p>
              ) : statsError ? (
                <p className="text-sm text-rose-600">{statsError}</p>
              ) : statsData.length === 0 ? (
                <p className="text-sm text-slate-600">
                  Пока нет регистраций на этот пост.
                </p>
              ) : (
                <div className="pr-1 space-y-3 overflow-y-auto max-h-96">
                  {statsData.map((item) => (
                    <div
                      key={item.submissionId}
                      className="p-3 border rounded-xl border-slate-200 bg-slate-50"
                    >
                      <div className="mb-2">
                        <p className="text-sm font-semibold text-slate-800">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.username}
                        </p>
                      </div>
                      <div className="space-y-2">
                        {item.answers.map((ans, idx) => (
                          <div key={`${item.submissionId}-${idx}`}>
                            <p className="text-xs font-semibold text-slate-600">
                              {ans.question}
                            </p>
                            <p className="text-sm text-slate-800">
                              {ans.value || "—"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-end pt-4">
                <button
                  onClick={closeModals}
                  className="px-4 py-2 text-sm font-semibold transition border rounded-xl text-slate-600 bg-slate-100 border-slate-200 hover:bg-slate-200"
                >
                  Закрыть{" "}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
