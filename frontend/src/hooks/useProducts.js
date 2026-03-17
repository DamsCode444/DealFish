import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getMyProducts,
  getProductById,
  updateProduct,
  uploadImages,
} from "../lib/api";

export const useProducts = (params = {}) => {
  const { search = "", category = "All" } = params;

  return useInfiniteQuery({
    queryKey: ["products", search, category],
    queryFn: ({ pageParam = 1 }) => getAllProducts({ search, category, page: pageParam, limit: 10 }),
    getNextPageParam: (lastPage) => {
      const { page, limit } = lastPage.pagination;
      // If the number of items returned is equal to the limit, there might be more
      return lastPage.data.length === limit ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

export const useCreateProduct = () => {
  return useMutation({ mutationFn: createProduct });
};

export const useUploadImages = () => {
  return useMutation({ mutationFn: uploadImages });
};

export const useProduct = (id) => {
  const result = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
    enabled: !!id,
  });

  return {
    ...result,
    data: result.data?.data || null,
  };
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProducts"] });
    },
  });
};

export const useMyProducts = () => {
  const result = useQuery({ queryKey: ["myProducts"], queryFn: getMyProducts });

  return {
    ...result,
    data: result.data?.data || [],
  };
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProduct,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["myProducts"] });
    },
  });
};