import api from "./axios";

// USERS API
export const syncUser = async (userData) => {
  const { data } = await api.post("/users/sync", userData);
  return data;
};

// Products API
export const getAllProducts = async () => {
  const { data } = await api.get("/product");
  return data;
};

export const getProductById = async (id) => {
  const { data } = await api.get(`/product/${id}`);
  return data;
};

export const getMyProducts = async () => {
  const { data } = await api.get("/product/my");
  return data;
};

export const createProduct = async (productData) => {
  const { data } = await api.post("/product", productData);
  return data;
};

export const updateProduct = async ({ id, ...productData }) => {
  const { data } = await api.put(`/product/${id}`, productData);
  return data;
};

export const deleteProduct = async (id) => {
  const { data } = await api.delete(`/product/${id}`);
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