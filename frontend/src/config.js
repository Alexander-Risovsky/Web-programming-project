// export const API_BASE_URL = '__VITE_BACKEND_URL__' || 'http://localhost:8000';
const envBase = import.meta.env?.VITE_BACKEND_URL;
export const API_BASE_URL =
  envBase && !envBase.includes("__VITE_BACKEND_URL__")
    ? envBase
    : "http://localhost:8000";

export const buildMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
};
