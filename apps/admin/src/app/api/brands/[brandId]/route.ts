import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
   req: Request,
   { params }: { params: { brandId: string } }
) {
   try {
      const userId = req.headers.get('X-USER-ID')

      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      if (!params.brandId) {
         return new NextResponse('Brand id is required', { status: 400 })
      }

      const category = await prisma.category.findUnique({
         where: {
            id: params.brandId,
         },
      })

      return NextResponse.json(category)
   } catch (error) {
      console.error('[CATEGORY_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function DELETE(
   req: Request,
   { params }: { params: { brandId: string } }
) {
   try {
      const userId = req.headers.get('X-USER-ID');

      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 });
      }

      if (!params.brandId) {
         return new NextResponse('Brand ID is required', { status: 400 });
      }

      // First, check if the brand exists
      const brand = await prisma.brand.findUnique({
         where: { id: params.brandId },
         include: { products: true }, // Include related products
      });

      if (!brand) {
         return new NextResponse('Brand not found', { status: 404 });
      }

      // Prevent deletion if products are linked to the brand
      if (brand.products.length > 0) {
         return new NextResponse(
            'Cannot delete brand because products are linked to it.',
            { status: 400 }
         );
      }

      // Delete the brand
      const deletedBrand = await prisma.brand.delete({
         where: { id: params.brandId },
      });

      return NextResponse.json(deletedBrand);
   } catch (error) {
      console.error('[BRAND_DELETE_ERROR]', error);
      return new NextResponse('Internal error', { status: 500 });
   }
}


export async function PATCH(
   req: Request,
   { params }: { params: { brandId: string } }
) {
   try {
      const userId = req.headers.get('X-USER-ID')

      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      const body = await req.json()

      const { title, description } = body
      console.log('PATCH', body)

      if (!title && !description) {
         return new NextResponse(
            'At least one field (title or description) is required',
            { status: 400 }
         )
      }

      if (!params.brandId) {
         return new NextResponse('Brand id is required', { status: 400 })
      }

      const updatedBrand = await prisma.brand.update({
         where: {
            id: params.brandId,
         },
         data: {
            ...(title && { title }),
            ...(description && { description }),
         },
      })

      return NextResponse.json(updatedBrand)
   } catch (error) {
      console.error('[BRAND_PATCH]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
