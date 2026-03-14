import { useProducts } from "../hooks/useProducts";
import { PackageIcon, SparklesIcon, ShoppingBagIcon, SearchIcon, XIcon } from "lucide-react";
import { Link } from "react-router";
import HomePageSkelaton from "../components/HomePageSkelaton";
import ProductGridSkeleton from "../components/ProductGridSkeleton";
import ProductCard from "../components/ProductCard";
import { SignInButton, SignOutButton, useAuth } from "@clerk/clerk-react";
import { useState, useEffect } from "react";

function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { data: products, isLoading, isError, error, isFetching } = useProducts(debouncedSearch);
  const { isSignedIn } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle errors specifically
  if (isError) {
    console.error("HomePage Error:", error);
    return (
      <div role="alert" className="alert alert-error flex-col items-start gap-2">
        <div className="flex items-center gap-2">
            <span>Something went wrong fetching products.</span>
            <button 
                className="btn btn-xs btn-outline"
                onClick={() => {
                    const fullUrl = error.config?.baseURL 
                        ? (error.config.baseURL.replace(/\/$/, '') + '/' + error.config.url.replace(/^\//, ''))
                        : error.config?.url;
                    alert(`Error: ${error.message}\nStatus: ${error.response?.status}\nURL: ${fullUrl}`);
                }}
            >
                Show Details
            </button>
        </div>
        <span className="text-xs opacity-70">Please check your connection and refresh.</span>
      </div>
    );
  }

  // Defensive check for products array
  if (!Array.isArray(products)) {
    console.error("Products is not an array:", products);
    return (
      <div role="alert" className="alert alert-warning">
        <span>Unable to load product list. Please try again later.</span>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-base-300 mb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20" />
        <div className="relative px-8 py-12 sm:px-16 sm:py-20 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <SparklesIcon className="size-4" />
            <span>Discover Unique Products</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold mb-6 tracking-tight">
            The Marketplace for <br />
            <span className="text-primary">Creative Products</span>
          </h1>
          <p className="text-lg text-base-content/70 max-w-2xl mb-10">
            A curated space to buy and sell premium products. Join our community of creators and enthusiasts.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {isSignedIn ? (
                <Link to="/create" className="btn btn-primary btn-lg gap-2">
                    <ShoppingBagIcon className="size-5" />
                    Start Selling
                </Link>
            ) : (
                <SignInButton mode="modal">
                    <button className="btn btn-primary btn-lg gap-2">
                        <ShoppingBagIcon className="size-5" />
                        Start Selling
                    </button>
                </SignInButton>
            )}
            <button className="btn btn-ghost btn-lg underline decoration-primary/30">
              Browse All
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="sticky top-20 z-10 bg-base-100/80 backdrop-blur-md py-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
             <h2 className="text-2xl font-bold">Featured Products</h2>
             {isFetching && <span className="loading loading-spinner loading-xs text-primary" />}
          </div>
          <div className="relative w-full sm:w-96">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-base-content/40" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="input input-bordered w-full pl-10 pr-10 bg-base-200 focus:input-primary transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-circle btn-xs hover:bg-base-300"
              >
                <XIcon className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PRODUCTS */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
          <PackageIcon className="size-5 text-primary" />
          All Products
        </h2>

        <div className={`transition-opacity duration-300 ${isFetching ? 'opacity-50' : 'opacity-100'}`}>
          {isLoading ? (
            <ProductGridSkeleton />
          ) : products.length === 0 ? (
            <div className="card bg-base-300">
              <div className="card-body items-center text-center py-16">
                <PackageIcon className="size-16 text-base-content/20" />
                <h3 className="card-title text-base-content/50">No products found</h3>
                <p className="text-base-content/40 text-sm">Try a different search term or check back later!</p>
                <Link to="/create" className="btn btn-primary btn-sm mt-2">
                  Create Product
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
export default HomePage;