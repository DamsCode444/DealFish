import { useProducts } from "../hooks/useProducts";
import { PackageIcon, SparklesIcon, ShoppingBagIcon, SearchIcon, XIcon, Loader2Icon } from "lucide-react";
import { Link } from "react-router";
import ProductGridSkeleton from "../components/ProductGridSkeleton";
import ProductCard from "../components/ProductCard";
import CategoryFilter from "../components/CategoryFilter";
import { SignInButton, useAuth } from "@clerk/clerk-react";
import { useState, useEffect, useRef, useCallback } from "react";

function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    status,
    isError,
    error,
    isFetching
  } = useProducts({ search: debouncedSearch, category: selectedCategory });

  const { isSignedIn } = useAuth();
  const observerRef = useRef();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const lastElementRef = useCallback(node => {
    if (isFetchingNextPage) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  if (isError) {
    return (
      <div role="alert" className="alert alert-error flex-col items-start gap-2">
        <span>Something went wrong fetching products.</span>
        <span className="text-xs opacity-70">{error.message}</span>
      </div>
    );
  }

  const allProducts = data?.pages.flatMap(page => page.data) || [];

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
      <div className="sticky top-0 z-20 bg-base-100/95 backdrop-blur-md py-4 mb-4 -mx-4 px-4 border-b border-base-content/5">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
             <h2 className="text-2xl font-bold">Featured Products</h2>
             {isFetching && !isFetchingNextPage && <span className="loading loading-spinner loading-xs text-primary" />}
          </div>
          <div className="relative w-full md:w-96">
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

      <CategoryFilter 
        selectedCategory={selectedCategory} 
        onSelectCategory={(cat) => setSelectedCategory(cat)} 
      />

      {/* PRODUCTS */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
          <PackageIcon className="size-5 text-primary" />
          {selectedCategory === "All" ? "All Products" : `${selectedCategory} category`}
        </h2>

        <div className={`transition-opacity duration-300 ${isFetching && !isFetchingNextPage ? 'opacity-50' : 'opacity-100'}`}>
          {status === "pending" ? (
            <ProductGridSkeleton />
          ) : allProducts.length === 0 ? (
            <div className="card bg-base-300">
              <div className="card-body items-center text-center py-16">
                <PackageIcon className="size-16 text-base-content/20" />
                <h3 className="card-title text-base-content/50">No products found</h3>
                <p className="text-base-content/40 text-sm">Try a different filter or search term!</p>
                <Link to="/create" className="btn btn-primary btn-sm mt-2">
                  Create Product
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {allProducts.map((product, index) => {
                  if (allProducts.length === index + 1) {
                    return (
                      <div ref={lastElementRef} key={product.id}>
                        <ProductCard product={product} />
                      </div>
                    );
                  } else {
                    return <ProductCard key={product.id} product={product} />;
                  }
                })}
              </div>
              
              {isFetchingNextPage && (
                <div className="flex justify-center py-12">
                   <div className="flex items-center gap-3 text-primary font-medium">
                      <Loader2Icon className="size-6 animate-spin" />
                      Loading more products...
                   </div>
                </div>
              )}
              
              {!hasNextPage && allProducts.length > 0 && (
                <div className="text-center py-12 text-base-content/30 italic">
                   You've reached the end of the collection
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
export default HomePage;