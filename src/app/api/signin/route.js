import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma'; // ปรับ path ตามของคุณ

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
      phone: body.phone,
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
