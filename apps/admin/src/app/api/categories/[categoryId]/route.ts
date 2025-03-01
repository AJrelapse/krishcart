import { PrismaClient } from "@prisma/client";
import { NextResponse } from 'next/server'
import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();

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
   { params }: { params: { categoryId: string } }
) {
   try {
      const userId = req.headers.get('X-USER-ID')

      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      const body = await req.json()
      const { title, description, imageUrl, bannerId} = body // ✅ Added `image`

      if (!bannerId) {
         return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 })
      }

      if (!title) {
         return NextResponse.json({ error: 'Title is required' }, { status: 400 })
      }

      if (!params.categoryId) {
         return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
      }

      // Check if category exists
      const existingCategory = await prisma.category.findUnique({
         where: { id: params.categoryId },
      })

      if (!existingCategory) {
         return NextResponse.json({ error: 'Category not found' }, { status: 404 })
      }

      let uploadedImageUrl = existingCategory.imageUrl; // Keep existing image if no new image

      // ✅ Upload image to Cloudinary if a new image is provided
      if (imageUrl && (imageUrl.startsWith('data:image') || imageUrl !== existingCategory.imageUrl)) {
         console.log("📤 Uploading new image to Cloudinary...");
         const uploadResponse = await cloudinary.v2.uploader.upload(imageUrl, {
            folder: "categories",
         });
         uploadedImageUrl = uploadResponse.secure_url;
         console.log("✅ Uploaded to Cloudinary:", uploadedImageUrl);
      }
      

      // Update category
      const updatedCategory = await prisma.category.update({
         where: {
            id: params.categoryId,
         },
         data: {
            title,
            description,
            imageUrl: imageUrl, // ✅ Store image URL
            banners: {
               connect: { id: bannerId },
            },
         },
      });
      console.log("✅ Database updated with:", updatedCategory);

      return NextResponse.json(updatedCategory);

   } catch (error) {
      console.error('[CATEGORY_PATCH]', error)
      return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
   }
}


