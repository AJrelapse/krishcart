import Razorpay from "razorpay";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { amount } = await req.json(); // Parse JSON from the request

        if (!amount) {
            return NextResponse.json({ success: false, message: "Amount is required" }, { status: 400 });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_SECRET_KEY!,
        });

        const order = await razorpay.orders.create({
            amount: amount * 100, // Convert to paisa
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        });

        return NextResponse.json({ success: true, order }, { status: 200 });
    } catch (error) {
        console.error("Razorpay Order Error:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}
