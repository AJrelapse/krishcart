import {
   BlogPostCard,
   BlogPostGrid,
   BlogPostSkeletonGrid,
} from '@/components/native/BlogCard'
import Carousel from '@/components/native/Carousel'
import { ProductGrid, ProductSkeletonGrid } from '@/components/native/Product'
import { Heading } from '@/components/native/heading'
import { Separator } from '@/components/native/separator'
import prisma from '@/lib/prisma'
import { isVariableValid } from '@/lib/utils'
import Categories from "@/components/native/Categories";
import FeaturedDeals from "@/components/native/FeaturedDeals";


export default async function Index() {


   const products = await prisma.product.findMany({
      include: {
         brand: true,
         categories: true,
      },
      take: 12, // Increase the limit to get more products
   });
   
   // Filter products with the highest discount
   const discountedProducts = products
      .filter((product) => product.discount > 0)
      .sort((a, b) => (b.discount / b.price) - (a.discount / a.price)) // Sort by highest discount percentage
      .slice(0, 10); // Show top 10 deals
   

   const blogs = await prisma.blog.findMany({
      include: { author: true },
      take: 3,
   })

   const banners = await prisma.banner.findMany()

   const categories = await prisma.category.findMany();

   return (
      <div className="flex flex-col border-neutral-200 dark:border-neutral-700">
         <Carousel images={banners.map((obj) => obj.image)} />
         <Separator className="my-8" />
         <Heading
            title="Shop By Categories"
            description="Below is a list of categories we have available for you."
         />
         <Categories categories={categories}/>
         <Separator className="my-8" />
         <Heading
            title="Products"
            description="Below is a list of products we have available for you."
         />
         {isVariableValid(products) ? (
            <ProductGrid products={products} />
         ) : (
            <ProductSkeletonGrid />
         )}

         <Separator className="my-8" />
         <Heading title="Featured Deals & Discounts 🔥" description="Grab these limited-time discounts!" />
         <FeaturedDeals products={discountedProducts} />
         <Separator className="my-8" />
         
         {isVariableValid(blogs) ? (
            <BlogPostGrid blogs={blogs} />
         ) : (
            <BlogPostSkeletonGrid />
         )}
      </div>
   )
}
