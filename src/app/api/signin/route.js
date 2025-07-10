import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function POST(request) {
  const body = await request.json();
  const username = body.name;
  const pass = body.pass;
  const phone = body.phone;

  const user = await prisma.user.findFirst({
    where: {
      name: username,
      pass: pass, // plain-text password
    },
  });

  if (!user) {
   const create = await prisma.user.create({
    data: {
      name: username,
      pass: pass,
      phone: phone,
    },
   })
  }

  // Set cookie (ชื่อว่า "token" เก็บชื่อ user)
  cookies().set('token', user.name, {
    path: '/',
    maxAge: 60 * 60 * 24, // 1 วัน
  });

  return Response.json({ message: 'Login success', user });
}
