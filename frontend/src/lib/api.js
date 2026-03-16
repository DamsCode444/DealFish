import api from "./axios";

// USERS API
export const syncUser = async (userData) => {
  const { data } = await api.post("/users/sync", userData);
  return data;
};

// Products API
export const getAllProducts = async (search = "") => {
  const { data } = await api.get(`/products${search ? `?search=${search}` : ""}`);
  return data;
};

export const getProductById = async (id) => {
  const { data } = await api.get(`/products/${id}`);
  return data;
};

export const getMyProducts = async () => {
  const { data } = await api.get("/products/my");
  return data;
};

export const createProduct = async (productData) => {
  const { data } = await api.post("/products", productData);
  return data;
};

export const uploadImages = async (formData) => {
  const { data } = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateProduct = async ({ id, ...productData }) => {
  const { data } = await api.put(`/products/${id}`, productData);
  return data;
};

export const deleteProduct = async (id) => {
  const { data } = await api.delete(`/products/${id}`);
  return data;
};

// Comments API
export const createComment = async ({ productId, content }) => {
  const { data } = await api.post(`/comments/${productId}`, { content });
  return data;
};

export const deleteComment = async ({ commentId }) => {
  const { data } = await api.delete(`/comments/${commentId}`);
  return data;
};

// Cart API
export const getCart = async () => {
  const { data } = await api.get("/cart");
  return data;
};

export const addToCart = async ({ productId, quantity = 1 }) => {
  const { data } = await api.post("/cart", { productId, quantity });
  return data;
};

export const updateCartItem = async ({ id, quantity }) => {
  const { data } = await api.patch(`/cart/${id}`, { quantity });
  return data;
};

export const removeFromCart = async (id) => {
  const { data } = await api.delete(`/cart/${id}`);
  return data;
};

// Payment API
export const createCheckoutSession = async () => {
    const { data } = await api.post("/payment/create-checkout-session");
    return data;
};

// Order API
export const getOrders = () => api.get("/orders");
export const getSellerOrders = () => api.get("/orders/seller");
export const createOrderFromCart = () => api.post("/orders/create-from-cart");
export const updateOrderItemStatus = ({ id, status }) => api.patch(`/orders/item/${id}/status`, { status });
export const confirmReceipt = (id) => api.patch(`/orders/item/${id}/confirm`);