import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { facebookId } = body;

    if (!facebookId) {
      return new Response(
        JSON.stringify({ error: "Facebook ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // เช็คว่ามี user ใน database หรือไม่
    const user = await prisma.user.findUnique({
      where: { fbId: facebookId }
    });

    if (user) {
      // ถ้ามี user แล้ว
      return new Response(JSON.stringify({ 
        exists: true, 
        user,
        needsPhoneNumber: !user.phone // ถ้าไม่มีเบอร์โทรให้กรอก
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } else {
      // ถ้ายังไม่มี user
      return new Response(JSON.stringify({ 
        exists: false,
        needsPhoneNumber: true
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

  } catch (error) {
    console.error("Error checking user:", error);
    return new Response(
      JSON.stringify({ error: "Something went wrong" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
} 