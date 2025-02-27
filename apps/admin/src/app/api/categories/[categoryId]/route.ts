import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function DELETE(
   req: Request,
   { params }: { params: { categoryId: string } }
) {
   try {
      const userId = req.headers.get('X-USER-ID')

      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      if (!params.categoryId) {
         return new NextResponse('Category id is required', { status: 400 })
      }

      const category = await prisma.category.delete({
         where: {
            id: params.categoryId,
         },
      })

      return NextResponse.json(category)
   } catch (error) {
      console.error('[CATEGORY_DELETE]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function PATCH(
   req: Request,
   { params }: { params: { categoryId: string } } // ✅ Fix: Correct parameter name
) {
   try {
      const userId = req.headers.get('X-USER-ID')

      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      const body = await req.json()
      const { title, description, bannerId } = body

      if (!bannerId) {
         return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 })
      }

      if (!title) {
         return NextResponse.json({ error: 'Title is required' }, { status: 400 })
      }

      if (!params.categoryId) {  // ✅ Fix: Correct parameter name
         return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
      }

      // Check if category exists
      const existingCategory = await prisma.category.findUnique({
         where: { id: params.categoryId },
      })

      if (!existingCategory) {
         return NextResponse.json({ error: 'Category not found' }, { status: 404 })
      }

      // Update category
      const updatedCategory = await prisma.category.update({
         where: {
            id: params.categoryId,  // ✅ Fix: Correct parameter name
         },
         data: {
            title,
            description,
            banners: {  // ✅ Fix: Use "banners" if it's an array
               connect: { id: bannerId },
            },
         },
      })

      return NextResponse.json(updatedCategory)

   } catch (error) {
      console.error('[CATEGORY_PATCH]', error)
      return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
   }
}

