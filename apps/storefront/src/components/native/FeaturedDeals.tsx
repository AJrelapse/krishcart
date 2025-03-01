"use client";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/components/native/Product"; // Reuse the existing Product component

export default function FeaturedDeals({ products }) {
   const scrollContainerRef = useRef<HTMLDivElement>(null);

   const scroll = (direction: "left" | "right") => {
      if (scrollContainerRef.current) {
         const scrollAmount = 300;
         scrollContainerRef.current.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
         });
      }
   };

   return (
      <div className="relative px-4">
         <div className="relative flex items-center">
            <button 
               onClick={() => scroll("left")} 
               className="absolute left-0 z-10 bg-white shadow-md rounded-full p-2 hidden sm:flex"
            >
               <ChevronLeft size={24} />
            </button>

            <div 
               ref={scrollContainerRef}
               className="flex space-x-4 p-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory w-full"
            >
               {products.map((product) => (
                  <div key={product.id} className="snap-start min-w-[250px] sm:min-w-[280px] md:min-w-[300px]">
                     <Product product={product} />
                  </div>
               ))}
            </div>

            <button 
               onClick={() => scroll("right")} 
               className="absolute right-0 z-10 bg-white shadow-md rounded-full p-2 hidden sm:flex"
            >
               <ChevronRight size={24} />
            </button>
         </div>
      </div>
   );
}
