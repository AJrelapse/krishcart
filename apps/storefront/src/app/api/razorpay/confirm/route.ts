import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
   try {
      // ✅ Extract userId from request headers
      const userId = req.headers.get('X-USER-ID');

      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 });
      }

      // ✅ Check if user exists
      const userExists = await prisma.user.findUnique({
         where: { id: userId },
      });

      if (!userExists) {
         return new NextResponse('User not found', { status: 404 });
      }

      // ✅ Extract payment details from request body
      const { payment_id, order_id, amount } = await req.json();

      if (!payment_id || !order_id || !amount) {
         return new NextResponse('Invalid request data', { status: 400 });
      }

      // ✅ Save order details in database
      const newOrder = await prisma.order.create({
         data: {
            id: order_id,
            status: 'Processing',
            total: amount,
            payable: amount,
            isPaid: true,
            userId, // ✅ Use extracted userId
         },
      });

      return NextResponse.json({ success: true, order: newOrder });

   } catch (error) {
      console.error('[ORDER_CONFIRM_ERROR]', error);
      return new NextResponse('Internal error', { status: 500 });
   }
}
