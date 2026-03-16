import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSellerOrders, updateOrderItemStatus } from '../lib/api';
import { Package, Truck, CheckCircle, PackageCheck, Loader2, User, Mail, Calendar, Box } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

const SellerDashboardPage = () => {
    const queryClient = useQueryClient();
    const { data: response, isLoading } = useQuery({
        queryKey: ['seller-orders'],
        queryFn: getSellerOrders
    });

    const { mutate: updateStatus, isPending: isUpdating } = useMutation({
        mutationFn: updateOrderItemStatus,
        onSuccess: () => {
            queryClient.invalidateQueries(['seller-orders']);
            toast.success('Status updated successfully');
        },
        onError: () => {
            toast.error('Failed to update status');
        }
    });

    const sellerOrders = response?.data?.data || [];

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
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
                        <Box className="w-8 h-8 text-primary" />
                        Seller Dashboard
                    </h1>
                    <p className="text-base-content/60 mt-2">Manage your product orders and track shipments.</p>
                </div>
                <div className="stats shadow bg-base-300">
                    <div className="stat">
                        <div className="stat-title text-sm">Total Sales</div>
                        <div className="stat-value text-2xl text-primary">{sellerOrders.length}</div>
                        <div className="stat-desc text-xs mt-1">Orders for your products</div>
                    </div>
                </div>
            </div>

            {sellerOrders.length === 0 ? (
                <div className="bg-base-300 rounded-3xl p-16 text-center border border-dashed border-base-content/10">
                    <Box className="w-16 h-16 mx-auto mb-4 text-base-content/20" />
                    <h3 className="text-xl font-bold opacity-50">No orders yet</h3>
                    <p className="text-base-content/40 mt-2">When someone buys your products, they will appear here.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {sellerOrders.map((item) => (
                        <div key={item.id} className="card bg-base-300 shadow-sm border border-base-content/5 overflow-hidden">
                            <div className="card-body p-0">
                                <div className="flex flex-col lg:flex-row">
                                    {/* Product & Order Info */}
                                    <div className="flex-1 p-6 flex flex-col md:flex-row gap-6">
                                        <div className="w-24 h-24 rounded-2xl bg-base-200 overflow-hidden flex-shrink-0 shadow-inner">
                                            {item.product.imageUrls?.[0] ? (
                                                <img 
                                                    src={item.product.imageUrls[0]} 
                                                    alt={item.product.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Package className="w-10 h-10 m-7 text-base-content/20" />
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-bold text-lg">{item.product.title}</h3>
                                                <div className={`badge ${getStatusColor(item.status)} font-medium uppercase text-[10px] tracking-widest`}>
                                                    {item.status}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm opacity-70">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    Ordered: {format(new Date(item.order.createdAt), 'PPP')}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Box className="w-4 h-4" />
                                                    Quantity: {item.quantity}
                                                </div>
                                                <div className="flex items-center gap-2 font-bold text-primary">
                                                    <span className="opacity-70 font-normal">Revenue:</span>
                                                    ¥{(item.priceAtPurchase * item.quantity).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Customer Info */}
                                    <div className="lg:w-72 p-6 bg-base-200/50 border-t lg:border-t-0 lg:border-l border-base-content/5 space-y-4">
                                        <h4 className="text-xs font-bold uppercase tracking-widest opacity-40">Customer Details</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <img src={item.order.user.imageUrl} className="w-8 h-8 rounded-full border border-primary/20" alt="" />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold truncate">{item.order.user.name}</p>
                                                    <p className="text-[10px] opacity-60 truncate">{item.order.user.email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="divider opacity-10 my-0"></div>

                                        <div className="space-y-3">
                                            <select 
                                                className="select select-sm select-bordered w-full bg-base-300"
                                                value={item.status}
                                                disabled={isUpdating || item.status === 'received'}
                                                onChange={(e) => updateStatus({ id: item.id, status: e.target.value })}
                                            >
                                                <option value="paid">Paid</option>
                                                <option value="processing">Processing</option>
                                                <option value="packing">Packing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivering">Delivering</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="received" disabled>Received by Customer</option>
                                            </select>
                                            <p className="text-[10px] opacity-40 text-center italic">
                                                Updates reflect instantly on customer's page.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SellerDashboardPage;
