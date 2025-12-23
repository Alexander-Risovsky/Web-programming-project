import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { buildMediaUrl } from "../config";

export default function PostDetailsModal({ post, club, onClose }) {
  useEffect(() => {
    if (!post) return undefined;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [post, onClose]);

  if (!post) return null;

  const clubId = post.club ?? club?.id ?? null;
  const clubName = post.club_name || club?.name || "Организация";
  const clubAvatar =
    buildMediaUrl(post.club_avatar_url) ||
    buildMediaUrl(club?.avatar_url) ||
    "/OrganizationLogo/DefaultLogo.jpg";

  const rawDate = post?.published_at || post?.date || "";
  let dateLabel = "";
  if (rawDate) {
    if (typeof rawDate === "string") {
      const parsed = Date.parse(rawDate);
      dateLabel = Number.isNaN(parsed)
        ? rawDate
        : new Date(parsed).toLocaleDateString("ru-RU");
    } else {
      const d = new Date(rawDate);
      dateLabel = Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("ru-RU");
    }
  }

  const imageSrc =
    buildMediaUrl(post.image_url) ||
    buildMediaUrl(post.image) ||
    buildMediaUrl(post.img) ||
    post.img ||
    post.image_url ||
    post.image;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 w-screen h-screen"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-lg bg-white shadow-2xl rounded-2xl animate-slide-up overflow-hidden max-h-[calc(100vh-2rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 p-5 border-b border-slate-100">
          <div className="min-w-0">
            <h3 className="text-xl font-bold text-slate-900 break-words">
              {post.title}
            </h3>
            <p className="mt-1 text-sm text-slate-500">{dateLabel}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
            aria-label="Закрыть"
            title="Закрыть"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 min-h-0 p-5 pt-4 overflow-y-auto">
          {clubId ? (
            <div className="flex items-center gap-2 mb-3">
              <Link
                to={`/organization/${clubId}`}
                onClick={onClose}
                className="flex items-center justify-center w-8 h-8 overflow-hidden bg-white border rounded-full border-slate-200 hover:border-primary transition"
                aria-label={clubName}
                title={clubName}
              >
                <img
                  src={clubAvatar}
                  alt={clubName}
                  className="object-cover w-full h-full"
                  loading="lazy"
                />
              </Link>
              <Link
                to={`/organization/${clubId}`}
                onClick={onClose}
                className="text-sm font-semibold text-primary hover:underline truncate"
              >
                {clubName}
              </Link>
            </div>
          ) : null}

          <p className="mb-4 text-slate-700 whitespace-pre-wrap break-words">
            {post.content || ""}
          </p>

          {imageSrc ? (
            <img
              src={imageSrc}
              alt={post.title}
              className="object-cover w-full h-56 rounded-xl"
            />
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}

