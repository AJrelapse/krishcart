import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'


export async function GET(
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

      const category = await prisma.category.findUnique({
         where: {
            id: params.categoryId,
         },
      })

      return NextResponse.json(category)
   } catch (error) {
      console.error('[CATEGORY_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}


export async function POST(req: Request) {
   try {
      const userId = req.headers.get('X-USER-ID');

      if (!userId) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await req.json();
      console.log("Received body:", body);

      const { title, description, imageUrl, bannerId } = body;

      if (!title) {
         return NextResponse.json({ error: 'Title is required' }, { status: 400 });
      }

      if (!bannerId) {
         return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 });
      }

      // ✅ Check if a category with the same title already exists
      const existingCategory = await prisma.category.findUnique({
         where: { title }
      });

      if (existingCategory) {
         return NextResponse.json({ error: 'Category title already exists' }, { status: 400 });
      }

      // ✅ Proceed only if no duplicate is found
      const category = await prisma.category.create({
         data: {
            title,
            description,
            imageUrl,
            banners: {
               connect: [{ id: bannerId }]
            },
         },
      });

      return NextResponse.json(category, { status: 201 });

   } catch (error) {
      console.error('[CATEGORIES_POST]', error);

      // ✅ Handle Prisma Unique Constraint Error (P2002)
      if (error.code === 'P2002') {
         return NextResponse.json({ error: 'Category title already exists' }, { status: 400 });
      }

      return NextResponse.json({ error: 'Internal error' }, { status: 500 });
   }
}

