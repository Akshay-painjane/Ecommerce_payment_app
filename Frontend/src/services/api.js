import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

const redirectToLogin = () => {
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
};

export const tokenStore = {
  getAccess: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefresh: () => {
    const token = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!token || token === "undefined" || token === "null") {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      return null;
    }

    return token;
  },
  setTokens: ({ access_token, refresh_token }) => {
    if (access_token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, access_token);
      localStorage.removeItem("token");
    }
    if (refresh_token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
    }
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
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
  config.headers = config.headers || {};
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
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
      redirectToLogin();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshPromise = refreshPromise || axios.post(
        `${API_BASE_URL}/auth/refresh`,
        { refresh_token: refreshToken },
        { headers: { "Content-Type": "application/json" } }
      );
      const { data } = await refreshPromise;
      refreshPromise = null;
      tokenStore.setTokens({ access_token: data.access_token });
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      refreshPromise = null;
      tokenStore.clear();
      redirectToLogin();
      return Promise.reject(refreshError);
    }
  }
);

const formatApiDetail = (detail) => {
  if (!Array.isArray(detail)) {
    return detail;
  }

  return detail.map((item) => {
    const field = Array.isArray(item.loc) ? item.loc[item.loc.length - 1] : "";
    return field ? `${field}: ${item.msg}` : item.msg;
  }).join(", ");
};

const unwrap = (promise) => promise.then((response) => response.data).catch((error) => {
  if (error.response?.status === 401) {
    throw new Error("Please login again");
  }

  const detail = formatApiDetail(error.response?.data?.detail);
  throw new Error(detail || error.message || "Something went wrong");
});

const accessHeaders = () => {
  const token = tokenStore.getAccess();
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

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
  getProducts: () => unwrap(apiClient.get("/products/")),
  getProduct: (id) => unwrap(apiClient.get(`/products/${id}`)),
  getCategories: () => unwrap(apiClient.get("/categories/get-all")),
  getCategory: (id) => unwrap(apiClient.get(`/categories/get/${id}`)),
  createCategory: (payload) => unwrap(apiClient.post("/categories/create", payload, accessHeaders())),
  updateCategory: (id, payload) => unwrap(apiClient.put(`/categories/update/${id}`, payload, accessHeaders())),
  deleteCategory: (id) => unwrap(apiClient.delete(`/categories/delete/${id}`, accessHeaders())),
  createProduct: (payload) => {
    const formData = payload instanceof FormData ? payload : new FormData();

    if (!(payload instanceof FormData)) {
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
    }

    return unwrap(apiClient.post("/products/", formData));
  },
  updateProduct: (id, payload) => unwrap(apiClient.put(`/products/${id}`, payload, accessHeaders())),
  deleteProduct: (id) => unwrap(apiClient.delete(`/products/${id}`)),
  getCart: () => unwrap(apiClient.get("/cart/")),
  addToCart: (payload) => unwrap(apiClient.post("/cart/", {
    product_id: payload.product_id ?? payload.product?.id ?? payload.id,
    quantity: Number(payload.quantity || 1),
  })),
  removeCartItem: (id) => unwrap(apiClient.delete(`/cart/${id}`)),
  createOrder: (payload) => {
    const items = Array.isArray(payload?.items) ? payload.items : [];
    return unwrap(apiClient.post("/orders/", { items }));
  },
  getOrders: () => unwrap(apiClient.get("/orders/my-orders")),
  createPayment: (payload) => unwrap(apiClient.post("/payments/", payload)),
};

export const categories = [];

const getCategoryImageValue = (category) => (
  category?.image_url
  || category?.image
  || category?.file
  || category?.image_path
  || category?.category_image
  || ""
);

export const getCategoryImageUrl = (category) => {
  const image = getCategoryImageValue(category);

  if (typeof image !== "string" || !image.trim()) {
    return "";
  }

  const imageUrl = image.trim();

  if (/^(?:https?:|data:|blob:)/i.test(imageUrl)) {
    return imageUrl;
  }

  return `${API_BASE_URL}/${imageUrl.replace(/^\/+/, "")}`;
};

export const normalizeCategory = (category, index = 0) => {
  if (!category || typeof category !== "object") {
    return null;
  }

  const name = String(category.name || "").trim();

  if (!name) {
    return null;
  }

  return {
    ...category,
    id: category.id ?? name ?? index,
    name,
    image: getCategoryImageUrl(category),
  };
};

export const normalizeCategories = (items) => (
  Array.isArray(items)
    ? items.map((category, index) => normalizeCategory(category, index)).filter(Boolean)
    : []
);

export const getCategoriesWithFallback = async () => {
  const backendCategories = normalizeCategories(await api.getCategories());
  return backendCategories;
};
