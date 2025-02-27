import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Handle GET request (Fetch all banners)
export async function GET() {
  try {
    const banners = await prisma.banner.findMany();
    return NextResponse.json(banners, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 });
  }
}

// Handle POST request (Create a new banner)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { label, image } = body;

    if (!label || !image) {
      return NextResponse.json({ error: "Label and image are required" }, { status: 400 });
    }

    const newBanner = await prisma.banner.create({
      data: { label, image },
    });

    return NextResponse.json(newBanner, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create banner" }, { status: 500 });
  }
}


