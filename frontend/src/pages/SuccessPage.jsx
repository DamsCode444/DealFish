import React, { useEffect } from "react";
import { Link } from "react-router";
import { CheckCircleIcon, ShoppingBagIcon, ArrowRightIcon, Loader2Icon } from "lucide-react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrderFromCart } from "../lib/api";

function SuccessPage() {
    const queryClient = useQueryClient();
    const { mutate: createOrder, isPending, isSuccess, isError } = useMutation({
        mutationFn: createOrderFromCart,
        onSuccess: () => {
            queryClient.invalidateQueries(["cart"]);
            queryClient.invalidateQueries(["orders"]);
        }
    });

    useEffect(() => {
        // Create order from cart only once on mount
        createOrder();
    }, [createOrder]);

    return (
        <div className="max-w-2xl mx-auto py-20 px-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card bg-base-300 shadow-2xl overflow-hidden"
            >
                <div className={`h-2 ${isError ? "bg-error" : "bg-success"} w-full`} />
                <div className="card-body items-center text-center gap-6 py-12">
                    <div className={`${isError ? "bg-error/10" : "bg-success/10"} p-5 rounded-full`}>
                        {isPending ? (
                            <Loader2Icon className="size-16 text-primary animate-spin" />
                        ) : isError ? (
                            <CheckCircleIcon className="size-16 text-error opacity-50" />
                        ) : (
                            <CheckCircleIcon className="size-16 text-success" />
                        )}
                    </div>
                    
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight">
                            {isPending ? "Processing Order..." : isError ? "Finalization Error" : "Payment Successful!"}
                        </h1>
                        <p className="text-base-content/60 text-lg px-8">
                            {isPending 
                                ? "We're converting your cart into an order. Please don't close this page." 
                                : isError 
                                    ? "Payment went through, but we failed to clear your cart or record the purchase. Please contact support."
                                    : "Thank you for your purchase. Your order has been placed successfully."
                            }
                        </p>
                    </div>

                    <div className="divider w-full opacity-50"></div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                        <Link to="/" className="btn btn-primary btn-lg gap-2 shadow-lg shadow-primary/20">
                            Continue Shopping <ShoppingBagIcon className="size-5" />
                        </Link>
                        <Link to="/purchases" className="btn btn-ghost btn-lg gap-2">
                             View My Purchases <ArrowRightIcon className="size-5" />
                        </Link>
                    </div>
                </div>
            </motion.div>

            {!isError && (
                <p className="text-center mt-8 text-sm text-base-content/40 font-medium uppercase tracking-widest leading-loose">
                    A confirmation email has been sent to your registered address.
                </p>
            )}
        </div>
    );
}

export default SuccessPage;
