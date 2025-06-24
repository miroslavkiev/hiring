import toast from 'react-hot-toast';

function addAuth(options: any = {}) {
  const idToken = localStorage.getItem('idToken') || '';
  return {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${idToken}`,
    },
  };
}

export async function apiFetch(url: string, options: any = {}) {
  const res = await fetch(url, addAuth(options));
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    toast.error('Action failed – see console for details');
    console.error('API error', url, data);
    throw new Error(data.error || 'Unknown error');
  }
  return res.json();
}

export const api = {
  get: (url: string, options: any = {}) => apiFetch(url, { ...options, method: 'GET' }),
  post: (url: string, body: unknown, options: any = {}) =>
    apiFetch(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    }),
};

export const success = (msg: string) => toast.success(msg);

export default api;
