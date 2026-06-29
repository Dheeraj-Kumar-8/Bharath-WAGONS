const BASE = "/api";

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
  // Users
  getUsers:   ()         => request("GET",    "/users",        null, true),
  createUser: (data)     => request("POST",   "/users",        data),
  updateUser:      (id, data)   => request("PUT",   `/users/${id}`,        data, true),
  patchUserStatus: (id, status) => request("PATCH", `/users/${id}/status`, { status }, true),
  patchUserRole:   (id, role)   => request("PATCH", `/users/${id}/role`,   { role },   true),
  deleteUser:      (id)         => request("DELETE", `/users/${id}`,        null, true),

  // Wagons
  getWagons:   ()         => request("GET",    "/wagons"),
  createWagon: (data)     => request("POST",   "/wagons", data),
  updateWagon: (id, data) => request("PUT",    `/wagons/${id}`, data),
  deleteWagon: (id)       => request("DELETE", `/wagons/${id}`),

  // Analytics
  getAnalytics:   ()     => request("GET",    "/analytics"),
  createAnalytic: (data) => request("POST",   "/analytics", data),
  deleteAnalytic: (id)   => request("DELETE", `/analytics/${id}`),

  // Debug
  dbStatus: () => request("GET",  "/debug/db-status"),
  testSave: () => request("POST", "/debug/test-save"),
};
