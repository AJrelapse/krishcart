"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Checkout() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [totalAmount, setTotalAmount] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<number>(0);

    const addresses = [
        {
            id: 0,
            name: "Ajay Anand",
            phone: "6374677263",
            address: "S-Block, Men's Hostel, VIT-College, Vellore-632014, Tamil Nadu",
            pincode: "632014",
        },
        {
            id: 1,
            name: "S.Murugadass",
            phone: "9894581114",
            address: "No 61, Navadhi 2nd cross, Dinnur, Hosur, Tamil Nadu",
            pincode: "635109",
        },
    ];

    useEffect(() => {
        const amount = searchParams.get("totalAmount");
        if (amount) setTotalAmount(parseFloat(amount));
    }, [searchParams]);

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-md">
            {/* Login Section */}
            <div className="border-b pb-4">
                <h2 className="text-lg font-semibold">1️⃣ LOGIN</h2>
                <p className="text-gray-700">Vaitheki K +919894581114</p>
            </div>

            {/* Delivery Address Section */}
            <div className="border-b py-4">
                <h2 className="text-lg font-semibold text-blue-600">2️⃣ DELIVERY ADDRESS</h2>
                {addresses.map((addr, index) => (
                    <div
                        key={addr.id}
                        className={`p-4 border rounded-md my-2 cursor-pointer ${
                            selectedAddress === addr.id ? "border-blue-500 bg-blue-100" : ""
                        }`}
                        onClick={() => setSelectedAddress(addr.id)}
                    >
                        <input
                            type="radio"
                            checked={selectedAddress === addr.id}
                            onChange={() => setSelectedAddress(addr.id)}
                            className="mr-2"
                        />
                        <span className="font-semibold">{addr.name}</span>
                        <span className="ml-2 text-gray-600">{addr.phone}</span>
                        <p className="text-sm text-gray-600">{addr.address} - <strong>{addr.pincode}</strong></p>
                    </div>
                ))}
                <button className="mt-2 text-blue-600">+ Add a new address</button>
            </div>

            {/* Order Summary Section */}
            <div className="border-b py-4">
                <h2 className="text-lg font-semibold">3️⃣ ORDER SUMMARY</h2>
                <p className="text-gray-700">Price (2 items): ₹{totalAmount || "1,227"}</p>
                <p className="text-green-600">Delivery Charges: <del>₹40</del> <strong>FREE</strong></p>
                <p>Platform Fee: ₹3</p>
                <h3 className="font-bold text-xl mt-2">Total Payable: ₹{totalAmount || "1,230"}</h3>
                <p className="text-green-600 text-sm">Your Total Savings on this order ₹2,268</p>
            </div>

            {/* Payment Button */}
            <div className="py-4">
                <button
                    className="w-full bg-orange-500 text-white py-2 rounded-md"
                    onClick={() => router.push(`/payment?amount=${totalAmount || 1230}`)}
                >
                    Continue to Payment
                </button>
            </div>
        </div>
    );
}
