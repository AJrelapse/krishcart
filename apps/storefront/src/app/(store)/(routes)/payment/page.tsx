"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function Payment() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [totalAmount, setTotalAmount] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const amount = searchParams.get("amount");
        if (amount) setTotalAmount(parseFloat(amount));
    }, [searchParams]);

    const handlePayment = async () => {
        if (!totalAmount) {
            alert("Total amount is missing!");
            return;
        }
    
        setLoading(true);
    
        try {
            // ✅ Load Razorpay script dynamically
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.async = true;
            document.body.appendChild(script);
    
            script.onload = async () => {
                const response = await fetch("/api/razorpay", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ amount: totalAmount, currency: "INR" }),
                });
    
                const data = await response.json();
                console.log("Razorpay Order Response:", data);
    
                // ✅ Handle case where `data.order` is missing
                if (!data || !data.order) {
                    console.error("❌ Error: Invalid API response", data);
                    alert("Failed to create Razorpay order. Please try again.");
                    return;
                }
    
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount: data.order.amount, // ✅ Now it's safe to access `amount`
                    currency: "INR",
                    name: "KrishCart",
                    description: "Order Payment",
                    order_id: data.order.id,
                    handler: async function (response) {
                        console.log("🛒 Payment Response:", response);
                        if (response.razorpay_payment_id) {
                            alert("Payment Successful! 🎉");
                    
                            // ✅ Save order in the database
                            await fetch("/api/razorpay/confirm", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    payment_id: response.razorpay_payment_id,
                                    order_id: response.razorpay_order_id,
                                    amount: data.order.amount / 100, // Convert to rupees
                                }),
                            });
                    
                            // ✅ Redirect to order success page
                            router.push(`/order-success?payment_id=${response.razorpay_payment_id}&order_id=${response.razorpay_order_id}&amount=${data.order.amount / 100}`);
                        } else {
                            alert("Payment Failed. Please try again.");
                        }
                    },
                    prefill: {
                        name: "John Doe",
                        email: "john@example.com",
                        contact: "9999999999",
                    },
                    theme: { color: "#F37254" },
                };
    
                if (window.Razorpay) {
                    const rzp = new window.Razorpay(options);
                    rzp.open();
                } else {
                    throw new Error("Razorpay SDK failed to load. Refresh and try again.");
                }
            };
        } catch (error) {
            alert("Payment failed. Please try again.");
            console.error("Payment Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md mt-10 text-center">
            <h2 className="text-lg font-semibold">Complete Your Payment</h2>
            <p className="text-gray-600 mb-4">Total Payable: ₹{totalAmount}</p>
            <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
                onClick={handlePayment}
                disabled={loading}
            >
                {loading ? "Processing..." : `Pay ₹${totalAmount}`}
            </button>
        </div>
    );
}
