import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
   try {
      console.log("Fetching orders from DB...");

      const orders = await prisma.order.findMany({
         include: {
            orderItems: {
               include: {
                  product: true,
               },
            },
         },
      })

      console.log("Orders fetched:", orders);

      return NextResponse.json(orders)
   } catch (error) {
      console.error("Error fetching orders:", error)
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
   }
}
