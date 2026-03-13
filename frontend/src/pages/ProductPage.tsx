import { ArrowLeftIcon, EditIcon, Trash2Icon, CalendarIcon, UserIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import CommentsSection from "../components/CommentsSection";
import { useAuth } from "@clerk/clerk-react";
import { useProduct, useDeleteProduct } from "../hooks/useProducts";
import { useParams, Link, useNavigate } from "react-router";
import { useState } from "react";

function ProductPage() {
  const { id } = useParams();
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: product, isLoading, error } = useProduct(id);
  const deleteProduct = useDeleteProduct();

  const handleDelete = () => {
    if (confirm("Delete this product permanently?")) {
      deleteProduct.mutate(id, { onSuccess: () => navigate("/") });
    }
  };

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
        <div className="card bg-base-300">
          <figure className="p-4 relative">
            {product.imageUrls && product.imageUrls.length > 0 ? (
              <>
                <img
                  src={product.imageUrls[currentImageIndex]}
                  alt={`${product.title} - Image ${currentImageIndex + 1}`}
                  className="rounded-xl w-full h-80 object-cover"
                />
                {product.imageUrls.length > 1 && (
                  <div className="absolute flex justify-between transform -translate-y-1/2 left-6 right-6 top-1/2">
                    <button 
                      onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? product.imageUrls.length - 1 : prev - 1))}
                      className="btn btn-circle btn-sm bg-base-100/80 border-none hover:bg-base-100"
                    >
                      <ChevronLeftIcon className="size-4" />
                    </button>
                    <button 
                      onClick={() => setCurrentImageIndex((prev) => (prev === product.imageUrls.length - 1 ? 0 : prev + 1))}
                      className="btn btn-circle btn-sm bg-base-100/80 border-none hover:bg-base-100"
                    >
                      <ChevronRightIcon className="size-4" />
                    </button>
                  </div>
                )}
                
                {/* Thumbnails indicator */}
                {product.imageUrls.length > 1 && (
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
                    {product.imageUrls.map((_, i) => (
                      <div 
                        key={i} 
                        className={`size-2 rounded-full ${i === currentImageIndex ? 'bg-primary' : 'bg-base-content/30'}`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
                <div className="rounded-xl w-full h-80 bg-base-200 flex items-center justify-center text-base-content/50">
                  No images available
                </div>
            )}
          </figure>
        </div>

        <div className="card bg-base-300">
          <div className="card-body">
            <h1 className="card-title text-2xl">{product.title}</h1>
            <h1 className="text-2xl font-bold text-[#FFD700]"> ¥{product.price}</h1>

            <div className="flex flex-wrap gap-4 text-sm text-base-content/60 my-2">
              <div className="flex items-center gap-1">
                <CalendarIcon className="size-4" />
                {new Date(product.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <UserIcon className="size-4" />
                {product.user?.name}
              </div>
            </div>

            <div className="divider my-2"></div>

            <p className="text-base-content/80 leading-relaxed">{product.description}</p>

            {product.user && (
              <>
                <div className="divider my-2"></div>
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="w-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                      <img src={product.user.imageUrl} alt={product.user.name} />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold">{product.user.name}</p>
                    <p className="text-xs text-base-content/50">Creator</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="card bg-base-300">
        <div className="card-body">
          <CommentsSection productId={id} comments={product.comments} currentUserId={userId} />
        </div>
      </div>
    </div>
  );
}

export default ProductPage;