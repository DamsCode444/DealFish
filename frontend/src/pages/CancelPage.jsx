import { Link } from "react-router";
import { XCircleIcon, ShoppingCartIcon, ArrowLeftIcon } from "lucide-react";
import { motion } from "framer-motion";

function CancelPage() {
    return (
        <div className="max-w-2xl mx-auto py-20 px-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card bg-base-300 shadow-2xl overflow-hidden"
            >
                <div className="h-2 bg-error w-full" />
                <div className="card-body items-center text-center gap-6 py-12">
                    <div className="bg-error/10 p-5 rounded-full">
                        <XCircleIcon className="size-16 text-error" />
                    </div>
                    
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight">Payment Cancelled</h1>
                        <p className="text-base-content/60 text-lg">
                            No worries! Your order has not been placed, and no charges were made.
                        </p>
                    </div>

                    <div className="divider w-full opacity-50"></div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                        <Link to="/cart" className="btn btn-error btn-lg gap-2 shadow-lg shadow-error/20">
                            Back to Cart <ShoppingCartIcon className="size-5" />
                        </Link>
                        <Link to="/" className="btn btn-ghost btn-lg gap-2 text-base-content/60">
                            <ArrowLeftIcon className="size-5" /> Back to Home
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default CancelPage;
