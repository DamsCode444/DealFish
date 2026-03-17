import { useCart, useUpdateCartItem, useRemoveFromCart } from "../hooks/useCart";
import { Link } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { createCheckoutSession } from "../lib/api";
import {
    Trash2Icon,
    PlusIcon,
    MinusIcon,
    ShoppingCartIcon,
    ArrowRightIcon,
    ShoppingBagIcon
} from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

function CartPage() {
    const { data: cartData, isLoading } = useCart();
    const { mutate: updateQuantity } = useUpdateCartItem();
    const { mutate: removeItem } = useRemoveFromCart();

    const checkoutMutation = useMutation({
        mutationFn: createCheckoutSession,
        onSuccess: (data) => {
            if (data.url) {
                window.location.href = data.url;
            }
        },
        onError: (error) => {
            console.error("Checkout error:", error);
            toast.error(error.response?.data?.message || "Failed to initiate checkout");
        }
    });

    const items = cartData?.data || [];
    const totalPrice = items.reduce((acc, item) => acc + (parseFloat(item.product.price) * item.quantity), 0);
    const cartCurrency = items.length > 0 ? (items[0].product.currency || "CNY") : "CNY";

    const CURRENCY_SYMBOLS = {
        CNY: "¥",
        JPY: "¥",
        USD: "$",
        EUR: "€",
    };

    const STRIPE_MIN_AMOUNTS = {
        USD: 50,
        CNY: 50,
        JPY: 50,
        EUR: 50,
        GBP: 30,
    };

    const handleCheckout = () => {
        if (items.length === 0) return;

        const currency = (items[0].product.currency || "CNY").toUpperCase();

        const hasMultipleCurrencies = items.some(item => (item.product.currency || "CNY").toUpperCase() !== currency);
        if (hasMultipleCurrencies) {
            toast.error(`Checkout failed: All items must be in the same currency (${currency})`);
            return;
        }

        const minAmount = STRIPE_MIN_AMOUNTS[currency] || 50;
        if (totalPrice < minAmount) {
            const displayMin = currency === "JPY" ? minAmount : minAmount / 100;
            toast.error(`Minimum order amount is ${displayMin} ${currency}`);
            return;
        }
        checkoutMutation.mutate();
    };

    if (isLoading) return <LoadingSpinner />;

    if (items.length === 0) {
        return (
            <div className="max-w-2xl mx-auto py-12 md:py-20 px-4 text-center space-y-6">
                <div className="bg-base-300 size-20 md:size-24 rounded-full flex items-center justify-center mx-auto">
                    <ShoppingCartIcon className="size-8 md:size-10 text-base-content/20" />
                </div>
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold">Your cart is empty</h2>
                    <p className="text-base-content/50 mt-2 text-sm md:text-base">
                        Looks like you haven't added anything to your cart yet.
                    </p>
                </div>
                <Link to="/" className="btn btn-primary gap-2">
                    Start Shopping <ArrowRightIcon className="size-4" />
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-6 md:py-8 space-y-6 md:space-y-8">
            <div className="flex items-center gap-2 md:gap-3">
                <div className="bg-primary/20 p-2 md:p-3 rounded-2xl">
                    <ShoppingBagIcon className="size-5 md:size-6 text-primary" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold">Shopping Cart</h1>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-3 md:space-y-4">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="card bg-base-300 border border-base-content/5 hover:border-base-content/10 transition-all"
                        >
                            <div className="card-body p-3 md:p-4 flex flex-col sm:flex-row gap-3 md:gap-4 items-start sm:items-center">
                                {/* Product Image */}
                                <div className="size-16 md:size-20 bg-base-200 rounded-xl overflow-hidden shrink-0">
                                    <img
                                        src={item.product.imageUrls?.[0] || ""}
                                        alt={item.product.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Product Details */}
                                <div className="flex-1 min-w-0 w-full sm:w-auto">
                                    <Link
                                        to={`/product/${item.product.id}`}
                                        className="font-bold text-base md:text-lg hover:text-primary transition-colors line-clamp-1"
                                    >
                                        {item.product.title}
                                    </Link>
                                    <p className="text-primary font-bold text-sm md:text-base">
                                        {CURRENCY_SYMBOLS[item.product.currency] || ""} {item.product.price}
                                    </p>
                                    <p className="text-xs text-base-content/50 truncate">
                                        By {item.product.user?.name}
                                    </p>
                                </div>

                                {/* Quantity & Remove */}
                                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 sm:gap-2">
                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-1 bg-base-200 rounded-full p-1">
                                        <button
                                            onClick={() => updateQuantity({ id: item.id, quantity: item.quantity - 1 })}
                                            className="btn btn-ghost btn-xs btn-circle"
                                        >
                                            <MinusIcon className="size-3" />
                                        </button>
                                        <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity({ id: item.id, quantity: item.quantity + 1 })}
                                            className="btn btn-ghost btn-xs btn-circle"
                                        >
                                            <PlusIcon className="size-3" />
                                        </button>
                                    </div>

                                    {/* Remove Button */}
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="btn btn-ghost btn-xs text-error hover:bg-error/10 gap-1"
                                    >
                                        <Trash2Icon className="size-3" /> Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
                    <div className="card bg-base-300">
                        <div className="card-body p-4 md:p-6 gap-4 md:gap-6">
                            <h2 className="card-title text-lg md:text-xl">Order Summary</h2>
                            <div className="space-y-2 text-sm md:text-base">
                                <div className="flex justify-between text-base-content/60">
                                    <span>Subtotal</span>
                                    <span>{CURRENCY_SYMBOLS[cartCurrency] || ""} {totalPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-base-content/60">
                                    <span>Shipping</span>
                                    <span className="text-success font-bold">FREE</span>
                                </div>
                                <div className="divider my-0"></div>
                                <div className="flex justify-between font-bold text-lg md:text-xl">
                                    <span>Total</span>
                                    <span className="text-primary">{CURRENCY_SYMBOLS[cartCurrency] || ""} {totalPrice.toLocaleString()}</span>
                                </div>
                            </div>
                            <button
                                onClick={handleCheckout}
                                disabled={checkoutMutation.isPending}
                                className="btn btn-primary w-full shadow-lg shadow-primary/20 text-sm md:text-base"
                            >
                                {checkoutMutation.isPending ? (
                                    <span className="loading loading-spinner loading-xs" />
                                ) : "Proceed to Checkout"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CartPage;