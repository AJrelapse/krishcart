import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import cloudinary from 'cloudinary';


export async function GET(
   req: Request,
   { params }: { params: { productId: string } }
) {
   try {
      const userId = req.headers.get('X-USER-ID')

      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      if (!params.productId) {
         return new NextResponse('Product id is required', { status: 400 })
      }

      const product = await prisma.product.findUniqueOrThrow({
         where: {
            id: params.productId,
         },
         select: {
            title: true,
            images: true,
            price: true,
            discount: true,
            stock: true,
            brandId: true,
            categories: true,
            isFeatured: true,
            isAvailable: true,
            description: true, // ✅ Include description
         }
      });

      return NextResponse.json(product)
   } catch (error) {
      console.error('[PRODUCT_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function POST(req: Request) {
   try {
      const userId = req.headers.get('X-USER-ID')
      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      const data = await req.json();  // Use the data directly from the request
      const { description } = data;

      const product = await prisma.product.create({
         data: {
            title: data.title,
            images: data.images,
            price: data.price,
            discount: data.discount,
            stock: data.stock,
            brandId: data.brandId,  // Assuming you're passing brandId
            categories: {
               connect: data.categories.map((categoryId: string) => ({ id: categoryId })),
            },
            isFeatured: data.isFeatured,
            isAvailable: data.isAvailable,
            description,
         },
      })

      return NextResponse.json(product)
   } catch (error) {
      console.error('[PRODUCTS_POST]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

cloudinary.v2.config({
   cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
   api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
   api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
});

export async function DELETE(
   req: Request,
   { params }: { params: { productId: string } }
) {
   try {
      const userId = req.headers.get('X-USER-ID');

      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 });
      }

      // Find the product to get the images
      const product = await prisma.product.findUnique({
         where: { id: params.productId },
         select: { images: true },
      });

      if (!product) {
         return new NextResponse('Product not found', { status: 404 });
      }

      // Extract Cloudinary public IDs from image URLs
      const publicIds = product.images.map((imgUrl) => {
         const parts = imgUrl.split('/');
         return parts[parts.length - 1].split('.')[0]; // Extract public ID
      });

      console.log("Deleting images from Cloudinary:", publicIds);

      // Delete images from Cloudinary
      for (const publicId of publicIds) {
         await cloudinary.v2.uploader.destroy(publicId);
      }

      // Delete product from database
      await prisma.product.delete({
         where: {
            id: params.productId,
         },
      });

      return NextResponse.json({ message: 'Product deleted successfully' });
   } catch (error) {
      console.error('[PRODUCT_DELETE]', error);
      return new NextResponse('Internal error', { status: 500 });
   }
}

export async function PATCH(req: Request, { params }: { params: { productId: string } }) {
   try {
      if (!params.productId) {
         return new NextResponse('Product ID is required', { status: 400 });
      }

      const userId = req.headers.get('X-USER-ID');
      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 });
      }

      // Parse request data
      const body = await req.json();
      console.log('Received Data:', body);

      const { title, images, price, discount, stock, brandId, categoryId, isFeatured, isAvailable, description } = body;

      if (!brandId) {
         return new NextResponse('Brand ID is required', { status: 400 });
      }

      // Ensure categories are updated correctly
      const product = await prisma.product.update({
         where: { id: params.productId },
         data: {
            title,
            images,
            price: Number(price),
            discount: Number(discount),
            stock: Number(stock),
            brandId,
            categories: categoryId ? { set: [{ id: categoryId }] } : undefined, // ✅ Fix for categories update
            isFeatured: Boolean(isFeatured),
            isAvailable: Boolean(isAvailable),
            description,
         },
      });

      console.log('Updated Product:', product);

      return NextResponse.json(product);
   } catch (error) {
      console.error('[PRODUCT_PATCH_ERROR]', error);
      return new NextResponse('Internal error', { status: 500 });
   }
}
