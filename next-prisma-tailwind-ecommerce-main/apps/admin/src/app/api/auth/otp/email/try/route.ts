import { generateSerial } from '@/lib/serial';
import { getErrorResponse, isEmailValid } from '@/lib/utils';
import { ZodError } from 'zod';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { config } from 'process';
import { sendMail } from '@/lib/mail';


export async function POST(req: NextRequest) {
   try {
      console.log("JWT_SECRET_KEY in API:", process.env.JWT_SECRET_KEY);

      if (!process.env.JWT_SECRET_KEY) {
         return getErrorResponse(500, 'JWT_SECRET_KEY is missing');
      }

      const OTP = generateSerial({ batchCount: 1, batchSize: 6, alphanumeric: false });
      const { email } = await req.json();

      if (!isEmailValid(email)) {
         return getErrorResponse(400, 'Incorrect Email');
      }

      // Upsert: Update if exists, otherwise create a new owner record
      const owner = await prisma.owner.upsert({
         where: { email },
         update: { OTP },
         create: { email, OTP },
      });

      // Use actual email HTML template instead of 'Mail'
      const emailContent = `
         <div>
            <h1>Verify your email</h1>
            <p>Your OTP is: <strong>${OTP}</strong></p>
            <p>Use this code to verify your email address.</p>
         </div>
      `;

      await sendMail({
         name: config.name,
         to: email,
         subject: 'Verify your email.',
         html: emailContent,
      });

      return new NextResponse(JSON.stringify({ status: 'success', email }), {
         status: 200,
         headers: { 'Content-Type': 'application/json' },
      });
   } catch (error) {
      console.error(error);
      if (error instanceof ZodError) {
         return getErrorResponse(400, 'Failed validations', error);
      }
      return getErrorResponse(500, error.message);
   }
}
