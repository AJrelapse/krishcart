import prisma from '@/lib/prisma'
import { generateSerial } from '@/lib/serial'
import { getErrorResponse } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import twilio from "twilio"

function isIndianPhoneNumberValid(phone: string) {
   return /^[6-9]\d{9}$/.test(phone)
}

const client = twilio(
   process.env.TWILIO_ACCOUNT_SID,
   process.env.TWILIO_AUTH_TOKEN
)

async function sendTransactionalSMS({ phone, OTP }) {
   try {
      const message = await client.messages.create({
         body: `Your OTP code is: ${OTP}`,
         from: process.env.TWILIO_PHONE_NUMBER,
         to: `+91${phone}`,
      })
      console.log("Twilio SMS Sent:", message.sid)
      return message
   } catch (error) {
      console.error("Twilio SMS Error:", error)
      return null
   }
}

export async function POST(req: NextRequest) {
   try {
      const OTP = generateSerial({})
      console.log("Generated OTP:", OTP)

      const { phone } = await req.json()

      // ✅ Validate Indian phone number
      if (!isIndianPhoneNumberValid(phone)) {
         return getErrorResponse(400, 'Invalid Phone Number')
      }

      // ✅ Fix duplicate +91 issue
      const formattedPhone = phone.startsWith("+91")
         ? phone
         : `+91${phone.replace(/^(\+91)/, "")}`

      console.log("Formatted Phone Number:", formattedPhone) // ✅ Debugging formatted number

      // ✅ Save user with OTP in the database
      const user = await prisma.user.upsert({
         where: { phone: phone.toString().toLowerCase() },
         update: { OTP },
         create: { phone: phone.toString().toLowerCase(), OTP },
      })

      console.log("User saved:", user)

      console.log("Sending OTP via SMS to:", formattedPhone)

      // ✅ Send OTP via SMS
      const smsResponse = await sendTransactionalSMS({ phone: formattedPhone, OTP })

      if (!smsResponse) {
         return getErrorResponse(500, "Failed to send OTP via Twilio")
      }

      console.log("Twilio SMS Response:", smsResponse)

      return new NextResponse(
         JSON.stringify({ status: 'success', phone }),
         { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
   } catch (error) {
      console.error(error)
      if (error instanceof ZodError) {
         return getErrorResponse(400, 'Failed validations', error)
      }
      return getErrorResponse(500, error.message)
   }
}
