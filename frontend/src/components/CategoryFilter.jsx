import { useRef } from "react";
import { ChevronLeft, ChevronRight, Smartphone, Laptop, Shirt, Utensils, Zap, ShoppingBag, Footprints, Layers } from "lucide-react";

export const CATEGORIES = [
  { name: "All", icon: <Layers className="size-4" /> },
  { name: "Phones", icon: <Smartphone className="size-4" /> },
  { name: "Laptops", icon: <Laptop className="size-4" /> },
  { name: "Clothes", icon: <Shirt className="size-4" /> },
  { name: "Food", icon: <Utensils className="size-4" /> },
  { name: "Electronics", icon: <Zap className="size-4" /> },
  { name: "Fashion", icon: <ShoppingBag className="size-4" /> },
  { name: "Shoes", icon: <Footprints className="size-4" /> },
];

function CategoryFilter({ selectedCategory, onSelectCategory }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - 200 : scrollLeft + 200;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <div className="relative group mb-8">
      {/* Scroll Buttons */}
      <button 
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 btn btn-circle btn-xs bg-base-300 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex"
      >
        <ChevronLeft className="size-4" />
      </button>
      
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-3 py-2 scrollbar-hide scroll-smooth no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            onClick={() => onSelectCategory(cat.name)}
            className={`btn btn-sm rounded-full gap-2 whitespace-nowrap px-6 transition-all border-none ${
              selectedCategory === cat.name 
                ? "btn-primary shadow-lg shadow-primary/20 scale-105" 
                : "bg-base-300 hover:bg-base-200"
            }`}
          >
            {cat.icon}
            {cat.name}
          </button>
        ))}
      </div>

      <button 
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 btn btn-circle btn-xs bg-base-300 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex"
      >
        <ChevronRight className="size-4" />
      </button>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default CategoryFilter;
