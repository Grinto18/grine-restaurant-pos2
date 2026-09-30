export const CloudSync = {
  async push(scope: string, payload: unknown) {
    if (!navigator.onLine) return false;
    try { const response = await fetch(`/api/sync?scope=${encodeURIComponent(scope)}`, { method:'PUT', headers:{'content-type':'application/json'}, body:JSON.stringify(payload) }); return response.ok; } catch { return false; }
  },
};
