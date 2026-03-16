import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../lib/api";

export const useCart = () => {
    return useQuery({
        queryKey: ["cart"],
        queryFn: api.getCart,
    });
};

export const useAddToCart = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.addToCart,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        },
    });
};

export const useUpdateCartItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.updateCartItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        },
    });
};

export const useRemoveFromCart = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.removeFromCart,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        },
    });
};
