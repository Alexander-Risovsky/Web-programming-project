export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export const buildMediaUrl = (path) => {
	if (!path) return null;
	if (path.startsWith('http://') || path.startsWith('https://')) return path;
	const normalized = path.startsWith('/') ? path : `/${path}`;
	return `${API_BASE_URL}${normalized}`;
};