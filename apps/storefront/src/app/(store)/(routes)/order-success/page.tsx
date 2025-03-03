"use client";

import { useSearchParams } from "next/navigation";

export default function OrderSuccess() {
    const searchParams = useSearchParams();

    const paymentId = searchParams.get("payment_id");
    const orderId = searchParams.get("order_id");
    const amount = searchParams.get("amount");

    return (
        <div className="flex flex-col items-center justify-center h-screen text-center">
            <h1 className="text-2xl font-bold text-green-600">Payment Successful 🎉</h1>
            <p className="text-lg mt-2">Thank you for your purchase!</p>
            <div className="mt-4 p-4 bg-gray-100 rounded-md shadow">
                <p><strong>Order ID:</strong> {orderId}</p>
                <p><strong>Payment ID:</strong> {paymentId}</p>
                <p><strong>Amount Paid:</strong> ₹{amount}</p>
            </div>
            <a href="/" className="mt-6 px-4 py-2 bg-blue-500 text-white rounded">Go to Homepage</a>
        </div>
    );
}
