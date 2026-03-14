import { useEffect, useState } from "react";

const HomePageSkeleton = () => {
  return (
    <div
      role="status"
      aria-label="Loading homepage"
      className="min-h-screen bg-base-100"
    >
      {/* Screen reader only loading message */}
      <span className="sr-only">Loading content, please wait...</span>

      {/* Header skeleton */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-base-200">
        {/* Logo placeholder */}
        <div className="h-8 w-24 bg-base-200 rounded-lg animate-pulse" />

        {/* Navigation placeholders */}
        <div className="flex items-center gap-4">
          <div className="h-8 w-16 bg-base-200 rounded-full animate-pulse hidden sm:block" />
          <div className="h-8 w-16 bg-base-200 rounded-full animate-pulse hidden sm:block" />
          <div className="h-8 w-24 bg-base-200 rounded-full animate-pulse" />
          <div className="h-8 w-24 bg-base-200 rounded-full animate-pulse" />
        </div>
      </header>

      {/* Hero section skeleton */}
      <section className="container mx-auto px-6 py-16 text-center">
        {/* Main heading */}
        <div className="max-w-3xl mx-auto">
          <div className="h-12 w-3/4 bg-base-200 rounded-lg animate-pulse mx-auto" />
          <div className="h-12 w-2/3 bg-base-200 rounded-lg animate-pulse mx-auto mt-4" />
        </div>

        {/* Subheading */}
        <div className="mt-8 max-w-xl mx-auto">
          <div className="h-6 w-full bg-base-200 rounded animate-pulse" />
          <div className="h-6 w-5/6 bg-base-200 rounded animate-pulse mx-auto mt-2" />
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
          <div className="h-12 w-32 bg-base-200 rounded-full animate-pulse" />
          <div className="h-12 w-32 bg-base-200 rounded-full animate-pulse" />
          <div className="h-12 w-32 bg-base-200 rounded-full animate-pulse" />
        </div>
      </section>

      {/* AllProducts heading */}
      <div className="container mx-auto px-6">
        <div className="h-8 w-40 bg-base-200 rounded animate-pulse mb-6" />
      </div>

      {/* Product grid skeleton */}
      <section className="container mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              {/* Image placeholder */}
              <div className="aspect-square bg-base-200 rounded-xl animate-pulse" />
              {/* Title placeholder */}
              <div className="h-4 w-3/4 bg-base-200 rounded animate-pulse" />
              {/* Price/other placeholder */}
              <div className="h-4 w-1/2 bg-base-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePageSkeleton;