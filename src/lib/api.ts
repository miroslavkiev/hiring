export const api = {
  get: async (url: string, options: any = {}) => {
    const idToken = localStorage.getItem('idToken') || '';
    const res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${idToken}`,
      },
    });
    return res;
  },
  post: async (url: string, body: unknown, options: any = {}) => {
    const idToken = localStorage.getItem('idToken') || '';
    const res = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        Authorization: `Bearer ${idToken}`,
      },
      ...options,
    });
    return res;
  },
};

export default api;
