import { signJWT } from '@/lib/jwt'
import prisma from '@/lib/prisma'
import { getErrorResponse } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'

export async function POST(req: NextRequest) {
   try {
      const expiryMinutes = 30 * 24 * 60;
      let { email, OTP } = await req.json();

      email = email.toString().toLowerCase();

      if (!process.env.JWT_SECRET_KEY) {
         console.error('JWT secret key is missing');
         return getErrorResponse(500, 'Internal Server Error');
      }

      // 🔹 Handle Incorrect OTP Gracefully
      const user = await prisma.owner.findFirst({
         where: { email, OTP },
      });

      if (!user) {
         return getErrorResponse(400, 'Invalid OTP');  // Return proper error instead of throwing
      }

      const token = await signJWT(
         { sub: user.id },
         { exp: `${expiryMinutes}m` }
      );

      const tokenMaxAge = expiryMinutes * 60;
      const response = new NextResponse(
         JSON.stringify({
            status: 'success',
            token,
         }),
         {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
         }
      );

      response.cookies.set({
         name: 'token',
         value: token,
         httpOnly: true,
         path: '/',
         secure: process.env.NODE_ENV !== 'development',
         maxAge: tokenMaxAge,
      });

      response.cookies.set({
         name: 'logged-in',
         value: 'true',
         maxAge: tokenMaxAge,
      });

      return response;
   } catch (error) {
      console.error(error);
      if (error instanceof ZodError) {
         return getErrorResponse(400, 'Failed validations', error);
      }

      return getErrorResponse(500, error.message);
   }
}
