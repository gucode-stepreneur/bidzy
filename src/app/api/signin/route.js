import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function POST(request) {
  const body = await request.json();
  const username = body.username;
  const phone = parseInt(body.phone);
  

  try {
    let user = await prisma.user.findFirst({
      where: { name: username, phone },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { name: username, phone },
      });
    }

    cookies().set('token', user.name, {
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return Response.json({ success: true, message: 'Login success', user });
  } catch (err) {
    console.error(err);
    return Response.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
