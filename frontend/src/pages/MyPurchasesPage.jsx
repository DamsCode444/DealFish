import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrders, confirmReceipt } from '../lib/api';
import { Package, Truck, CheckCircle, PackageCheck, ExternalLink, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const MyPurchasesPage = () => {
    const queryClient = useQueryClient();
    const { data: response, isLoading } = useQuery({
        queryKey: ['orders'],
        queryFn: getOrders
    });

    const { mutate: confirm, isPending: isConfirming } = useMutation({
        mutationFn: confirmReceipt,
        onSuccess: () => {
            queryClient.invalidateQueries(['orders']);
        }
    });

    const orders = response?.data?.data || [];

    const getStatusIcon = (status) => {
        switch (status) {
            case 'paid': return <Package className="w-5 h-5 text-blue-500" />;
            case 'shipped': return <Truck className="w-5 h-5 text-yellow-500" />;
            case 'delivered': return <PackageCheck className="w-5 h-5 text-green-500" />;
            case 'received': return <CheckCircle className="w-5 h-5 text-green-600" />;
            default: return <Package className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'paid': return 'Paid';
            case 'processing': return 'Processing';
            case 'packing': return 'Packing';
            case 'shipped': return 'Shipped';
            case 'delivering': return 'Out for Delivery';
            case 'delivered': return 'Delivered';
            case 'received': return 'Completed';
            default: return status;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid': return 'badge-info';
            case 'processing': return 'badge-warning';
            case 'packing': return 'badge-warning';
            case 'shipped': return 'badge-secondary';
            case 'delivering': return 'badge-secondary';
            case 'delivered': return 'badge-success';
            case 'received': return 'badge-success';
            default: return 'badge-ghost';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                <Package className="w-8 h-8 text-blue-600" />
                My Purchases
            </h1>

            {orders.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-dashed border-gray-200 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">You haven't made any purchases yet.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 bg-base-200/50 border-b border-base-content/5 flex flex-wrap justify-between items-center gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">Order Date</p>
                                    <p className="font-medium">
                                        {format(new Date(order.createdAt), 'PPP')}
                                    </p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">Total Amount</p>
                                    <p className="text-xl font-bold text-primary">
                                        ¥{order.totalAmount.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="space-y-6">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="group">
                                            <div className="flex flex-col sm:flex-row gap-6">
                                                <div className="w-24 h-24 rounded-2xl bg-base-200 overflow-hidden flex-shrink-0 shadow-inner">
                                                    {item.product.imageUrls?.[0] ? (
                                                        <img 
                                                            src={item.product.imageUrls[0]} 
                                                            alt={item.product.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <Package className="w-10 h-10 m-7 text-base-content/20" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0 space-y-2">
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <h3 className="font-bold text-lg truncate">
                                                            {item.product.title}
                                                        </h3>
                                                        <div className={`badge ${getStatusColor(item.status)} font-medium uppercase text-[10px] tracking-widest`}>
                                                            {getStatusText(item.status)}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm opacity-60">
                                                        Quantity: {item.quantity} × ¥{item.priceAtPurchase.toLocaleString()}
                                                    </p>
                                                    
                                                    {/* Action Button for Item */}
                                                    {item.status === 'delivered' && (
                                                        <button 
                                                            onClick={() => confirm(item.id)}
                                                            disabled={isConfirming}
                                                            className="btn btn-success btn-sm gap-2 mt-2 w-full sm:w-auto"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                            Confirm Received
                                                        </button>
                                                    )}

                                                    {item.status === 'received' && (
                                                        <div className="flex items-center gap-2 text-success text-xs font-semibold mt-2">
                                                            <CheckCircle className="w-4 h-4" />
                                                            Order Completed
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {order.items.indexOf(item) !== order.items.length - 1 && (
                                                <div className="divider opacity-5 my-4"></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyPurchasesPage;
