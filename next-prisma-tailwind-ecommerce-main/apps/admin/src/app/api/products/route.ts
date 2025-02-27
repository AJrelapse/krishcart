import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
   try {
      const userId = req.headers.get('X-USER-ID')
      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      const body = await req.json(); // ✅ Get form data
      console.log('Received Data:', body); // ✅ Debugging

      const { title, images, price, discount, stock, categoryId, brandId, isFeatured, isAvailable, description } = body;

      if (!title || !categoryId) {
         return new NextResponse('Title and Category ID are required', { status: 400 });
      }

      const existingBrand = await prisma.brand.findUnique({
         where: { id: brandId },
       });
       
       if (!existingBrand) {
         return new NextResponse('Invalid Brand ID', { status: 400 });
       }
       
       const product = await prisma.product.create({
         data: {
           title,
           images,
           price: Number(price),
           discount: Number(discount),
           stock: Number(stock),
           brandId,
           categories: { connect: [{ id: categoryId }] }, // Fix here
           isFeatured: Boolean(isFeatured),
           isAvailable: Boolean(isAvailable),
           description,
         },
       });
       
      console.log('Created Product:', product);
      return NextResponse.json(product);
   } catch (error) {
      console.error('[PRODUCTS_POST_ERROR]', error);
      return new NextResponse('Internal error', { status: 500 });
   }
}



export async function GET(req: Request) {
   try {
      const userId = req.headers.get('X-USER-ID')

      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      const { searchParams } = new URL(req.url)
      const categoryId = searchParams.get('categoryId') || undefined
      const isFeatured = searchParams.get('isFeatured')

      const products = await prisma.product.findMany()

      return NextResponse.json(products)
   } catch (error) {
      console.error('[PRODUCTS_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
