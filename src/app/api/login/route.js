import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(request) {
    
  const body = await request.json();
  const name = body.name;
  const facebookId = body.facebookId;
  const provider = body.provider;

  if (!name || name.trim() === "") {
    return new Response(
      JSON.stringify({ error: "Name is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    let user = await prisma.user.findUnique({ where: { name } });

    if (!user) {
      // สร้าง user ใหม่พร้อม facebookId ถ้ามี
      const userData = { name };
      if (facebookId) {
        userData.facebookId = facebookId;
      }
      if (provider) {
        userData.provider = provider;
      }
      user = await prisma.user.create({ data: userData });
    } else if (facebookId && !user.facebookId) {
      // อัพเดท facebookId ถ้ายังไม่มี
      user = await prisma.user.update({
        where: { name },
        data: { 
          facebookId,
          provider: provider || user.provider
        }
      });
    }

    // เซ็ต cookie เก็บ name
    const cookieValue = encodeURIComponent(user.name); 
    const cookie = `token=${cookieValue}; Path=/; Max-Age=${60 * 60 * 24 * 365};`;

    return new Response(JSON.stringify({ success: true, user }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": cookie,
      },
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Something went wrong" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
