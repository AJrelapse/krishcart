import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
   try {
      // ✅ Get userId from headers
      const userId = req.headers.get('X-USER-ID');

      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 });
      }

      // ✅ Get user with their addresses
      const user = await prisma.user.findUnique({
         where: { id: userId },
         include: {
            addresses: true, // ✅ Corrected 'addresses' instead of 'address'
         },
      });

      if (!user) {
         return new NextResponse('User not found', { status: 404 });
      }

      // ✅ Get the first (default) address if available
      const userAddress = user.addresses.length > 0 ? user.addresses[0] : null;
      if (!userAddress) {
         return new NextResponse('User address not found', { status: 400 });
      }

      // ✅ Get cart items
      const cart = await prisma.cart.findUnique({
         where: { userId },
         include: {
            items: {
               include: {
                  product: true,
               },
            },
         },
      });

      if (!cart || cart.items.length === 0) {
         return new NextResponse('Cart is empty', { status: 400 });
      }

      // ✅ Extract payment details
      const { payment_id, order_id, amount } = await req.json();
      if (!payment_id || !order_id || !amount) {
         return new NextResponse('Invalid request data', { status: 400 });
      }

      // ✅ Transform cart items into order items
      const orderItems = cart.items.map(item => ({
         productId: item.product.id,
         price: item.product.price,
         count: item.count,
         discount: 0, // Assuming no discount initially
      }));

      // ✅ Create a new order with correct relations
      const newOrder = await prisma.order.create({
         data: {
            id: order_id,
            status: 'Processing',
            total: amount,
            payable: amount,
            isPaid: true,
            userId, // ✅ Associate user
            addressId: userAddress.id, // ✅ Associate user's address
            orderItems: {
               create: orderItems, // ✅ Use 'orderItems', not 'items'
            },
         },
         include: {
            orderItems: true,
         },
      });

      // ✅ Clear user's cart after order placement
      await prisma.cartItem.deleteMany({ where: { cartId: cart.userId } });
      return NextResponse.json({ success: true, order: newOrder });

   } catch (error) {
      console.error('[ORDER_CONFIRM_ERROR]', error);
      return new NextResponse('Internal error', { status: 500 });
   }
}
