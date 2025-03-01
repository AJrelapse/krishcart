"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Define the expected category type
interface Category {
   id: string;
   title: string;
   description?: string | null;
   imageUrl?: string | null;
   createdAt?: Date;
   updatedAt?: Date;
}

interface CategoriesProps {
   categories: Category[];
}

export default function Categories({ categories }: CategoriesProps) {
   const scrollContainerRef = useRef<HTMLDivElement>(null);

   const scroll = (direction: "left" | "right") => {
      if (scrollContainerRef.current) {
         const scrollAmount = 250;
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
               className="flex space-x-3 p-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory w-full"
            >
               {categories.map((category) => (
                  <div 
                     key={category.id} 
                     className="flex flex-col items-center min-w-[80px] sm:min-w-[120px] md:min-w-[150px] snap-start"
                  >
                     <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden border">
                        {category.imageUrl ? (
                           <Image 
                              src={category.imageUrl} 
                              alt={category.title} 
                              width={112} 
                              height={112} 
                              className="w-full h-full object-cover"
                           />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <span className="text-gray-500 text-xs">No Image</span>
                           </div>
                        )}
                     </div>
                     <div className="mt-1 max-w-[64px] sm:max-w-[96px] md:max-w-[112px] break-words text-center text-xs sm:text-sm md:text-base font-medium">
                        {category.title}
                     </div>
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
