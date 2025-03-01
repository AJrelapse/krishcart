import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
       const categories = await prisma.category.findMany();
       const sanitizedCategories = categories.map(category => ({
          ...category,
          imageUrl: category.imageUrl || "/fallback-image.jpg" // Default image if null
       }));
 
       return NextResponse.json(sanitizedCategories);
    } catch (error) {
       return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }
 }
 