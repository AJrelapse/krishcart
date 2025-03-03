import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { OrderStatusEnum } from '@/types/order'; // ✅ Import the enum


export async function GET(req: Request, { params }: { params: { orderId: string } }) {
   try {
      console.log("Fetching order with ID:", params.orderId);

      const order = await prisma.order.findUnique({
         where: { id: params.orderId },
         include: {
            orderItems: {
               include: {
                  product: {
                     select: {
                        title: true,  // ✅ Fetch product name
                        price: true,
                     },
                  },
               },
            },
            user: true,
            address: true,  // ✅ Fetch shipping address
         },
      });

      if (!order) {
         return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      console.log("Fetched order:", order);
      return NextResponse.json(order);
   } catch (error) {
      console.error("Error fetching order:", error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
   }
}



export async function PATCH(req: Request, { params }: { params: { orderId: string } }) {
   try {
      const { status } = await req.json();

      if (!Object.values(OrderStatusEnum).includes(status as OrderStatusEnum)) {
         return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
      }
      

      const updatedOrder = await prisma.order.update({
         where: { id: params.orderId },
         data: { status },
      });

      return NextResponse.json(updatedOrder, { status: 200 });
   } catch (error) {
      console.error("Error updating order status:", error);
      return NextResponse.json({ message: 'Failed to update order status', error }, { status: 500 });
   }
}
