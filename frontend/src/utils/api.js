const BASE = "/api";

async function request(method, path, body) {
  const opts = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`);
  return json;
}

export const api = {
  // Users
  getUsers:   ()         => request("GET",    "/users"),
  createUser: (data)     => request("POST",   "/users", data),
  updateUser: (id, data) => request("PUT",    `/users/${id}`, data),
  deleteUser: (id)       => request("DELETE", `/users/${id}`),

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
