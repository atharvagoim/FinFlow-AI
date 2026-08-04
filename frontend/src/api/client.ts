import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

let accessToken: string | null = null;
export function setAccessToken(token: string | null) {
  accessToken = token;
}

apiClient.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// On a 401, try refreshing the access token once using the stored refresh
// token before giving up and forcing a re-login. Keeps the user logged in
// across access-token expiry without a full page reload.
let isRefreshing = false;

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && !isRefreshing) {
      original._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = localStorage.getItem("finflow-refresh-token");
        if (!refreshToken) throw error;
        const { data } = await axios.post(`${apiClient.defaults.baseURL}/auth/refresh`, { refreshToken });
        setAccessToken(data.data.accessToken);
        localStorage.setItem("finflow-access-token", data.data.accessToken);
        localStorage.setItem("finflow-refresh-token", data.data.refreshToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return apiClient(original);
      } catch (refreshErr) {
        localStorage.removeItem("finflow-access-token");
        localStorage.removeItem("finflow-refresh-token");
        localStorage.removeItem("finflow-user");
        window.location.href = "/login";
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
