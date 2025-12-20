const inFlight = new Map();
const cache = new Map();
const CACHE_TTL_MS = 2000;
const MAX_CACHE_ENTRIES = 50;

const normalizeHeaders = (headers) => {
  if (!headers) return [];
  try {
    return Array.from(new Headers(headers).entries()).sort(([a], [b]) =>
      a.localeCompare(b)
    );
  } catch {
    return [];
  }
};

const responseFromEntry = (entry) => {
  const headers = new Headers(entry.headers || []);
  return new Response(entry.body?.slice?.(0) ?? entry.body, {
    status: entry.status,
    statusText: entry.statusText,
    headers,
  });
};

export async function dedupFetch(url, options = {}) {
  const method = (options?.method || "GET").toUpperCase();
  if (method !== "GET") {
    return fetch(url, options);
  }

  const creds = options?.credentials || "same-origin";
  const headers = normalizeHeaders(options?.headers);
  const key = JSON.stringify([method, url, creds, headers]);

  const now = Date.now();
  const cached = cache.get(key);
  if (cached && cached.expiresAt > now) {
    return responseFromEntry(cached.entry);
  }
  if (cached) {
    cache.delete(key);
  }

  if (inFlight.has(key)) {
    const entry = await inFlight.get(key);
    return responseFromEntry(entry);
  }

  const promise = (async () => {
    const res = await fetch(url, options);
    const body = await res.clone().arrayBuffer();
    return {
      status: res.status,
      statusText: res.statusText,
      headers: Array.from(res.headers.entries()),
      body,
    };
  })();

  inFlight.set(key, promise);

  try {
    const entry = await promise;
    cache.set(key, { entry, expiresAt: Date.now() + CACHE_TTL_MS });
    if (cache.size > MAX_CACHE_ENTRIES) {
      for (const [k, v] of cache) {
        if (v.expiresAt <= Date.now()) cache.delete(k);
        if (cache.size <= MAX_CACHE_ENTRIES) break;
      }
      while (cache.size > MAX_CACHE_ENTRIES) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
    }
    return responseFromEntry(entry);
  } finally {
    inFlight.delete(key);
  }
}
