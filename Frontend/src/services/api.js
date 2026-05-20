import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

export const tokenStore = {
  getAccess: () => localStorage.getItem("access_token") || localStorage.getItem("token"),
  getRefresh: () => localStorage.getItem("refresh_token"),
  setTokens: ({ access_token, refresh_token }) => {
    if (access_token) {
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("token", access_token);
    }
    if (refresh_token) {
      localStorage.setItem("refresh_token", refresh_token);
    }
  },
  clear: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

const normalizeUser = (user) => {
  if (!user || typeof user !== "object" || Array.isArray(user)) {
    return null;
  }

  return {
    ...user,
    role: user.role || "user",
  };
};

const getStoredUser = () => {
  const rawUser = localStorage.getItem("user");

  if (!rawUser || rawUser === "undefined" || rawUser === "null") {
    if (rawUser === "undefined" || rawUser === "null") {
      localStorage.removeItem("user");
    }

    return null;
  }

  try {
    const user = normalizeUser(JSON.parse(rawUser));

    if (!user) {
      localStorage.removeItem("user");
    }

    return user;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStore.getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes("/auth/login") || originalRequest.url?.includes("/auth/refresh")) {
      tokenStore.clear();
      return Promise.reject(error);
    }

    const refreshToken = tokenStore.getRefresh();
    if (!refreshToken) {
      tokenStore.clear();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshPromise = refreshPromise || axios.post(`${API_BASE_URL}/auth/refresh`, {
        refresh_token: refreshToken,
      });
      const { data } = await refreshPromise;
      refreshPromise = null;
      tokenStore.setTokens({ access_token: data.access_token });
      originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      refreshPromise = null;
      tokenStore.clear();
      return Promise.reject(refreshError);
    }
  }
);

const unwrap = (promise) => promise.then((response) => response.data).catch((error) => {
  const detail = error.response?.data?.detail;
  throw new Error(Array.isArray(detail) ? detail.map((item) => item.msg).join(", ") : detail || error.message || "Something went wrong");
});

export const auth = {
  saveSession: (data) => {
    tokenStore.setTokens(data);

    const user = normalizeUser(data.user);
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }

    return user;
  },
  getUser: getStoredUser,
  logout: () => tokenStore.clear(),
  isAuthenticated: () => Boolean(tokenStore.getAccess()),
  hasRole: (role) => getStoredUser()?.role === role,
};

export const api = {
  login: (payload) => unwrap(apiClient.post("/auth/login", payload)),
  register: (payload) => unwrap(apiClient.post("/auth/register", payload)),
  refresh: (refresh_token) => unwrap(apiClient.post("/auth/refresh", { refresh_token })),
  me: () => unwrap(apiClient.get("/auth/me")),
  getProducts: () => unwrap(apiClient.get("/products")),
  getProduct: (id) => unwrap(apiClient.get(`/products/${id}`)),
  createProduct: (payload) => unwrap(apiClient.post("/products", payload)),
  updateProduct: (id, payload) => unwrap(apiClient.put(`/products/${id}`, payload)),
  deleteProduct: (id) => unwrap(apiClient.delete(`/products/${id}`)),
  getCart: () => unwrap(apiClient.get("/cart")),
  addToCart: (payload) => unwrap(apiClient.post("/cart", payload)),
  removeCartItem: (id) => unwrap(apiClient.delete(`/cart/${id}`)),
  createOrder: (payload) => unwrap(apiClient.post("/orders", payload)),
  getOrders: () => unwrap(apiClient.get("/orders")),
  dummyPayment: (payload) => unwrap(apiClient.post("/payments/dummy", payload)),
};

export const categories = [
  { id: 1, name: "Mobiles", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80" },
  { id: 2, name: "Electronics", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=800&q=80" },
  { id: 3, name: "Fashion", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80" },
  { id: 4, name: "Home", image: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=800&q=80" },
  { id: 5, name: "Beauty", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80" },
  { id: 6, name: "Grocery", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80" },
];
