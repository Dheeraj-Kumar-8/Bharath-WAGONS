const BASE = "/api";

const toQuery = (params) => {
  const q = new URLSearchParams(params).toString();
  return q ? `?${q}` : "";
};

async function request(method, path, body, auth = false) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`);
  return json;
}

export const api = {
  getUsers:        ()         => request("GET",    "/users",        null, true),
  createUser:      (data)     => request("POST",   "/users",        data),
  updateUser:      (id, data) => request("PUT",    `/users/${id}`,  data, true),
  patchUserStatus: (id, s)    => request("PATCH",  `/users/${id}/status`, { status: s }, true),
  patchUserRole:   (id, r)    => request("PATCH",  `/users/${id}/role`,   { role: r },   true),
  deleteUser:      (id)       => request("DELETE", `/users/${id}`,  null, true),

  getWagons:   ()         => request("GET",    "/wagons",        null, true),
  createWagon: (data)     => request("POST",   "/wagons",        data, true),
  updateWagon: (id, data) => request("PUT",    `/wagons/${id}`,  data, true),
  deleteWagon: (id)       => request("DELETE", `/wagons/${id}`,  null, true),

  getAlerts:      (params = {}) => request("GET",    "/alerts" + toQuery(params),          null, true),
  getAlertStats:  (params = {}) => request("GET",    "/alerts/stats" + toQuery(params),    null, true),
  generateAlerts: (params = {}) => request("POST",   "/alerts/generate" + toQuery(params), null, true),
  resolveAlert:   (id)          => request("PATCH",  `/alerts/${id}/resolve`,              null, true),
  dismissAlert:   (id)          => request("DELETE", `/alerts/${id}`,                      null, true),

  getAnalytics:   ()     => request("GET",    "/analytics"),
  createAnalytic: (data) => request("POST",   "/analytics", data),
  deleteAnalytic: (id)   => request("DELETE", `/analytics/${id}`),

  dbStatus: () => request("GET",  "/debug/db-status"),
  testSave: () => request("POST", "/debug/test-save"),
};
