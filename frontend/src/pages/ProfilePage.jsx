import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { posts, organizations } from "../data/mockOrgsAndPosts";
import { API_BASE_URL, buildMediaUrl } from "../config";
import { dedupFetch } from "../utils/dedupFetch";

export default function ProfilePage() {
  const { user, setUser, authFetch } = useAuth();
  const isOrg =
    user?.role === "org" || (!!user?.orgId && !user?.studentProfile);
  const authUserId = user?.role === "student" ? (user?.userId ?? user?.id) : user?.id;
  const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

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
  const [registrationMetaByPostId, setRegistrationMetaByPostId] = useState(
    new Map()
  );
  const [regViewOpen, setRegViewOpen] = useState(false);
  const [regViewPost, setRegViewPost] = useState(null);
  const [regViewLoading, setRegViewLoading] = useState(false);
  const [regViewError, setRegViewError] = useState("");
  const [regViewFields, setRegViewFields] = useState([]);
  const [regViewAnswersByField, setRegViewAnswersByField] = useState({});
  const [regViewSubmissionId, setRegViewSubmissionId] = useState(null);
  const [regViewFormId, setRegViewFormId] = useState(null);
  const [regCancelLoading, setRegCancelLoading] = useState(false);
  const [registrationsVersion, setRegistrationsVersion] = useState(0);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState("");
  const [statsData, setStatsData] = useState([]);

  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    date: "",
    type: "info",
    imageSource: "file",
    imageUrl: "",
    imageFile: null,
  });

  const editRegLoadedPostIdRef = useRef(null);
  const regFieldsCacheRef = useRef(new Map());
  const regAnswersCacheRef = useRef(new Map());
  const [editRegFormId, setEditRegFormId] = useState(null);
  const [editRegTitle, setEditRegTitle] = useState("");
  const [editRegFields, setEditRegFields] = useState([]);
  const [editRegLoading, setEditRegLoading] = useState(false);
  const [editRegSaving, setEditRegSaving] = useState(false);
  const [editRegError, setEditRegError] = useState("");

  const [toast, setToast] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  const [studentEditOpen, setStudentEditOpen] = useState(false);
  const [studentSaving, setStudentSaving] = useState(false);
  const [studentAvatarFile, setStudentAvatarFile] = useState(null);
  const [studentAvatarPreviewUrl, setStudentAvatarPreviewUrl] = useState(null);
  const [studentForm, setStudentForm] = useState({
    name: user?.name || "",
    surname: user?.surname || "",
    course: user?.course || "",
    group: user?.group || "",
    major: user?.major || "",
  });

  const [orgEditOpen, setOrgEditOpen] = useState(false);
  const [orgSaving, setOrgSaving] = useState(false);
  const [orgAvatarFile, setOrgAvatarFile] = useState(null);
  const [orgAvatarPreviewUrl, setOrgAvatarPreviewUrl] = useState(null);
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

  useEffect(() => {
    if (!studentEditOpen) return;
    setStudentAvatarFile(null);
  }, [studentEditOpen]);

  useEffect(() => {
    if (!orgEditOpen) return;
    setOrgAvatarFile(null);
  }, [orgEditOpen]);

  useEffect(() => {
    if (!studentAvatarFile) {
      setStudentAvatarPreviewUrl(null);
      return;
    }
    const previewUrl = URL.createObjectURL(studentAvatarFile);
    setStudentAvatarPreviewUrl(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [studentAvatarFile]);

  useEffect(() => {
    if (!orgAvatarFile) {
      setOrgAvatarPreviewUrl(null);
      return;
    }
    const previewUrl = URL.createObjectURL(orgAvatarFile);
    setOrgAvatarPreviewUrl(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [orgAvatarFile]);

  // Загрузка информации об организации
  useEffect(() => {
    const loadOrg = async () => {
      if (!isOrg) {
        setOrgInfo(null);
        return;
      }
      const clubId = user?.orgId || user?.id;
      if (!clubId) return;

      try {
        const res = await dedupFetch(`${API_BASE_URL}/api/clubs/${clubId}/`);
        if (!res.ok) return;
        const data = await res.json();
        setOrgInfo(data);
      } catch {
        // молча
      }
    };
    loadOrg();
  }, [isOrg, user?.role, user?.orgId, user?.id]);

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
        const clubId = user?.orgId || user?.id;
        const res = await dedupFetch(`${API_BASE_URL}/api/posts/?club=${clubId}`);
          if (!res.ok) throw new Error();
          const data = await res.json();
        setOrgPostsRemote(Array.isArray(data) ? data : []);
        } catch {
          setOrgPostsRemote([]);
        } finally {
          setOrgPostsLoading(false);
        }
      };
    loadOrgPosts();
  }, [isOrg, user?.role, user?.orgId, user?.id]);

  const orgDisplayName = isOrg
    ? orgInfo?.name ||
      user?.orgName ||
      organizations.find((o) => o.id === user.orgId)?.name ||
      user?.username ||
      "Организация"
    : null;
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

  const closeRegistrationView = () => {
    setRegViewOpen(false);
    setRegViewPost(null);
    setRegViewLoading(false);
    setRegViewError("");
    setRegViewFields([]);
    setRegViewAnswersByField({});
    setRegViewSubmissionId(null);
    setRegViewFormId(null);
    setRegCancelLoading(false);
  };

  const loadRegistrationView = async (post) => {
    if (!post?.id || isOrg || !authUserId) return;

    setRegViewLoading(true);
    setRegViewError("");
    setRegViewFields([]);
    setRegViewAnswersByField({});
    setRegViewSubmissionId(null);
    setRegViewFormId(null);

    try {
      const meta = registrationMetaByPostId.get(post.id);

      let formId = meta?.formId ?? null;
      if (!formId) {
        const formsRes = await authFetch(
          `${API_BASE_URL}/api/registration-forms/?post=${post.id}`,
          { credentials: "include" }
        );
        const formsData = await formsRes.json().catch(() => null);
        const form = Array.isArray(formsData) ? formsData[0] : formsData;
        formId = form?.id ?? null;
      }
      if (!formId) {
        throw new Error("Форма регистрации не найдена");
      }

      let submissionId = meta?.submissionId ?? null;
      if (!submissionId) {
        const subsRes = await authFetch(
          `${API_BASE_URL}/api/registration-submissions/?user=${authUserId}&form=${formId}`,
          { credentials: "include" }
        );
        const subsData = await subsRes.json().catch(() => null);
        const sub = Array.isArray(subsData) ? subsData[0] : subsData;
        submissionId = sub?.id ?? null;
      }
      if (!submissionId) {
        throw new Error("Заявка не найдена");
      }

      setRegViewFormId(formId);
      setRegViewSubmissionId(submissionId);

      const cachedFields = regFieldsCacheRef.current.get(formId);
      const cachedAnswers = regAnswersCacheRef.current.get(submissionId);

      const fieldsPromise =
        cachedFields !== undefined
          ? Promise.resolve(cachedFields)
          : authFetch(`${API_BASE_URL}/api/registration-fields/?form=${formId}`, {
              credentials: "include",
            })
              .then((r) => r.json().catch(() => []))
              .then((fieldsData) => {
                const fields = Array.isArray(fieldsData)
                  ? fieldsData
                      .slice()
                      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                  : [];
                regFieldsCacheRef.current.set(formId, fields);
                return fields;
              })
              .catch(() => []);

      const answersPromise =
        cachedAnswers !== undefined
          ? Promise.resolve(cachedAnswers)
          : authFetch(
              `${API_BASE_URL}/api/registration-answers/?submission=${submissionId}`,
              { credentials: "include" }
            )
              .then((r) => r.json().catch(() => []))
              .then((answersData) => {
                const answersMap = {};
                (Array.isArray(answersData) ? answersData : []).forEach((ans) => {
                  if (ans?.field) answersMap[ans.field] = ans.value_text || "";
                });
                regAnswersCacheRef.current.set(submissionId, answersMap);
                return answersMap;
              })
              .catch(() => ({}));

      const [fields, answersMap] = await Promise.all([fieldsPromise, answersPromise]);

      setRegViewFields(fields);
      setRegViewAnswersByField(answersMap);
    } catch (err) {
      setRegViewError(err.message || "Не удалось загрузить регистрацию");
    } finally {
      setRegViewLoading(false);
    }
  };

  const openRegistrationView = (post) => {
    setRegViewOpen(true);
    setRegViewPost(post);
    loadRegistrationView(post);
  };

  const cancelRegistration = async () => {
    if (!regViewPost?.id || !regViewSubmissionId) {
      setRegViewError("Не удалось найти вашу заявку");
      return;
    }
    if (regCancelLoading) return;

    setRegCancelLoading(true);
    setRegViewError("");

    try {
      const res = await authFetch(
        `${API_BASE_URL}/api/registration-submissions/${regViewSubmissionId}/`,
        { method: "DELETE", credentials: "include" }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || `Ошибка удаления: ${res.status}`);
      }

      setRegisteredEventsRemote((prev) =>
        Array.isArray(prev) ? prev.filter((p) => p.id !== regViewPost.id) : []
      );
      setRegistrationMetaByPostId((prev) => {
        const next = new Map(prev);
        next.delete(regViewPost.id);
        return next;
      });
      regAnswersCacheRef.current.delete(regViewSubmissionId);
      window.dispatchEvent(new Event("registrations-updated"));

      closeRegistrationView();
      setToast({ type: "success", message: "Регистрация отменена" });
      setTimeout(() => setToast(null), 3500);
    } catch (err) {
      setRegViewError(err.message || "Не удалось отменить регистрацию");
    } finally {
      setRegCancelLoading(false);
    }
  };

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

  useEffect(() => {
    const handler = () => setRegistrationsVersion((v) => v + 1);
    window.addEventListener("registrations-updated", handler);
    return () =>
      window.removeEventListener("registrations-updated", handler);
  }, []);

  const normalizeFieldOptions = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    try {
      return JSON.stringify(value);
    } catch {
      return "";
    }
  };

  const getFieldOptions = (field) => {
    if (!field?.options) return [];
    try {
      const parsed = JSON.parse(field.options);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // ignore
    }
    return field.options
      .split(",")
      .map((opt) => opt.trim())
      .filter(Boolean);
  };

  const loadEditRegistration = async (postId) => {
    if (!postId) return;
    if (editRegLoadedPostIdRef.current === postId) return;
    editRegLoadedPostIdRef.current = postId;

    setEditRegLoading(true);
    setEditRegError("");
    setEditRegFormId(null);
    setEditRegTitle("");
    setEditRegFields([]);

    try {
      const formsRes = await authFetch(
        `${API_BASE_URL}/api/registration-forms/?post=${postId}`,
        { credentials: "include" }
      );
      const formsData = await formsRes.json().catch(() => []);
      const form = Array.isArray(formsData) ? formsData[0] : formsData;

      if (!form?.id) return;

      setEditRegFormId(form.id);
      setEditRegTitle(form.title || "");

      const fieldsRes = await authFetch(
        `${API_BASE_URL}/api/registration-fields/?form=${form.id}`,
        { credentials: "include" }
      );
      const fieldsData = await fieldsRes.json().catch(() => []);
      const fields = Array.isArray(fieldsData)
        ? fieldsData
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
            .map((f) => ({
              ...f,
              _isNew: false,
              is_active: f?.is_active !== false,
              options: normalizeFieldOptions(f.options),
            }))
        : [];
      setEditRegFields(fields);
    } catch {
      setEditRegError("Не удалось загрузить форму регистрации");
    } finally {
      setEditRegLoading(false);
    }
  };

  const addEditRegField = () => {
    setEditRegFields((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        _isNew: true,
        label: "",
        field_type: "text",
        is_required: false,
        options: "",
        is_active: true,
      },
    ]);
  };

  const updateEditRegField = (id, key, value) => {
    setEditRegFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [key]: value } : f))
    );
  };

  const removeEditRegField = (id) => {
    setEditRegFields((prev) => prev.filter((f) => f.id !== id));
  };

  const toggleEditRegFieldActive = (id) => {
    setEditRegFields((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, is_active: !(f?.is_active !== false) } : f
      )
    );
  };

  // Загрузка зарегистрированных мероприятий студента
  useEffect(() => {
    const loadRegistrations = async () => {
      if (isOrg || !authUserId) {
        setRegisteredEventsRemote([]);
        setRegistrationMetaByPostId(new Map());
        return;
      }
      setRegisteredEventsLoading(true);
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
          setRegisteredEventsRemote([]);
          setRegistrationMetaByPostId(new Map());
          return;
        }

        const formsRes = await authFetch(
          `${API_BASE_URL}/api/registration-forms/`,
          {
            credentials: "include",
          }
        );
        const forms = await formsRes.json().catch(() => []);
        const formsById = new Map(
          (Array.isArray(forms) ? forms : []).map((f) => [f.id, f])
        );
        const postIds = new Set();
        const meta = new Map();
        userSubs.forEach((s) => {
          const form = formsById.get(s.form);
          if (!form?.post) return;
          postIds.add(form.post);
          if (!meta.has(form.post)) {
            meta.set(form.post, { submissionId: s.id, formId: s.form });
          }
        });
        setRegistrationMetaByPostId(meta);
        if (postIds.size === 0) {
          setRegisteredEventsRemote([]);
          setRegistrationMetaByPostId(new Map());
          return;
        }

        const postsRes = await authFetch(`${API_BASE_URL}/api/posts/`, {
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
        setRegistrationMetaByPostId(new Map());
      } finally {
        setRegisteredEventsLoading(false);
      }
    };

    loadRegistrations();
  }, [isOrg, user, registrationsVersion]);

  const openEdit = (post) => {
    setSelectedPost(post);
    setEditForm({
      title: post.title || "",
      content: post.content || "",
      date:
        (post.published_at || post.date || "").toString().slice(0, 10) || "",
      type: post.type || "info",
      imageSource: post.image_url ? "url" : "file",
      imageUrl: post.image_url || "",
      imageFile: null,
    });

    editRegLoadedPostIdRef.current = null;
    setEditRegFormId(null);
    setEditRegTitle("");
    setEditRegFields([]);
    setEditRegError("");
    if ((post.type || "") === "event" || post.is_form) {
      loadEditRegistration(post.id);
    }

    setEditModalOpen(true);
    setMenuOpenId(null);
  };

  useEffect(() => {
    if (!editModalOpen || !selectedPost?.id) return;
    if (editForm.type !== "event") return;
    loadEditRegistration(selectedPost.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editModalOpen, selectedPost?.id, editForm.type]);

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
      const formsRes = await authFetch(`${API_BASE_URL}/api/registration-forms/`, {
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

      const fieldsRes = await authFetch(
        `${API_BASE_URL}/api/registration-fields/`,
        {
          credentials: "include",
        }
      );
      const fields = await fieldsRes.json().catch(() => []);
      const fieldsMap = new Map(
        (Array.isArray(fields) ? fields : [])
          .filter((f) => f.form === form.id)
          .map((f) => [f.id, f])
      );

      const subsRes = await authFetch(
        `${API_BASE_URL}/api/registration-submissions/`,
        { credentials: "include" }
      );
      const subs = await subsRes.json().catch(() => []);
      const submissions = Array.isArray(subs)
        ? subs.filter((s) => s.form === form.id)
        : [];

      const answersRes = await authFetch(
        `${API_BASE_URL}/api/registration-answers/`,
        { credentials: "include" }
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
        const studentsRes = await authFetch(`${API_BASE_URL}/api/students/`, {
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
    editRegLoadedPostIdRef.current = null;
    setEditRegFormId(null);
    setEditRegTitle("");
    setEditRegFields([]);
    setEditRegError("");
    setEditRegLoading(false);
    setEditRegSaving(false);
    setEditSaving(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPost) return;

    if (editSaving || editRegSaving) return;
    setEditSaving(true);
    setEditRegError("");

    try {
      const formData = new FormData();
      formData.append("type", editForm.type);
      formData.append("title", editForm.title || "");
      formData.append("content", editForm.content || "");
      if (editForm.imageSource === "url") {
        formData.append("image_url", editForm.imageUrl?.trim() || "");
      } else if (selectedPost.image_url) {
        formData.append("image_url", "");
      }
      formData.append("is_form", editForm.type === "event" ? "true" : "false");
      formData.append("published_at", editForm.date || "");
      formData.append("club", (user?.orgId ?? user?.id ?? "").toString());
      if (selectedPost.form) formData.append("form", selectedPost.form.toString());
      if (editForm.imageSource === "file" && editForm.imageFile)
        formData.append("image_file", editForm.imageFile);

      const res = await authFetch(`${API_BASE_URL}/api/posts/${selectedPost.id}/`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      const updated = await res.json().catch(() => null);
      if (!res.ok) {
        const message =
          updated?.detail ||
          updated?.image_file?.[0] ||
          updated?.image?.[0] ||
          "Не удалось обновить пост";
        throw new Error(message);
      }

      setOrgPostsRemote((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      setSelectedPost(updated);

      if (editForm.type === "event") {
        setEditRegSaving(true);
        setEditRegError("");
        try {
          const baseHeaders = { "Content-Type": "application/json" };
          const postId = updated.id;
          const desiredTitle =
            (editRegTitle || "").trim() ||
            (editForm.title || "").trim() ||
            updated.title;

          let formId = editRegFormId;
          if (!formId) {
            if (editRegFields.length > 0) {
              const createRes = await authFetch(
                `${API_BASE_URL}/api/registration-forms/`,
                {
                  method: "POST",
                  headers: baseHeaders,
                  credentials: "include",
                  body: JSON.stringify({ title: desiredTitle, post: postId }),
                }
              );
              const created = await createRes.json().catch(() => null);
              if (!createRes.ok) {
                throw new Error(
                  created?.detail || "Не удалось создать форму регистрации"
                );
              }
              formId = created?.id;
              setEditRegFormId(formId || null);
            }
          } else {
            const patchRes = await authFetch(
              `${API_BASE_URL}/api/registration-forms/${formId}/`,
              {
                method: "PATCH",
                headers: baseHeaders,
                credentials: "include",
                body: JSON.stringify({ title: desiredTitle }),
              }
            );
            if (!patchRes.ok) {
              const patched = await patchRes.json().catch(() => null);
              throw new Error(
                patched?.detail || "Не удалось обновить форму регистрации"
              );
            }
          }

          if (formId) {
            const nextFields = [];
            for (let i = 0; i < editRegFields.length; i += 1) {
              const field = editRegFields[i];
              const payload = {
                label: (field.label || "").trim() || `Вопрос ${i + 1}`,
                field_type: field.field_type || "text",
                is_required: !!field.is_required,
                sort_order: i,
                options: field.options || "",
                form: formId,
                is_active: field?.is_active !== false,
              };

              if (field._isNew) {
                const fieldRes = await authFetch(
                  `${API_BASE_URL}/api/registration-fields/`,
                  {
                    method: "POST",
                    headers: baseHeaders,
                    credentials: "include",
                    body: JSON.stringify(payload),
                  }
                );
                const createdField = await fieldRes.json().catch(() => null);
                if (!fieldRes.ok) {
                  throw new Error(
                    createdField?.detail || "Не удалось сохранить поле формы"
                  );
                }
                nextFields.push({
                  ...createdField,
                  _isNew: false,
                  is_active: createdField?.is_active !== false,
                  options: normalizeFieldOptions(
                    createdField?.options ?? payload.options
                  ),
                });
              } else {
                const fieldRes = await authFetch(
                  `${API_BASE_URL}/api/registration-fields/${field.id}/`,
                  {
                    method: "PATCH",
                    headers: baseHeaders,
                    credentials: "include",
                    body: JSON.stringify(payload),
                  }
                );
                const updatedField = await fieldRes.json().catch(() => null);
                if (!fieldRes.ok) {
                  throw new Error(
                    updatedField?.detail || "Не удалось обновить поле формы"
                  );
                }
                nextFields.push({
                  ...field,
                  ...updatedField,
                  _isNew: false,
                  is_active: updatedField?.is_active !== false,
                  options: normalizeFieldOptions(
                    updatedField?.options ?? payload.options
                  ),
                });
              }
            }
            setEditRegFields(nextFields);
          }
        } catch (err) {
          setEditRegError(
            err.message || "Не удалось сохранить форму регистрации"
          );
          throw err;
        } finally {
          setEditRegSaving(false);
        }
      }
      setToast({ type: "success", message: "Пост обновлён" });
      setTimeout(() => setToast(null), 3000);
      setEditSaving(false);
      closeModals();
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Не удалось обновить пост",
      });
      setTimeout(() => setToast(null), 4000);
      setEditSaving(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (!selectedPost) return;
    setDeleteLoading(true);

    authFetch(`${API_BASE_URL}/api/posts/${selectedPost.id}/`, {
      method: "DELETE",
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

      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        formData.append(key, value ?? "");
      });
      if (studentAvatarFile) formData.append("avatar_file", studentAvatarFile);

      const res = await authFetch(`${API_BASE_URL}/api/students/${user.id}/`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const message =
          data?.detail ||
          data?.avatar_file?.[0] ||
          data?.avatar_url?.[0] ||
          "Не удалось обновить профиль";
        throw new Error(message);
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
              avatarUrl: data?.avatar_url ?? prev.avatarUrl,
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

      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        formData.append(key, value ?? "");
      });
      if (orgAvatarFile) formData.append("avatar_file", orgAvatarFile);

      const res = await authFetch(`${API_BASE_URL}/api/clubs/${user.orgId}/`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const message =
          data?.detail ||
          data?.avatar_file?.[0] ||
          data?.avatar_url?.[0] ||
          "Не удалось обновить профиль организации";
        throw new Error(message);
      }

      setOrgInfo(data || payload);
      setUser((prev) =>
        prev
          ? {
              ...prev,
              orgName: data?.name ?? payload.name,
              description: data?.description ?? payload.description,
              avatarUrl: data?.avatar_url ?? prev.avatarUrl,
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
            <div className="flex items-center justify-center w-20 h-20 overflow-hidden text-2xl font-bold text-white shadow-lg rounded-2xl bg-gradient-to-br from-primary to-purple-600">
              {buildMediaUrl(
                isOrg ? orgInfo?.avatar_url || user?.avatarUrl : user?.avatarUrl
              ) ? (
                <img
                  src={buildMediaUrl(
                    isOrg
                      ? orgInfo?.avatar_url || user?.avatarUrl
                      : user?.avatarUrl
                  )}
                  alt=""
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "";
                  }}
                />
              ) : (
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
              )}
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
                  const orgId = event.club;
                  const orgName =
                    event.club_name ||
                    getOrg(event.orgId)?.name ||
                    getOrg(event.club)?.name ||
                    "Организация";
                  return (
                    <article
                      key={event.id}
                      className="p-4 transition-shadow border shadow-sm lg:p-5 bg-white/90 border-slate-200 rounded-2xl hover:shadow-md animate-slide-up"
                      style={{ animationDelay: `${idx * 80}ms` }}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="space-y-1">
                          {orgId ? (
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/organization/${orgId}`}
                                className="flex items-center justify-center w-8 h-8 overflow-hidden bg-white border rounded-full border-slate-200 hover:border-primary transition"
                                aria-label={orgName}
                                title={orgName}
                              >
                                <img
                                  src={
                                    buildMediaUrl(event.club_avatar_url) ||
                                    "/OrganizationLogo/DefaultLogo.jpg"
                                  }
                                  alt={orgName}
                                  className="object-cover w-full h-full"
                                  loading="lazy"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src =
                                      "/OrganizationLogo/DefaultLogo.jpg";
                                  }}
                                />
                              </Link>
                              <Link
                                to={`/organization/${orgId}`}
                                className="text-sm font-semibold text-primary hover:underline"
                              >
                                {orgName}
                              </Link>
                            </div>
                          ) : (
                            <p className="text-sm font-semibold text-primary">
                              {orgName}
                            </p>
                          )}
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

                      <p className="mb-3 text-slate-700 whitespace-pre-wrap break-words">
                        {event.content}
                      </p>

                      {event.image_url || event.image ? (
                        <img
                          src={
                            buildMediaUrl(event.image_url) ||
                            buildMediaUrl(event.image) ||
                            event.image_url ||
                            event.image
                          }
                          alt={event.title}
                          className="object-cover w-full mb-3 rounded-xl max-h-60"
                        />
                      ) : null}

                      <div className="flex justify-end mt-3">
                        <button
                          type="button"
                          onClick={() => openRegistrationView(event)}
                          className="px-4 py-2 text-sm font-semibold text-white rounded-xl bg-emerald-500 shadow-md hover:shadow-lg transition-all"
                        >
                          Вы зарегистрированы
                        </button>
                      </div>
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
                      <p className="mb-3 text-slate-700 whitespace-pre-wrap break-words">
                        {post.content}
                      </p>
                      {post.image_url || post.image ? (
                        <img
                          src={
                            buildMediaUrl(post.image_url) ||
                            buildMediaUrl(post.image) ||
                            post.image_url ||
                            post.image
                          }
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
      {regViewOpen && regViewPost && (
        <div
          className="fixed inset-0 z-[12000] flex items-center justify-center w-screen h-screen bg-black/60 backdrop-blur-sm px-4"
          onClick={closeRegistrationView}
        >
          <div
            className="relative w-full max-w-md p-6 bg-white shadow-2xl rounded-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-2 text-xl font-bold text-slate-900">
              Ваша регистрация
            </h3>
            <p className="mb-4 text-sm text-slate-600">{regViewPost.title}</p>

            <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
              {regViewLoading ? (
                <p className="text-sm text-slate-600">Загружаем ответы...</p>
              ) : regViewError ? (
                <div className="p-3 text-sm border rounded-lg text-rose-600 bg-rose-50 border-rose-200">
                  {regViewError}
                </div>
              ) : regViewFields.length === 0 ? (
                <p className="text-sm text-slate-600">
                  Форма регистрации пока не заполнена.
                </p>
              ) : (
                regViewFields.map((field) => {
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
                        {field.label}
                      </label>
                      {field.field_type === "select" ? (
                        <select
                          value={regViewAnswersByField[field.id] ?? ""}
                          disabled
                          className="w-full px-3 py-2 bg-white border-2 rounded-lg border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        >
                          <option value="">
                            {regViewAnswersByField[field.id] ? "" : "—"}
                          </option>
                          {options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={inputType}
                          value={regViewAnswersByField[field.id] ?? ""}
                          disabled
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
                  onClick={closeRegistrationView}
                  className="px-4 py-2 text-sm font-semibold transition border text-slate-600 rounded-xl bg-slate-100 border-slate-200 hover:bg-slate-200"
                >
                  Закрыть
                </button>
                <button
                  type="button"
                  onClick={cancelRegistration}
                  disabled={regCancelLoading || regViewLoading}
                  className="px-4 py-2 text-sm font-semibold text-white rounded-xl bg-rose-500 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {regCancelLoading ? "Отменяем..." : "Отменить регистрацию"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
              <div className="flex justify-center">
                <label
                  htmlFor="org-avatar-input"
                  className="group relative flex items-center justify-center w-24 h-24 overflow-hidden border-2 border-dashed rounded-full cursor-pointer border-slate-300 bg-slate-50 hover:border-primary transition"
                  aria-label="Upload avatar"
                >
                  {orgAvatarPreviewUrl ||
                  buildMediaUrl(orgInfo?.avatar_url || user?.avatarUrl) ? (
                    <img
                      src={
                        orgAvatarPreviewUrl ||
                        buildMediaUrl(orgInfo?.avatar_url || user?.avatarUrl)
                      }
                      alt=""
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <svg
                      className="w-10 h-10 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center transition opacity-0 group-hover:opacity-100 bg-black/40">
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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                </label>
                <input
                  id="org-avatar-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (!file.type?.startsWith("image/")) {
                      setToast({
                        type: "error",
                        message: "Please select an image file.",
                      });
                      setTimeout(() => setToast(null), 4000);
                      e.target.value = "";
                      return;
                    }
                    if (file.size > MAX_UPLOAD_BYTES) {
                      setToast({
                        type: "error",
                        message: "Файл слишком большой. Максимальный размер — 2 МБ.",
                      });
                      setTimeout(() => setToast(null), 4000);
                      e.target.value = "";
                      return;
                    }
                    setOrgAvatarFile(file);
                  }}
                />
              </div>
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
              <div className="flex justify-center">
                <label
                  htmlFor="student-avatar-input"
                  className="group relative flex items-center justify-center w-24 h-24 overflow-hidden border-2 border-dashed rounded-full cursor-pointer border-slate-300 bg-slate-50 hover:border-primary transition"
                  aria-label="Upload avatar"
                >
                  {studentAvatarPreviewUrl || buildMediaUrl(user?.avatarUrl) ? (
                    <img
                      src={
                        studentAvatarPreviewUrl || buildMediaUrl(user?.avatarUrl)
                      }
                      alt=""
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <svg
                      className="w-10 h-10 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center transition opacity-0 group-hover:opacity-100 bg-black/40">
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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                </label>
                <input
                  id="student-avatar-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (!file.type?.startsWith("image/")) {
                      setToast({
                        type: "error",
                        message: "Please select an image file.",
                      });
                      setTimeout(() => setToast(null), 4000);
                      e.target.value = "";
                      return;
                    }
                    if (file.size > MAX_UPLOAD_BYTES) {
                      setToast({
                        type: "error",
                        message: "Файл слишком большой. Максимальный размер — 2 МБ.",
                      });
                      setTimeout(() => setToast(null), 4000);
                      e.target.value = "";
                      return;
                    }
                    setStudentAvatarFile(file);
                  }}
                />
              </div>
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
              className="relative w-full max-w-lg bg-white shadow-2xl rounded-2xl my-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="max-h-[calc(100vh-2rem)] overflow-y-auto p-6 pr-4">
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
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Картинка
                  </label>
                  <div className="inline-flex items-center gap-2 p-1 ml-2 border bg-slate-100/70 border-slate-200 rounded-xl">
                    <button
                      type="button"
                      onClick={() =>
                        setEditForm((f) => ({
                          ...f,
                          imageSource: "file",
                          imageUrl: "",
                        }))
                      }
                      className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                        editForm.imageSource === "file"
                          ? "bg-gradient-to-r from-primary via-purple-600 to-indigo-600 text-white shadow-md"
                          : "text-slate-700 hover:bg-white"
                      }`}
                    >
                      Файлом
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setEditForm((f) => ({
                          ...f,
                          imageSource: "url",
                          imageFile: null,
                        }))
                      }
                      className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                        editForm.imageSource === "url"
                          ? "bg-gradient-to-r from-primary via-purple-600 to-indigo-600 text-white shadow-md"
                          : "text-slate-700 hover:bg-white"
                      }`}
                    >
                      По ссылке
                    </button>
                  </div>

                  {editForm.imageSource === "url" && (
                    <>
                      <input
                        type="url"
                        value={editForm.imageUrl}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            imageUrl: e.target.value,
                          }))
                        }
                        placeholder="https://..."
                        className="w-full h-[52px] px-4 py-3 transition-all duration-300 bg-white border-2 shadow-sm rounded-xl border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary hover:shadow-md"
                      />
                      <p className="text-xs text-slate-500 min-h-[1rem]">
                        {"\u00A0"}
                      </p>
                    </>
                  )}

                  {editForm.imageSource === "file" && (
                    <>
                      <input
                        id="edit-post-image-file"
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (!file.type?.startsWith("image/")) {
                            setToast({
                              type: "error",
                              message:
                                "Выбери изображение (png/jpg/webp и т.п.)",
                            });
                            setTimeout(() => setToast(null), 3500);
                            e.target.value = "";
                            return;
                          }
                          if (file.size > MAX_UPLOAD_BYTES) {
                            setToast({
                              type: "error",
                              message:
                                "Файл слишком большой. Максимальный размер — 2 МБ.",
                            });
                            setTimeout(() => setToast(null), 3500);
                            e.target.value = "";
                            return;
                          }
                          setEditForm((f) => ({ ...f, imageFile: file }));
                        }}
                      />
                      <label
                        htmlFor="edit-post-image-file"
                        className="w-full h-[52px] inline-flex items-center justify-center px-4 py-3 font-semibold text-white rounded-xl border-2 border-transparent bg-gradient-to-r from-primary via-purple-600 to-indigo-600 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all cursor-pointer select-none"
                      >
                        Выбрать файл
                      </label>
                      <p className="text-xs text-slate-500 min-h-[1rem]">
                        {editForm.imageFile
                          ? `Выбрано: ${editForm.imageFile.name}`
                          : "\u00A0"}
                      </p>
                    </>
                  )}
                </div>

                {editForm.type === "event" && (
                  <div className="p-4 pr-2 space-y-3 border rounded-xl border-slate-200 bg-slate-50/70 max-h-[45vh] overflow-y-auto overscroll-contain">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Форма регистрации
                        </p>
                        <p className="text-xs text-slate-500">
                          Поля можно править/скрывать — существующие ответы не
                          трогаем.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={addEditRegField}
                        className="px-3 py-1.5 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-primary via-purple-600 to-indigo-600 shadow-md hover:shadow-lg transition"
                      >
                        Добавить поле
                      </button>
                    </div>

                    <div className="space-y-1">
                      <input
                        type="text"
                        value={editRegTitle}
                        onChange={(e) => setEditRegTitle(e.target.value)}
                        placeholder="Название формы (необязательно)"
                        className="w-full px-3 py-2 bg-white border-2 rounded-lg border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>

                    {editRegLoading ? (
                      <p className="text-sm text-slate-600">Загрузка формы...</p>
                    ) : editRegError ? (
                      <p className="text-sm text-rose-600">{editRegError}</p>
                    ) : editRegFields.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        Полей пока нет — нажми «Добавить поле».
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {editRegFields.map((field, idx) => {
                          const isActive = field?.is_active !== false;
                          const canRemove = !!field?._isNew;
                          return (
                            <div
                              key={field.id}
                              className={`p-3 bg-white border shadow-sm rounded-xl border-slate-200 ${
                                isActive ? "" : "opacity-60"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2 gap-2">
                                <span className="text-sm font-semibold text-slate-800">
                                  Вопрос {idx + 1}
                                </span>
                                <div className="flex items-center gap-3">
                                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                                    <input
                                      type="checkbox"
                                      checked={!!field.is_required}
                                      onChange={(e) =>
                                        updateEditRegField(
                                          field.id,
                                          "is_required",
                                          e.target.checked
                                        )
                                      }
                                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                    Обязательно
                                  </label>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      canRemove
                                        ? removeEditRegField(field.id)
                                        : toggleEditRegFieldActive(field.id)
                                    }
                                    className="px-2 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                                  >
                                    {canRemove
                                      ? "Удалить"
                                      : isActive
                                        ? "Скрыть"
                                        : "Показать"}
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="space-y-1">
                                  <label className="text-xs font-semibold text-slate-700">
                                    Текст вопроса
                                  </label>
                                  <input
                                    type="text"
                                    value={field.label || ""}
                                    onChange={(e) =>
                                      updateEditRegField(
                                        field.id,
                                        "label",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-3 py-2 bg-white border-2 rounded-lg border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                    required
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-xs font-semibold text-slate-700">
                                    Тип поля
                                  </label>
                                  <select
                                    value={field.field_type || "text"}
                                    onChange={(e) =>
                                      updateEditRegField(
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
                                    <option value="select">Выбор</option>
                                  </select>
                                </div>
                              </div>

                              {field.field_type === "select" && (
                                <div className="mt-3 space-y-1">
                                  <label className="text-xs font-semibold text-slate-700">
                                    Варианты (через запятую или JSON-массив)
                                  </label>
                                  <input
                                    type="text"
                                    value={field.options || ""}
                                    onChange={(e) =>
                                      updateEditRegField(
                                        field.id,
                                        "options",
                                        e.target.value
                                      )
                                    }
                                    placeholder='Например: "A,B,C" или ["A","B"]'
                                    className="w-full px-3 py-2 bg-white border-2 rounded-lg border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
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
                    disabled={editSaving || editRegSaving}
                    className="px-4 py-2 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-primary via-purple-600 to-indigo-600 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Сохранить{" "}
                  </button>
                </div>
              </form>
              </div>
            </div>
          )}

          {deleteModalOpen && selectedPost && (
            <div
              className="relative w-full max-w-md bg-white shadow-2xl rounded-2xl my-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="max-h-[calc(100vh-2rem)] overflow-y-auto p-6 pr-4">
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
            </div>
          )}

          {statsModalOpen && selectedPost && (
            <div
              className="relative w-full max-w-md bg-white shadow-2xl rounded-2xl my-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="max-h-[calc(100vh-2rem)] overflow-y-auto p-6 pr-4">
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
            </div>
          )}
        </div>
      )}
    </>
  );
}
