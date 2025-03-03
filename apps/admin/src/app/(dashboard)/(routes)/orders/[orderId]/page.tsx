"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import Link from "next/link";
import { OrderForm } from "./components/order-form";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { OrderStatusEnum } from '@/types/order'; // ✅ Import the enum


const statusOptions = [
   "Processing",
   "Shipped",
   "Delivered",
   "ReturnProcessing",
   "ReturnCompleted",
   "Cancelled",
   "RefundProcessing",
   "RefundCompleted",
   "Denied",
];

function UpdateOrderStatus({ currentStatus, orderId }) {
   const [status, setStatus] = useState(currentStatus);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

   const handleStatusChange = async (e) => {
      const newStatus = e.target.value;
      setStatus(newStatus);
      setLoading(true);

      try {
         const response = await fetch(`/api/orders/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
         });

         if (!response.ok) {
            throw new Error('Failed to update order status');
         }
      } catch (err) {
         setError(err.message);
      } finally {
         setLoading(false);
      }
   };

   return (
      <Card className="my-4 p-2">
         <CardHeader>
            <CardTitle>Update Order Status</CardTitle>
         </CardHeader>
         <CardContent>
            <select
               className="w-full p-2 border rounded"
               value={status}
               onChange={handleStatusChange}
               disabled={loading}
            >
               {statusOptions.map((option) => (
                  <option key={option} value={option}>
                     {option}
                  </option>
               ))}
            </select>
            {error && <p className="text-red-500 mt-2">{error}</p>}
         </CardContent>
      </Card>
   );
}

const OrderPage = () => {
   const { orderId } = useParams();
   const [order, setOrder] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      const fetchOrder = async () => {
         try {
            const response = await fetch(`/api/orders/${orderId}`);
            if (!response.ok) {
               throw new Error('Failed to fetch order');
            }
            const data = await response.json();
            console.log("API Response:", data);
            setOrder(data);
         } catch (err) {
            setError(err.message);
         } finally {
            setLoading(false);
         }
      };
      fetchOrder();
   }, [orderId]);

   if (loading) return <p>Loading...</p>;
   if (error) return <p>Error: {error}</p>;
   if (!order) return <p>Order not found</p>;

  return (
    <div className="flex flex-col gap-6">
      <Heading title={`Order #${order.number}`} description="Manage order details" />
      
      {/* Order Details */}
      <Card>
        <CardHeader>
          <CardTitle>Order Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Created At:</strong> {new Date(order.createdAt).toLocaleString()}</p>
          <p><strong>Is Paid:</strong> {order.isPaid ? "✅ Yes" : "❌ No"}</p>
          <p><strong>Is Completed:</strong> {order.isCompleted ? "✅ Yes" : "❌ No"}</p>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <p><strong>Total:</strong> ₹{order.total}</p>
          <p><strong>Shipping:</strong> ₹{order.shipping}</p>
          <p><strong>Tax:</strong> ₹{order.tax}</p>
          <p><strong>Discount:</strong> ₹{order.discount}</p>
          <p className="font-bold text-lg"><strong>Payable:</strong> ₹{order.payable}</p>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr>
                <th className="border p-2">Product</th>
                <th className="border p-2">Quantity</th>
                <th className="border p-2">Price</th>
                <th className="border p-2">Discount</th>
                <th className="border p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems.map((item) => (
                <tr key={item.productId} className="text-center">
                  <td className="border p-2">{item.product.title}</td>
                  <td className="border p-2">{item.count}</td>
                  <td className="border p-2">₹{item.price}</td>
                  <td className="border p-2">₹{item.discount}</td>
                  <td className="border p-2">₹{(item.count * item.price) - item.discount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <UpdateOrderStatus currentStatus={order.status} orderId={orderId} />

      {/* User Details */}
      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Name:</strong> {order.user.name}</p>
          <p><strong>Email:</strong> {order.user.email}</p>
          <p><strong>Phone:</strong> {order.user.phone}</p>
        </CardContent>
        <CardFooter>
          <Link href={`/users/${order.user.id}`} className="text-sm underline text-primary">View Profile</Link>
        </CardFooter>
      </Card>

      {/* Shipping Address */}
      {order.address && (
        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{order.address.address}, {order.address.city}, {order.address.state}</p>
            <p>{order.address.postalCode}, {order.address.country}</p>
          </CardContent>
        </Card>
      )}

      {/* Edit Order */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Order</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderForm initialData={order} />
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderPage;
