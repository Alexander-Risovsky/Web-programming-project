export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

// Resolve media paths coming from the backend (e.g. "/media/club_avatars/x.jpg")
export const buildMediaUrl = (path) => {
	if (!path) return null;
	if (path.startsWith('http://') || path.startsWith('https://')) return path;
	const normalized = path.startsWith('/') ? path : `/${path}`;
	return `${API_BASE_URL}${normalized}`;
};