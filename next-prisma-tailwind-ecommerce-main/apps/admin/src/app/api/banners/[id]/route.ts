import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  console.log("Received params:", params); // Debugging

  try {
    if (!params?.id || params.id === "undefined") {
      return NextResponse.json({ error: "Valid ID is required" }, { status: 400 });
    }

    const body = await req.json();
    const { label, image } = body;

    const updatedBanner = await prisma.banner.update({
      where: { id: params.id },
      data: { label, image },
    });

    return NextResponse.json(updatedBanner, { status: 200 });
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: "Failed to update banner" }, { status: 500 });
  }
}

  

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
      if (!params?.id || params.id === "undefined") {
        return NextResponse.json({ error: "Valid ID is required" }, { status: 400 });
      }
  
      // Fetch the banner to get the image URL
      const banner = await prisma.banner.findUnique({
        where: { id: params.id },
        select: { image: true }, // Make sure 'image' is the correct field
      });
  
      if (!banner) {
        return NextResponse.json({ error: "Banner not found" }, { status: 404 });
      }
  
      // Extract public_id from the Cloudinary URL
      if (banner.image) {
        const publicId = banner.image.split('/').pop()?.split('.')[0]; // Extract publicId from URL
        await cloudinary.v2.uploader.destroy(publicId!);
      }
  
      // Delete the banner from the database
      await prisma.banner.delete({ where: { id: params.id } });
  
      return NextResponse.json({ message: "Banner deleted successfully" }, { status: 200 });
    } catch (error) {
      console.error("Delete Error:", error);
      return NextResponse.json({ error: "Failed to delete banner" }, { status: 500 });
    }
  }
