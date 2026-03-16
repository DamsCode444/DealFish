import { 
  ArrowLeftIcon, 
  EditIcon, 
  Trash2Icon, 
  CalendarIcon, 
  UserIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  Maximize2Icon,
  XIcon,
  ZoomInIcon,
  ZoomOutIcon,
  RotateCcwIcon,
  ShoppingCartIcon
} from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import CommentsSection from "../components/CommentsSection";
import { useAuth, SignInButton } from "@clerk/clerk-react";
import { useProduct, useDeleteProduct } from "../hooks/useProducts";
import { useCart, useAddToCart } from "../hooks/useCart";
import { useParams, Link, useNavigate } from "react-router";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function ProductPage() {
  const { id } = useParams();
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const { data: product, isLoading, error } = useProduct(id);
  const deleteProduct = useDeleteProduct();
  const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart();
  const { data: cartData } = useCart();

  const isInCart = cartData?.data?.some((item: any) => item.productId === product?.id);

  const handleDelete = () => {
    if (confirm("Delete this product permanently?")) {
      deleteProduct.mutate(id, { onSuccess: () => navigate("/") });
    }
  };

  const resetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 0.5, 1);
    setZoom(newZoom);
    if (newZoom === 1) resetZoom();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }));
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
            setIsFullScreen(false);
            resetZoom();
        }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (isLoading) return <LoadingSpinner />;

  if (error || !product) {
    return (
      <div className="card bg-base-300 max-w-md mx-auto">
        <div className="card-body items-center text-center">
          <h2 className="card-title text-error">Product not found</h2>
          <Link to="/" className="btn btn-primary btn-sm">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = userId === product.userId;

  const CURRENCY_SYMBOLS: Record<string, string> = {
    CNY: "¥",
    JPY: "¥",
    USD: "$",
    EUR: "€",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/" className="btn btn-ghost btn-sm gap-1">
          <ArrowLeftIcon className="size-4" /> Back
        </Link>
        {isOwner && (
          <div className="flex gap-2">
            <Link to={`/edit/${product.id}`} className="btn btn-ghost btn-sm gap-1">
              <EditIcon className="size-4" /> Edit
            </Link>
            <button
              onClick={handleDelete}
              className="btn btn-error btn-sm gap-1"
              disabled={deleteProduct.isPending}
            >
              {deleteProduct.isPending ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <Trash2Icon className="size-4" />
              )}
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Image Gallery */}
        <div className="card bg-base-300 overflow-hidden group">
          <figure className="p-4 relative bg-base-200 min-h-[400px] flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              {product.imageUrls && product.imageUrls.length > 0 ? (
                <motion.div 
                    key={currentImageIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="w-full h-full cursor-zoom-in relative"
                    onClick={() => setIsFullScreen(true)}
                >
                  <img
                    src={product.imageUrls[currentImageIndex]}
                    alt={`${product.title} - Image ${currentImageIndex + 1}`}
                    className="rounded-xl w-full h-[360px] object-contain shadow-inner"
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-base-300/80 p-2 rounded-full backdrop-blur-sm">
                        <Maximize2Icon className="size-4" />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="rounded-xl w-full h-80 bg-base-200 flex items-center justify-center text-base-content/50">
                  No images available
                </div>
              )}
            </AnimatePresence>

            {product.imageUrls && product.imageUrls.length > 1 && (
              <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex((prev) => (prev === 0 ? product.imageUrls.length - 1 : prev - 1));
                  }}
                  className="btn btn-circle btn-sm bg-base-100/80 border-none hover:bg-base-100 pointer-events-auto shadow-md"
                >
                  <ChevronLeftIcon className="size-4" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex((prev) => (prev === product.imageUrls.length - 1 ? 0 : prev + 1));
                  }}
                  className="btn btn-circle btn-sm bg-base-100/80 border-none hover:bg-base-100 pointer-events-auto shadow-md"
                >
                  <ChevronRightIcon className="size-4" />
                </button>
              </div>
            )}
            
            {/* Thumbnails indicator */}
            {product.imageUrls && product.imageUrls.length > 1 && (
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
                {product.imageUrls.map((_, i) => (
                    <button 
                    key={i} 
                    onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(i);
                    }}
                    className={`size-2 rounded-full transition-all ${i === currentImageIndex ? 'bg-primary w-4' : 'bg-base-content/30'}`}
                    />
                ))}
                </div>
            )}
          </figure>
          
          {/* Small Thumbnails Row */}
          {product.imageUrls && product.imageUrls.length > 1 && (
              <div className="flex gap-2 p-4 pt-0 overflow-x-auto scrollbar-hide">
                  {product.imageUrls.map((url, i) => (
                      <button 
                        key={i}
                        onClick={() => setCurrentImageIndex(i)}
                        className={`size-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${i === currentImageIndex ? 'border-primary' : 'border-transparent opacity-60'}`}
                      >
                          <img src={url} className="w-full h-full object-cover" />
                      </button>
                  ))}
              </div>
          )}
        </div>

        <div className="card bg-base-300">
          <div className="card-body">
            <div className="flex justify-between items-start gap-2">
                <h1 className="card-title text-3xl font-bold leading-tight">{product.title}</h1>
                <div className="badge badge-primary badge-lg p-4 font-bold text-lg whitespace-nowrap">
                   {CURRENCY_SYMBOLS[product.currency] || ""} {product.price}
                   {!CURRENCY_SYMBOLS[product.currency] && <span className="text-xs ml-1">{product.currency}</span>}
                </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-base-content/60 my-4">
              <div className="flex items-center gap-1.5 bg-base-200 px-3 py-1.5 rounded-full">
                <CalendarIcon className="size-4 text-primary" />
                {new Date(product.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1.5 bg-base-200 px-3 py-1.5 rounded-full">
                <UserIcon className="size-4 text-primary" />
                {product.user?.name}
              </div>
            </div>

            <div className="divider my-2"></div>

            <div className="prose prose-sm max-w-none text-base-content/80">
                <p className="whitespace-pre-wrap leading-relaxed text-lg">{product.description}</p>
            </div>

            {!isOwner && (
              <div className="mt-8">
                {!userId ? (
                  <SignInButton mode="modal">
                    <button className="btn btn-primary w-full gap-2">
                       <ShoppingCartIcon className="size-5" /> Add to Cart
                    </button>
                  </SignInButton>
                ) : (
                  <button 
                    onClick={() => addToCart({ productId: product.id })}
                    disabled={isAddingToCart || isInCart}
                    className={`btn btn-primary w-full gap-2 ${isInCart ? 'btn-outline' : ''}`}
                  >
                    {isAddingToCart ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : (
                      <ShoppingCartIcon className="size-5" />
                    )}
                    {isInCart ? "Already in Cart" : "Add to Cart"}
                  </button>
                )}
                {isInCart && (
                   <Link to="/cart" className="btn btn-ghost w-full btn-sm mt-2 text-primary">
                      View in Cart
                   </Link>
                )}
              </div>
            )}

            {product.user && (
              <>
                <div className="divider my-2"></div>
                <div className="flex items-center gap-4 bg-base-200 p-4 rounded-2xl border border-base-content/5">
                  <div className="avatar">
                    <div className="w-14 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 shadow-lg">
                      <img src={product.user.imageUrl} alt={product.user.name} />
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-lg">{product.user.name}</p>
                    <p className="text-xs text-base-content/50 uppercase tracking-widest font-bold">Trusted Creator</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="card bg-base-300 shadow-xl">
        <div className="card-body">
          <div className="flex items-center gap-2 mb-4">
            <div className="size-2 rounded-full bg-primary animate-pulse" />
            <h2 className="text-xl font-bold">Discussion</h2>
          </div>
          <CommentsSection productId={id} comments={product.comments} currentUserId={userId} />
        </div>
      </div>

      {/* Full Screen Modal */}
      <AnimatePresence>
        {isFullScreen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center select-none"
          >
            {/* Toolbar */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-[110]">
              <div className="flex gap-2">
                <button className="btn btn-circle btn-ghost text-white" onClick={() => setIsFullScreen(false)}>
                    <ArrowLeftIcon className="size-6" />
                </button>
                <div className="px-4 py-2 bg-white/10 rounded-full backdrop-blur-md text-white text-sm">
                    {currentImageIndex + 1} / {product.imageUrls?.length}
                </div>
              </div>
              <div className="flex gap-2 bg-black/40 p-1 rounded-full backdrop-blur-md border border-white/10">
                <button onClick={handleZoomOut} className="btn btn-ghost btn-sm btn-circle text-white">
                    <ZoomOutIcon className="size-5" />
                </button>
                <button onClick={resetZoom} className="btn btn-ghost btn-sm btn-circle text-white">
                    <RotateCcwIcon className="size-5" />
                </button>
                <button onClick={handleZoomIn} className="btn btn-ghost btn-sm btn-circle text-white">
                    <ZoomInIcon className="size-5" />
                </button>
                <div className="divider divider-horizontal mx-0 w-px bg-white/10" />
                <button onClick={() => setIsFullScreen(false)} className="btn btn-ghost btn-sm btn-circle text-white hover:bg-error">
                    <XIcon className="size-5" />
                </button>
              </div>
            </div>

            {/* Navigation */}
            {product.imageUrls && product.imageUrls.length > 1 && zoom === 1 && (
                <>
                <button 
                  onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? product.imageUrls.length - 1 : prev - 1))}
                  className="absolute left-10 btn btn-circle btn-lg btn-ghost text-white hover:bg-white/10 z-[110]"
                >
                  <ChevronLeftIcon className="size-8" />
                </button>
                <button 
                  onClick={() => setCurrentImageIndex((prev) => (prev === product.imageUrls.length - 1 ? 0 : prev + 1))}
                  className="absolute right-10 btn btn-circle btn-lg btn-ghost text-white hover:bg-white/10 z-[110]"
                >
                  <ChevronRightIcon className="size-8" />
                </button>
                </>
            )}

            {/* Image Container */}
            <div 
                className="w-full h-full flex items-center justify-center p-4 overflow-hidden"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <motion.img
                    ref={imageRef}
                    key={currentImageIndex}
                    src={product.imageUrls?.[currentImageIndex]}
                    drag={zoom > 1}
                    dragConstraints={{ left: -1000, right: 1000, top: -1000, bottom: 1000 }} // Custom dragging
                    animate={{ 
                        scale: zoom,
                        x: position.x,
                        y: position.y
                    }}
                    transition={{ type: "spring", damping: 30, stiffness: 200 }}
                    className={`max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl ${zoom > 1 ? 'cursor-grabbing' : 'cursor-grab'}`}
                />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProductPage;
;