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

const CART_STORAGE_KEY = "cart_items";

const normalizeCartProduct = (product) => {
  if (!product || typeof product !== "object") {
    return null;
  }

  const id = product.id ?? product.product_id;

  return {
    ...product,
    id,
    name: product.name || product.title || "Product",
    title: product.title || product.name || "Product",
    description: product.description || "",
    price: product.price === undefined || product.price === null || product.price === "" ? null : Number(product.price),
    image: product.image || product.img || product.image_url || "",
    img: product.img || product.image || product.image_url || "",
    image_url: product.image_url || product.image || product.img || "",
    category: product.category || product.category_name || product.category_id || "",
    rating: product.rating ?? 4.5,
  };
};

const readLocalCart = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    localStorage.removeItem(CART_STORAGE_KEY);
    return [];
  }
};

const writeLocalCart = (items) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
};

export const cartStore = {
  getItems: readLocalCart,
  saveProduct: (product, quantity = 1) => {
    const normalizedProduct = normalizeCartProduct(product);

    if (!normalizedProduct?.id) {
      return readLocalCart();
    }

    const productId = Number(normalizedProduct.id);
    const items = readLocalCart();
    const existingItem = items.find((item) => Number(item.product_id ?? item.product?.id ?? item.id) === productId);

    if (existingItem) {
      existingItem.quantity = Number(existingItem.quantity || 0) + Number(quantity || 1);
      existingItem.product = {
        ...normalizeCartProduct(existingItem.product),
        ...normalizedProduct,
      };
      existingItem.product_id = productId;
    } else {
      items.push({
        id: `local-${productId}`,
        product_id: productId,
        quantity: Number(quantity || 1),
        product: normalizedProduct,
      });
    }

    writeLocalCart(items);
    return items;
  },
  updateQuantity: (itemId, quantity) => {
    const items = readLocalCart().map((item) => (
      String(item.id) === String(itemId)
        ? { ...item, quantity: Math.max(1, Number(quantity || 1)) }
        : item
    ));
    writeLocalCart(items);
    return items;
  },
  removeItem: (itemId, productId) => {
    const items = readLocalCart().filter((item) => {
      const itemProductId = item.product_id ?? item.product?.id ?? item.id;
      return String(item.id) !== String(itemId) && String(itemProductId) !== String(productId);
    });
    writeLocalCart(items);
    return items;
  },
  normalizeProduct: normalizeCartProduct,
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
  getCategories: () => unwrap(apiClient.get("/categories/")),
  createCategory: (payload) => unwrap(apiClient.post("/categories/", payload, accessHeaders())),
  updateCategory: (id, payload) => unwrap(apiClient.put(`/categories/${id}`, payload, accessHeaders())),
  deleteCategory: (id) => unwrap(apiClient.delete(`/categories/${id}`, accessHeaders())),
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
  updateProduct: (id, payload) => unwrap(apiClient.put(`/products/${id}`, payload)),
  deleteProduct: (id) => unwrap(apiClient.delete(`/products/${id}`)),
  getCart: () => unwrap(apiClient.get("/cart")),
  addToCart: async (payload) => {
    const quantity = Number(payload.quantity || 1);
    cartStore.saveProduct(payload.product || payload, quantity);

    try {
      return await unwrap(apiClient.post("/cart", {
        product_id: payload.product_id ?? payload.product?.id ?? payload.id,
        quantity,
      }));
    } catch (error) {
      return {
        id: `local-${payload.product_id ?? payload.product?.id ?? payload.id}`,
        product_id: payload.product_id ?? payload.product?.id ?? payload.id,
        quantity,
        product: cartStore.normalizeProduct(payload.product || payload),
        localOnly: true,
        error,
      };
    }
  },
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

  const fallback = categories.find((item) => item.name.toLowerCase() === String(category.name || "").toLowerCase())
    || categories[index % categories.length];
  const name = String(category.name || fallback?.name || "").trim();

  if (!name) {
    return null;
  }

  return {
    ...category,
    id: category.id ?? fallback?.id ?? name,
    name,
    image: getCategoryImageUrl(category) || fallback?.image || "",
  };
};

export const normalizeCategories = (items) => (
  Array.isArray(items)
    ? items.map((category, index) => normalizeCategory(category, index)).filter(Boolean)
    : []
);

export const getCategoriesWithFallback = async () => {
  const backendCategories = normalizeCategories(await api.getCategories());
  return backendCategories.length ? backendCategories : categories;
};
