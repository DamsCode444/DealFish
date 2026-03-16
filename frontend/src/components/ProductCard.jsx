import { Link } from "react-router";
import { MessageCircleIcon } from "lucide-react";
import { SignInButton, useAuth } from "@clerk/clerk-react";

const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

const ProductCard = ({ product }) => {
  const isNew = new Date(product.createdAt) > oneWeekAgo;
  const { isSignedIn } = useAuth();

  const CURRENCY_SYMBOLS = {
    CNY: "¥",
    JPY: "¥",
    USD: "$",
    EUR: "€",
  };

  const CardContent = (
    <div className="card bg-base-300 hover:bg-base-200 transition-all hover:-translate-y-1 h-full shadow-lg">
      <figure className="px-4 pt-4">
        <img
          src={product.imageUrls?.[0] || ""}
          alt={product.title}
          className="rounded-xl h-40 w-full object-cover"
        />
      </figure>
      <div className="card-body p-4">
        <div className="flex justify-between items-start">
          <h2 className="card-title text-base line-clamp-1">
            {product.title}
          </h2>
          {isNew && <span className="badge badge-secondary badge-sm shrink-0">NEW</span>}
        </div>
        <span className="text-xl font-bold text-primary"> 
          {CURRENCY_SYMBOLS[product.currency] || ""} {product.price}
          {!CURRENCY_SYMBOLS[product.currency] && <span className="text-xs ml-1">{product.currency}</span>}
        </span>
        <p className="text-sm text-base-content/70 line-clamp-2 min-h-[2.5rem]">{product.description}</p>

        <div className="divider my-1"></div>

        <div className="flex items-center justify-between">
          {product.user && (
            <div className="flex items-center gap-2">
              <div className="avatar">
                <div className="w-6 rounded-full ring-1 ring-primary">
                  <img src={product.user.imageUrl} alt={product.user.name} />
                </div>
              </div>
              <span className="text-xs text-base-content/60">{product.user.name}</span>
            </div>
          )}
          {product.comments && (
            <div className="flex items-center gap-1 text-base-content/50">
              <MessageCircleIcon className="size-3" />
              <span className="text-xs">{product.comments.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isSignedIn) {
    return (
      <Link to={`/product/${product.id}`} className="block h-full">
        {CardContent}
      </Link>
    );
  }

  return (
    <SignInButton mode="modal">
      <div className="cursor-pointer h-full">
        {CardContent}
      </div>
    </SignInButton>
  );
};

export default ProductCard;